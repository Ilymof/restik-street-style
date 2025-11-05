'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService');
const getOrderByStatus = require('./use-cases/order/getOrderByStatus');

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });

  const clients = new Map();

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    console.log('Client connected:', req.socket.remoteAddress, 'Token:', token ? 'present' : 'missing');

    let isAuthorized = false;
    if (token) {
      try {
        const decoded = TokenService.verifyAccessToken(token);
        clients.set(ws, { username: decoded.username, subscribed: [] });
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
        } else if (data.type === 'subscribe_orders') {
          clients.get(ws)?.subscribed.push('orders');
          console.log(`${ws.username} subscribed to orders`);
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown request type' }));
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  function notifyOrdersUpdate(changeType, orderData, targetUsers = null) {
    const message = JSON.stringify({ type: 'orders_update', changeType, data: orderData });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && 
          clients.get(client)?.subscribed.includes('orders') &&
          (!targetUsers || targetUsers.includes(client.username))) {
        client.send(message);
      }
    });
  }

  return { wss, notifyOrdersUpdate };
};