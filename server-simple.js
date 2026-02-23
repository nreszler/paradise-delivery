const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting minimal server...');

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('<h1>Paradise Delivery</h1><p>Server is running!</p>');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
