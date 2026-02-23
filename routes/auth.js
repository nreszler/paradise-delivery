const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register new customer
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    try {
        // Check if email exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (row) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            db.run(
                `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status) 
                 VALUES (?, ?, ?, ?, ?, 'customer', 'active')`,
                [email, passwordHash, firstName, lastName, phone || null],
                function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    const userId = this.lastID;

                    // Create customer profile
                    db.run(
                        'INSERT INTO customer_profiles (user_id) VALUES (?)',
                        [userId],
                        function(err) {
                            if (err) {
                                console.error(err);
                            }

                            // Generate JWT
                            const token = jwt.sign(
                                { id: userId, email, role: 'customer' },
                                JWT_SECRET,
                                { expiresIn: '7d' }
                            );

                            res.status(201).json({
                                success: true,
                                message: 'Registration successful',
                                token,
                                user: {
                                    id: userId,
                                    email,
                                    firstName,
                                    lastName,
                                    role: 'customer'
                                }
                            });
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        db.get(
            'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = ?',
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                if (user.status !== 'active') {
                    return res.status(403).json({ error: 'Account is not active' });
                }

                // Verify password
                const isValid = await bcrypt.compare(password, user.password_hash);
                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Generate JWT
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, email, first_name, last_name, phone, role, status, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err || !user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    createdAt: user.created_at
                }
            });
        }
    );
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;