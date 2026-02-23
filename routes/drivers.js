const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, '../database/paradise.db'));

// JWT secret (use env variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// DRIVER ONBOARDING ENDPOINTS

// Step 1: Submit initial application
router.post('/apply', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('zip').trim().notEmpty(),
    body('vehicleYear').isInt({ min: 2000, max: 2030 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, zip, vehicleYear } = req.body;

    try {
        // Check if email exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (row) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert user
            db.run(
                `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, status) 
                 VALUES (?, ?, ?, ?, ?, 'driver', 'pending')`,
                [email, passwordHash, firstName, lastName, phone],
                function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    const userId = this.lastID;

                    // Create driver profile
                    db.run(
                        `INSERT INTO driver_profiles (user_id, vehicle_year, onboarding_status) 
                         VALUES (?, ?, 'documents_pending')`,
                        [userId, vehicleYear],
                        function(err) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Failed to create driver profile' });
                            }

                            res.status(201).json({
                                success: true,
                                message: 'Application submitted successfully',
                                driverId: userId,
                                nextStep: 'document_upload'
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

// Step 2: Upload documents
router.post('/:driverId/documents', authenticateToken, (req, res) => {
    const { driverId } = req.params;
    const { documentType, filePath } = req.body;

    // Validate driver owns this profile
    if (req.user.id !== parseInt(driverId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.get('SELECT id FROM driver_profiles WHERE user_id = ?', [driverId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        db.run(
            `INSERT INTO driver_documents (driver_id, document_type, file_path) 
             VALUES (?, ?, ?)`,
            [row.id, documentType, filePath],
            function(err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to save document' });
                }

                res.json({
                    success: true,
                    message: 'Document uploaded successfully',
                    documentId: this.lastID
                });
            }
        );
    });
});

// Step 3: Get driver onboarding status
router.get('/:driverId/status', authenticateToken, (req, res) => {
    const { driverId } = req.params;

    if (req.user.id !== parseInt(driverId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const query = `
        SELECT 
            u.id, u.first_name, u.last_name, u.email, u.phone, u.status as user_status,
            dp.onboarding_status, dp.background_check_status, dp.license_number,
            dp.vehicle_year, dp.total_earnings, dp.total_deliveries, dp.rating,
            dp.bank_account_number IS NOT NULL as has_bank_info
        FROM users u
        JOIN driver_profiles dp ON u.id = dp.user_id
        WHERE u.id = ?
    `;

    db.get(query, [driverId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Get document status
        db.all(
            `SELECT document_type, verified FROM driver_documents WHERE driver_id = ?`,
            [row.id],
            (err, documents) => {
                if (err) {
                    console.error(err);
                }

                res.json({
                    driver: row,
                    documents: documents || [],
                    onboardingSteps: [
                        { step: 'application', status: 'completed', label: 'Application Submitted' },
                        { step: 'documents', status: documents && documents.length >= 2 ? 'completed' : 'pending', label: 'Document Upload' },
                        { step: 'background_check', status: row.background_check_status, label: 'Background Check' },
                        { step: 'approval', status: row.onboarding_status === 'approved' ? 'completed' : 'pending', label: 'Account Approval' }
                    ]
                });
            }
        );
    });
});

// Step 4: Add banking information
router.post('/:driverId/banking', authenticateToken, (req, res) => {
    const { driverId } = req.params;
    const { accountNumber, routingNumber } = req.body;

    if (req.user.id !== parseInt(driverId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // In production, encrypt this data!
    db.run(
        `UPDATE driver_profiles 
         SET bank_account_number = ?, bank_routing_number = ?
         WHERE user_id = ?`,
        [accountNumber, routingNumber, driverId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save banking info' });
            }

            res.json({
                success: true,
                message: 'Banking information saved'
            });
        }
    );
});

// ADMIN ENDPOINTS

// Get all drivers (admin only)
router.get('/', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const query = `
        SELECT 
            u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at,
            dp.onboarding_status, dp.background_check_status, dp.total_deliveries, dp.rating, dp.is_online
        FROM users u
        JOIN driver_profiles dp ON u.id = dp.user_id
        WHERE u.role = 'driver'
        ORDER BY u.created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ drivers: rows });
    });
});

// Approve driver (admin only)
router.post('/:driverId/approve', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { driverId } = req.params;

    db.run(
        `UPDATE driver_profiles SET onboarding_status = 'approved' WHERE user_id = ?`,
        [driverId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to approve driver' });
            }

            db.run(
                `UPDATE users SET status = 'active' WHERE id = ?`,
                [driverId],
                function(err) {
                    if (err) {
                        console.error(err);
                    }

                    res.json({
                        success: true,
                        message: 'Driver approved successfully'
                    });
                }
            );
        }
    );
});

// Reject driver (admin only)
router.post('/:driverId/reject', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { driverId } = req.params;
    const { reason } = req.body;

    db.run(
        `UPDATE driver_profiles SET onboarding_status = 'rejected' WHERE user_id = ?`,
        [driverId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to reject driver' });
            }

            // Log rejection reason
            db.run(
                `INSERT INTO audit_log (user_id, action, entity_type, entity_id, notes) 
                 VALUES (?, 'driver_rejected', 'driver', ?, ?)`,
                [req.user.id, driverId, reason]
            );

            res.json({
                success: true,
                message: 'Driver application rejected'
            });
        }
    );
});

// Verify document (admin only)
router.post('/:driverId/documents/:documentId/verify', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { documentId } = req.params;
    const { verified, notes } = req.body;

    db.run(
        `UPDATE driver_documents 
         SET verified = ?, verified_at = CURRENT_TIMESTAMP, verified_by = ?, notes = ?
         WHERE id = ?`,
        [verified ? 1 : 0, req.user.id, notes, documentId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to verify document' });
            }

            res.json({
                success: true,
                message: `Document ${verified ? 'verified' : 'rejected'}`
            });
        }
    );
});

// Update driver status (online/offline)
router.post('/:driverId/status', authenticateToken, (req, res) => {
    const { driverId } = req.params;
    const { isOnline, latitude, longitude } = req.body;

    if (req.user.id !== parseInt(driverId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run(
        `UPDATE driver_profiles 
         SET is_online = ?, current_latitude = ?, current_longitude = ?, last_location_update = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [isOnline ? 1 : 0, latitude, longitude, driverId],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update status' });
            }

            res.json({
                success: true,
                message: `Driver is now ${isOnline ? 'online' : 'offline'}`
            });
        }
    );
});

// Get driver's earnings
router.get('/:driverId/earnings', authenticateToken, (req, res) => {
    const { driverId } = req.params;

    if (req.user.id !== parseInt(driverId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const query = `
        SELECT 
            de.*,
            o.order_number,
            o.status as order_status
        FROM driver_earnings de
        LEFT JOIN orders o ON de.order_id = o.id
        WHERE de.driver_id = ?
        ORDER BY de.created_at DESC
        LIMIT 50
    `;

    db.all(query, [driverId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ earnings: rows });
    });
});

module.exports = router;