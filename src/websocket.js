'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService');
const getOrderByStatus = require('./use-cases/order/getOrderByStatus');

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    let isAuthorized = false;
    if (token) {
      try {
        const decoded = TokenService.verifyAccessToken(token);
        ws.username = decoded.username;
        isAuthorized = true;
        console.log(`Authorized: ${decoded.username}`);
      } catch (error) {
        console.error('Token verification error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        ws.close(1008, 'Invalid token');
        return;
      }
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Message from ${ws.username || 'Anonymous'}:`, data.type);

        if (!isAuthorized) {
          ws.send(JSON.stringify({ type: 'error', message: 'Authorization required' }));
          return;
        }

        if (data.type === 'get_orders') {
          const orders = await getOrderByStatus();
          ws.send(JSON.stringify({ type: 'orders_read', data: orders }));
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown request type' }));
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return { wss };
};