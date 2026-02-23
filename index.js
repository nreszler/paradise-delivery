const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE SETUP ==========
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbPath = process.env.RENDER ? '/tmp/paradise.db' : './paradise.db';
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to SQLite database');
});

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        license_number TEXT,
        insurance_info TEXT,
        vehicle_type TEXT,
        status TEXT DEFAULT 'pending',
        is_online INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        cuisine_type TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        phone TEXT,
        email TEXT,
        commission_rate REAL DEFAULT 18.0,
        status TEXT DEFAULT 'pending',
        rating REAL DEFAULT 5.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER,
        name TEXT,
        description TEXT,
        price REAL,
        category TEXT,
        is_available INTEGER DEFAULT 1,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        restaurant_id INTEGER,
        driver_id INTEGER,
        items TEXT,
        subtotal REAL,
        delivery_fee REAL,
        tax REAL,
        total REAL,
        status TEXT DEFAULT 'pending',
        delivery_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        stripe_payment_intent_id TEXT,
        amount REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Seed demo data
db.get("SELECT COUNT(*) as count FROM restaurants", (err, row) => {
    if (row.count === 0) {
        console.log('Seeding demo data...');
        db.run(`INSERT INTO restaurants (name, description, cuisine_type, address, city, state, zip, phone, email, status, rating) 
                VALUES ('Maria''s Kitchen', 'Authentic Mexican food', 'Mexican', '6491 Clark Rd', 'Paradise', 'CA', '95969', '(530) 555-0123', 'maria@example.com', 'active', 4.8)`);
        
        db.run(`INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES 
                (1, 'Chips & Guacamole', 'Fresh avocado with house-made chips', 6.99, 'Appetizers'),
                (1, 'Maria''s Special Burrito', 'Flour tortilla with rice, beans, cheese, salsa', 12.35, 'Burritos'),
                (1, 'California Burrito', 'Carne asada, fries, cheese, sour cream', 13.99, 'Burritos'),
                (1, 'Street Tacos (3)', 'Corn tortillas with meat, onions, cilantro', 10.29, 'Tacos'),
                (1, 'Horchata', 'House-made rice drink with cinnamon', 3.99, 'Drinks')`);
    }
});

// ========== STRIPE SETUP ==========
const stripe = process.env.STRIPE_SECRET_KEY ? 
    require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Restaurants
app.get('/api/restaurants', (req, res) => {
    db.all("SELECT * FROM restaurants WHERE status = 'active'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/restaurants/:id', (req, res) => {
    db.get("SELECT * FROM restaurants WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(row);
    });
});

app.get('/api/restaurants/:id/menu', (req, res) => {
    db.all("SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1", 
        [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ restaurantId: req.params.id, menu: rows });
    });
});

// Orders
app.post('/api/orders', (req, res) => {
    const { user_id, restaurant_id, items, subtotal, delivery_fee, tax, total, delivery_address } = req.body;
    
    db.run(`INSERT INTO orders (user_id, restaurant_id, items, subtotal, delivery_fee, tax, total, delivery_address, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [user_id, restaurant_id, JSON.stringify(items), subtotal, delivery_fee, tax, total, delivery_address],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, status: 'pending' });
        });
});

app.get('/api/orders/:id', (req, res) => {
    db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Order not found' });
        if (row.items) row.items = JSON.parse(row.items);
        res.json(row);
    });
});

// Stripe Payments
app.post('/api/payments/create-intent', async (req, res) => {
    if (!stripe) {
        // Mock payment for testing without Stripe keys
        return res.json({ 
            clientSecret: 'mock_secret_' + Date.now(),
            amount: req.body.amount || 2000,
            mock: true
        });
    }
    
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount || 2000,
            currency: 'usd',
            automatic_payment_methods: { enabled: true }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Drivers
app.post('/api/drivers', (req, res) => {
    const { name, email, phone, license_number, vehicle_type } = req.body;
    
    db.run(`INSERT INTO drivers (name, email, phone, license_number, vehicle_type, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')`,
        [name, email, phone, license_number, vehicle_type],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, status: 'pending', message: 'Application submitted!' });
        });
});

app.get('/api/drivers', (req, res) => {
    db.all("SELECT * FROM drivers ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Restaurant Partners
app.post('/api/restaurants/apply', (req, res) => {
    const { name, email, phone, address, city, state, zip, cuisine_type } = req.body;
    
    db.run(`INSERT INTO restaurants (name, email, phone, address, city, state, zip, cuisine_type, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [name, email, phone, address, city, state, zip, cuisine_type],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, status: 'pending', message: 'Application submitted!' });
        });
});

// Admin Routes
app.get('/api/admin/dashboard', (req, res) => {
    db.get("SELECT COUNT(*) as totalOrders FROM orders", [], (err, orders) => {
        db.get("SELECT COUNT(*) as totalDrivers FROM drivers", [], (err, drivers) => {
            db.get("SELECT COUNT(*) as totalRestaurants FROM restaurants WHERE status = 'active'", [], (err, restaurants) => {
                res.json({
                    orders: orders.totalOrders,
                    drivers: drivers.totalDrivers,
                    restaurants: restaurants.totalRestaurants
                });
            });
        });
    });
});

app.get('/api/admin/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(row => { if (row.items) row.items = JSON.parse(row.items); });
        res.json(rows);
    });
});

// ========== STATIC FILES & FRONTEND ==========

// Driver portal
app.get('/driver-portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'driver-portal.html'));
});

// Restaurant partners
app.get('/restaurant-partners', (req, res) => {
    res.sendFile(path.join(__dirname, 'restaurant-partners.html'));
});

// Admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Static files
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app-final.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.url });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Paradise Delivery server running on port', PORT);
});

module.exports = app;
