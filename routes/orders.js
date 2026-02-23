const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Calculate delivery fee based on distance
const calculateDeliveryFee = (distanceMiles) => {
    if (distanceMiles <= 2) return 2.49;
    if (distanceMiles <= 4) return 3.49;
    if (distanceMiles <= 7) return 4.49;
    if (distanceMiles <= 11) return 5.49;
    return 5.99; // 11+ miles
};

// Calculate driver pay
const calculateDriverPay = (distanceMiles) => {
    const basePay = 5.00;
    const mileagePay = distanceMiles * 0.60;
    return {
        basePay,
        mileagePay,
        total: basePay + mileagePay
    };
};

// Create new order
router.post('/create', [
    body('customerId').isInt(),
    body('restaurantId').isInt(),
    body('items').isArray({ min: 1 }),
    body('deliveryAddress').trim().notEmpty(),
    body('distanceMiles').isFloat({ min: 0 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, restaurantId, items, deliveryAddress, deliveryLat, deliveryLng, distanceMiles, tipAmount = 0, specialInstructions } = req.body;

    try {
        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.price * item.quantity;
        }

        const deliveryFee = calculateDeliveryFee(distanceMiles);
        const taxRate = 0.08;
        const taxAmount = (subtotal + deliveryFee) * taxRate;
        const totalAmount = subtotal + deliveryFee + taxAmount + tipAmount;

        const orderNumber = 'PD' + Date.now().toString().slice(-8);

        // Start transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Insert order
            db.run(
                `INSERT INTO orders (
                    order_number, customer_id, restaurant_id, status,
                    subtotal, tax_amount, delivery_fee, tip_amount, total_amount,
                    delivery_address, delivery_latitude, delivery_longitude,
                    distance_miles, special_instructions
                ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [orderNumber, customerId, restaurantId, subtotal, taxAmount, deliveryFee, tipAmount, totalAmount,
                 deliveryAddress, deliveryLat, deliveryLng, distanceMiles, specialInstructions],
                function(err) {
                    if (err) {
                        console.error(err);
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to create order' });
                    }

                    const orderId = this.lastID;

                    // Insert order items
                    const itemStmt = db.prepare(
                        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
                         VALUES (?, ?, ?, ?, ?, ?)`
                    );

                    let itemsInserted = 0;
                    for (const item of items) {
                        itemStmt.run(
                            orderId, item.menuItemId, item.quantity, item.price, 
                            item.price * item.quantity, item.specialInstructions || null,
                            function(err) {
                                if (err) {
                                    console.error(err);
                                }
                                itemsInserted++;
                                if (itemsInserted === items.length) {
                                    itemStmt.finalize();
                                    
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).json({ error: 'Failed to commit order' });
                                        }

                                        res.status(201).json({
                                            success: true,
                                            orderId,
                                            orderNumber,
                                            totalAmount,
                                            deliveryFee,
                                            message: 'Order created successfully'
                                        });
                                    });
                                }
                            }
                        );
                    }
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order by ID
router.get('/:orderId', (req, res) => {
    const { orderId } = req.params;

    const query = `
        SELECT 
            o.*,
            r.name as restaurant_name, r.phone as restaurant_phone, r.address as restaurant_address,
            c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone,
            d.first_name as driver_first_name, d.last_name as driver_last_name, d.phone as driver_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users c ON o.customer_id = c.id
        LEFT JOIN users d ON o.driver_id = d.id
        WHERE o.id = ?
    `;

    db.get(query, [orderId], (err, order) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get order items
        db.all(
            `SELECT oi.*, mi.name as item_name 
             FROM order_items oi 
             JOIN menu_items mi ON oi.menu_item_id = mi.id 
             WHERE oi.order_id = ?`,
            [orderId],
            (err, items) => {
                if (err) {
                    console.error(err);
                }

                res.json({
                    order,
                    items: items || []
                });
            }
        );
    });
});

// Get customer's orders
router.get('/customer/:customerId', (req, res) => {
    const { customerId } = req.params;

    const query = `
        SELECT 
            o.id, o.order_number, o.status, o.total_amount, o.created_at,
            r.name as restaurant_name,
            COUNT(oi.id) as item_count
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    db.all(query, [customerId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ orders: rows });
    });
});

// Get restaurant's orders
router.get('/restaurant/:restaurantId', (req, res) => {
    const { restaurantId } = req.params;
    const { status } = req.query;

    let query = `
        SELECT 
            o.id, o.order_number, o.status, o.total_amount, o.subtotal,
            o.delivery_address, o.special_instructions, o.created_at,
            c.first_name, c.last_name, c.phone,
            d.first_name as driver_first_name, d.last_name as driver_last_name
        FROM orders o
        JOIN users c ON o.customer_id = c.id
        LEFT JOIN users d ON o.driver_id = d.id
        WHERE o.restaurant_id = ?
    `;

    const params = [restaurantId];

    if (status) {
        query += ' AND o.status = ?';
        params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ orders: rows });
    });
});

// Get available orders for drivers
router.get('/available/driver', (req, res) => {
    const query = `
        SELECT 
            o.id, o.order_number, o.total_amount, o.delivery_address,
            o.distance_miles, o.created_at,
            r.name as restaurant_name, r.address as restaurant_address, r.latitude, r.longitude,
            o.delivery_latitude, o.delivery_longitude
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.status IN ('confirmed', 'ready')
        AND o.driver_id IS NULL
        ORDER BY o.created_at ASC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ orders: rows });
    });
});

// Assign driver to order
router.post('/:orderId/assign-driver', (req, res) => {
    const { orderId } = req.params;
    const { driverId } = req.body;

    db.run(
        `UPDATE orders SET driver_id = ?, status = 'picked_up', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [driverId, orderId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to assign driver' });
            }

            // Create driver earnings record
            db.get('SELECT distance_miles FROM orders WHERE id = ?', [orderId], (err, row) => {
                if (err || !row) return;

                const driverPay = calculateDriverPay(row.distance_miles);

                db.get('SELECT id FROM driver_profiles WHERE user_id = ?', [driverId], (err, driver) => {
                    if (err || !driver) return;

                    db.run(
                        `INSERT INTO driver_earnings (driver_id, order_id, earning_type, amount, distance_miles, description)
                         VALUES (?, ?, 'delivery_base', ?, ?, 'Base delivery pay')`,
                        [driver.id, orderId, driverPay.basePay, row.distance_miles]
                    );

                    db.run(
                        `INSERT INTO driver_earnings (driver_id, order_id, earning_type, amount, distance_miles, description)
                         VALUES (?, ?, 'delivery_mileage', ?, ?, 'Mileage reimbursement')`,
                        [driver.id, orderId, driverPay.mileagePay, row.distance_miles]
                    );
                });
            });

            res.json({
                success: true,
                message: 'Driver assigned successfully'
            });
        }
    );
});

// Update order status
router.post('/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    let updateQuery = `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    let params = [status];

    if (status === 'delivered') {
        updateQuery += `, actual_delivery_time = CURRENT_TIMESTAMP`;
    }

    updateQuery += ` WHERE id = ?`;
    params.push(orderId);

    db.run(updateQuery, params, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`
        });
    });
});

// Cancel order
router.post('/:orderId/cancel', (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    db.get('SELECT status FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (row.status === 'delivered') {
            return res.status(400).json({ error: 'Cannot cancel delivered order' });
        }

        db.run(
            `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [orderId],
            function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to cancel order' });
                }

                // Log cancellation
                db.run(
                    `INSERT INTO audit_log (action, entity_type, entity_id, notes) 
                     VALUES ('order_cancelled', 'order', ?, ?)`,
                    [orderId, reason]
                );

                res.json({
                    success: true,
                    message: 'Order cancelled successfully'
                });
            }
        );
    });
});

module.exports = router;