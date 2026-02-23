const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Paradise Delivery...');
console.log('📁 Current directory:', __dirname);
console.log('🔧 PORT:', PORT);

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Health check - MUST work
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app-final.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

// Handle errors
server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down...');
    server.close(() => {
        process.exit(0);
    });
});

module.exports = app;
