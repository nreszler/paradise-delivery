const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Demo restaurant data
const restaurant = {
    id: 1,
    name: "Maria's Kitchen",
    cuisine: "Mexican",
    rating: 4.8,
    deliveryTime: "25-40 min",
    menu: [
        { id: 1, name: "Chips & Guacamole", price: 6.99, category: "Appetizers" },
        { id: 2, name: "Maria's Special Burrito", price: 12.35, category: "Burritos" },
        { id: 3, name: "California Burrito", price: 13.99, category: "Burritos" },
        { id: 4, name: "Street Tacos (3)", price: 10.29, category: "Tacos" },
        { id: 5, name: "Horchata (Large)", price: 3.99, category: "Drinks" }
    ]
};

// API Routes
app.get('/api/restaurants', (req, res) => {
    res.json([restaurant]);
});

app.get('/api/restaurants/:id', (req, res) => {
    res.json(restaurant);
});

app.get('/api/restaurants/:id/menu', (req, res) => {
    res.json(restaurant.menu);
});

// Stripe payment intent (mock for now)
app.post('/api/payments/create-intent', (req, res) => {
    res.json({ 
        clientSecret: 'mock_secret_' + Date.now(),
        amount: req.body.amount || 2000
    });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app-final.html'));
});

// Static files
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port', PORT);
});
