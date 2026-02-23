const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Get all restaurants
router.get('/', (req, res) => {
    const { status, cuisine, search } = req.query;
    
    let query = `
        SELECT 
            id, name, description, cuisine_type, address, city, state, zip,
            latitude, longitude, phone, email, rating, total_orders,
            commission_rate, logo_url, status, created_at
        FROM restaurants
        WHERE status = 'active'
    `;
    
    const params = [];
    
    if (cuisine) {
        query += ' AND cuisine_type = ?';
        params.push(cuisine);
    }
    
    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY rating DESC, total_orders DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ restaurants: rows });
    });
});

// Get restaurant by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT * FROM restaurants WHERE id = ?`,
        [id],
        (err, restaurant) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!restaurant) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }
            
            // Get hours
            db.all(
                'SELECT * FROM restaurant_hours WHERE restaurant_id = ? ORDER BY day_of_week',
                [id],
                (err, hours) => {
                    if (err) {
                        console.error(err);
                    }
                    
                    res.json({
                        restaurant,
                        hours: hours || []
                    });
                }
            );
        }
    );
});

// Get restaurant menu
router.get('/:id/menu', (req, res) => {
    const { id } = req.params;
    
    // Check if restaurant exists
    db.get('SELECT id FROM restaurants WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        // Get menu categories with items
        db.all(
            `SELECT 
                c.id as category_id,
                c.name as category_name,
                c.description as category_description,
                i.id as item_id,
                i.name as item_name,
                i.description as item_description,
                i.price,
                i.image_url,
                i.is_available,
                i.dietary_info
            FROM menu_categories c
            LEFT JOIN menu_items i ON c.id = i.category_id
            WHERE c.restaurant_id = ? AND (i.is_available = 1 OR i.id IS NULL)
            ORDER BY c.sort_order, i.sort_order`,
            [id],
            (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Organize by category
                const menu = {};
                rows.forEach(row => {
                    if (!menu[row.category_id]) {
                        menu[row.category_id] = {
                            id: row.category_id,
                            name: row.category_name,
                            description: row.category_description,
                            items: []
                        };
                    }
                    
                    if (row.item_id) {
                        menu[row.category_id].items.push({
                            id: row.item_id,
                            name: row.item_name,
                            description: row.item_description,
                            price: row.price,
                            imageUrl: row.image_url,
                            isAvailable: row.is_available,
                            dietaryInfo: row.dietary_info
                        });
                    }
                });
                
                res.json({ menu: Object.values(menu) });
            }
        );
    });
});

// Create restaurant application
router.post('/apply', (req, res) => {
    const { name, email, phone, address, cuisine, ownerName, message } = req.body;
    
    db.run(
        `INSERT INTO restaurants (name, email, phone, address, cuisine_type, description, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [name, email, phone, address, cuisine, message],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to submit application' });
            }
            
            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                restaurantId: this.lastID
            });
        }
    );
});

module.exports = router;