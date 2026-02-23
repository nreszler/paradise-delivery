console.log('>>> STARTING SERVER');

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('>>> PORT:', PORT);

// Static files
app.use(express.static(path.join(__dirname)));

// Root route - serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app-final.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('>>> SERVER RUNNING ON PORT', PORT);
});
