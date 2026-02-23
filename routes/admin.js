const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Get admin dashboard stats
router.get('/stats', (req, res) => {
    const stats = {};
    
    // Today's orders
    db.get(
        `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
         FROM orders
         WHERE date(created_at) = date('now')`,
        (err, row) => {
            if (err) {
                console.error(err);
            }
            stats.todayOrders = row ? row.count : 0;
            stats.todayRevenue = row ? row.revenue : 0;
            
            // Active drivers
            db.get(
                `SELECT COUNT(*) as count FROM driver_profiles WHERE is_online = 1`,
                (err, row) => {
                    if (err) {
                        console.error(err);
                    }
                    stats.activeDrivers = row ? row.count : 0;
                    
                    // Pending driver applications
                    db.get(
                        `SELECT COUNT(*) as count FROM driver_profiles WHERE onboarding_status = 'documents_pending'`,
                        (err, row) => {
                            if (err) {
                                console.error(err);
                            }
                            stats.pendingApplications = row ? row.count : 0;
                            
                            res.json(stats);
                        }
                    );
                }
            );
        }
    );
});

// Get all orders (admin)
router.get('/orders', (req, res) => {
    const { limit = 50, offset = 0, status } = req.query;
    
    let query = `
        SELECT 
            o.*,
            r.name as restaurant_name,
            c.first_name as customer_first_name,
            c.last_name as customer_last_name
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users c ON o.customer_id = c.id
    `;
    
    const params = [];
    
    if (status) {
        query += ' WHERE o.status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ orders: rows });
    });
});

// Get pending driver applications
router.get('/drivers/pending', (req, res) => {
    db.all(
        `SELECT 
            u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at,
            dp.onboarding_status, dp.background_check_status, dp.vehicle_year
        FROM users u
        JOIN driver_profiles dp ON u.id = dp.user_id
        WHERE dp.onboarding_status IN ('documents_pending', 'background_check')
        ORDER BY u.created_at DESC`,
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ drivers: rows });
        }
    );
});

// Get financial summary
router.get('/finances', (req, res) => {
    const { period = 'week' } = req.query;
    
    let dateFilter;
    if (period === 'week') {
        dateFilter = "created_at >= date('now', '-7 days')";
    } else if (period === 'month') {
        dateFilter = "created_at >= date('now', '-30 days')";
    } else {
        dateFilter = "1=1";
    }
    
    db.get(
        `SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as gross_revenue,
            COALESCE(SUM(subtotal * 0.18), 0) as commission_earned,
            COALESCE(SUM(delivery_fee), 0) as delivery_fees
        FROM orders
        WHERE ${dateFilter}`,
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                period,
                summary: row
            });
        }
    );
});

module.exports = router;