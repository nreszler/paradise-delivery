console.log('>>> STARTING SERVER...');

try {
    const express = require('express');
    console.log('>>> Express loaded');
    
    const path = require('path');
    console.log('>>> Path loaded');
    
    const app = express();
    const PORT = process.env.PORT || 3000;
    console.log('>>> PORT:', PORT);
    console.log('>>> DIR:', __dirname);
    
    // Basic middleware
    app.use(express.json());
    console.log('>>> Middleware added');
    
    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', time: new Date().toISOString() });
    });
    console.log('>>> Health route added');
    
    // Root route
    app.get('/', (req, res) => {
        res.send('<h1>Paradise Delivery</h1><p>Server is running!</p>');
    });
    console.log('>>> Root route added');
    
    // Start listening
    console.log('>>> About to listen on port', PORT);
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('>>> SERVER RUNNING ON PORT', PORT);
    });
    
    server.on('error', (err) => {
        console.error('>>> SERVER ERROR:', err.message);
        console.error(err.stack);
    });
    
} catch (err) {
    console.error('>>> CRASH:', err.message);
    console.error('>>> STACK:', err.stack);
    process.exit(1);
}

// Keep alive
setInterval(() => {
    console.log('>>> still alive', new Date().toISOString());
}, 30000);
