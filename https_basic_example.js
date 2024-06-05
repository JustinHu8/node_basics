import https from 'https';
import fs from 'fs';
import url from 'url';
import path from 'path';
import { parse } from 'querystring';
import morgan from 'morgan';

// Create a write stream (in append mode) for logging
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Create a logger middleware
const logger = morgan('combined', { stream: logStream });

// SSL certificate
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const requestHander = (req, res) => {
    // Log the request
    logger(req, res, () => {});

    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (req.method === 'GET') {
        if (pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, World!');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else if (req.method === 'POST') {
        if (pathname === '/data') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const data = parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else if (req.method === 'PUT') {
        if (pathname === '/data') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            const data = parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Data updated', data }));
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
    } else if (req.method === 'DELETE') {
        if (pathname === '/data') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Data deleted' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
};

const server = https.createServer(options, (req, res) => {
    try {
        requestHander(req, res);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

server.listen(3000, () => {
   console.log('Server running at https://localhost:3000/');
});
