'use strict';
const http = require('node:http');
const { Buffer } = require('buffer');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const db = require('../db');
const token = db('tokens');
const errorHandler = require('../lib/errorHandler')
const restrictAccess = require('../lib/restrictAccess');
const { ACCESS_CONTROL } = require('../roles');

const receiveArgs = async (req) => {
    try {
        const buffers = [];
        for await (const chunk of req) buffers.push(chunk);
        const data = Buffer.concat(buffers).toString();
        return data.trim() ? JSON.parse(data) : undefined;
    } catch {
        return undefined;
    }
};

const receiveRawBody = async (req) => {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    return Buffer.concat(buffers);
};

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.xml': 'text/xml',
    '.ico': 'image/x-icon'
};


// const allowedOrigin = 'https://cemubribepit.beget.app';
module.exports = (routing, port) => {
    const server = http.createServer(async (req, res) => {
        // const origin = req.headers.origin;
        // if (allowedOrigins.includes(origin)) {
        //     res.setHeader('Access-Control-Allow-Origin', origin);
        // } else {
        //     res.setHeader('Access-Control-Allow-Origin', '');
        // }
        // Разрешаем только твой фронтенд (в продакшене — конкретный домен!)
        

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, refresh-token, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

      
        try {
            const { url, socket, method } = req;
            const urlObj = new URL(req.url, `http://${req.headers.host}`);

            if (urlObj.pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server is running' }));
            return;
        }

            const pathParts = urlObj.pathname.substring(1).split('/');
            const [place] = pathParts;

            if (place === 'api') {
                const [, name, action] = pathParts;
                const entity = routing[name];
                if (!entity) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end('"Not found"');
                    return;
                }
                const handler = entity[action];
                if (!handler) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end('"Not found"');
                    return;
                }

                const token = req.headers.authorization || null;
                let args;
                if (method === 'GET' || method === 'DELETE') {
                    args = Object.fromEntries(urlObj.searchParams.entries());
                } else if (method === 'POST') {
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('multipart/form-data')) {
                        const rawBody = await receiveRawBody(req);
                        args = { headers: req.headers, body: rawBody };
                    } else {
                        args = await receiveArgs(req);
                    }
                }

                const cleanUrl = `/api/${name}/${action}`;
                if (Object.keys(ACCESS_CONTROL).includes(cleanUrl)) {
                    req.user = restrictAccess(token, cleanUrl);
                }

                req.server = server;

                const result = await handler(args, req, res); // Добавляем req и res
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
                console.log(`${socket.remoteAddress} ${req.method} ${url}`);
                return;
            }

            // Обработка статических файлов
            let filePath;
            if (urlObj.pathname.startsWith('/uploads')) {
                filePath = path.join(__dirname, '../../uploads', urlObj.pathname.substring('/uploads'.length));
                console.log(`Trying to serve upload file: ${filePath}`);
            }

            try {
                const data = await fs.readFile(filePath);
                const ext = path.extname(filePath).toLowerCase();
                const contentType = mimeTypes[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
                console.log(`${socket.remoteAddress} ${method} ${url} - File served`);
            } catch (err) {
                console.error(`Error reading upload file ${filePath}: ${err.message}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                console.log(`${socket.remoteAddress} ${method} ${url} - Upload file not found`);
            }
        } catch (error) {
        console.error(error);
        const errorResponse = errorHandler(error);
        res.writeHead(errorResponse.status || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
        message: errorResponse.message || 'Внутренняя ошибка сервера',
        type: errorResponse.type,
        status: errorResponse.status || 500,
        detail: errorResponse.detail || 'Unknown error'
    }));
}
    });

    
    
    cron.schedule('0 * * * *', async () => {
        try {
            const sql = 'DELETE FROM tokens WHERE expires_at < NOW() RETURNING *;';
            const result = await token.query(sql);
            console.log(`Удалено истёкших токенов: ${result.rowCount}`);
        } catch (error) {
            console.error('Ошибка очистки токенов:', error);
        }
    });

    server.listen(port, '0.0.0.0', () => {
        console.log(`API server on port ${port}`)
    });

    require('../websocket.js')(server)
    return server;
};