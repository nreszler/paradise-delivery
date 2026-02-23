const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Get menu items for a restaurant
router.get('/restaurant/:restaurantId', (req, res) => {
    const { restaurantId } = req.params;
    
    db.all(
        `SELECT mi.*, mc.name as category_name, mc.sort_order as category_sort
         FROM menu_items mi
         JOIN menu_categories mc ON mi.category_id = mc.id
         WHERE mi.restaurant_id = ? AND mi.is_available = 1
         ORDER BY mc.sort_order, mi.sort_order`,
        [restaurantId],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ items: rows });
        }
    );
});

// Get single menu item
router.get('/:itemId', (req, res) => {
    const { itemId } = req.params;
    
    db.get(
        `SELECT mi.*, mc.name as category_name
         FROM menu_items mi
         JOIN menu_categories mc ON mi.category_id = mc.id
         WHERE mi.id = ?`,
        [itemId],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            res.json({ item: row });
        }
    );
});

module.exports = router;