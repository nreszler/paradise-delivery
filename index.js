console.log('STARTING');
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/api/health') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({status: 'ok'}));
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Paradise Delivery is running!\n');
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log('RUNNING ON PORT', port);
});
