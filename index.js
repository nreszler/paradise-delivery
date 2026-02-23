const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server on port', PORT);

// Health check FIRST
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app-final.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading page');
        }
    });
});

// Static files
app.use(express.static(__dirname));

// 404 handler
app.use((req, res) => {
    res.status(404).send('Not found: ' + req.url);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port', PORT);
});
