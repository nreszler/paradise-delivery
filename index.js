#!/usr/bin/env node
console.log('>>> SCRIPT START');

const http = require('http');
const PORT = process.env.PORT || 3000;

console.log('>>> PORT:', PORT);
console.log('>>> CWD:', process.cwd());
console.log('>>> FILE:', __filename);

const server = http.createServer((req, res) => {
    console.log('>>> REQUEST:', req.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello from Paradise Delivery\n');
});

console.log('>>> ABOUT TO LISTEN');

server.listen(PORT, () => {
    console.log('>>> SERVER RUNNING ON PORT', PORT);
});

server.on('error', (err) => {
    console.error('>>> SERVER ERROR:', err);
});

console.log('>>> SETUP COMPLETE');
