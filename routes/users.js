const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// Get user by ID (admin only)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        'SELECT id, email, first_name, last_name, phone, role, status, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ user: row });
        }
    );
});

// Update user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone } = req.body;
    
    db.run(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [firstName, lastName, phone, id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update user' });
            }
            
            res.json({ success: true, message: 'User updated' });
        }
    );
});

module.exports = router;