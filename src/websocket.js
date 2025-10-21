'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService')
const getOrderByStatus = require('./use-cases/order/getOrderByStatus')
module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });

  const clients = new Map();

  wss.on('connection', async (ws, req) => {
    console.log('Client connected:', req.socket.remoteAddress);

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (token) {
      try {
        const decoded = TokenService.verifyAccessToken(token);
        clients.set(ws, { username: decoded.username, subscribed: [] });
        ws.username = decoded.username;
      } catch (error) {
        ws.close(1008, 'Invalid token');
        return;
      }
    }

    if (ws.username) {
      try {
        const initialOrders = await getOrderByStatus();
        console.log(initialOrders);
        
        ws.send(JSON.stringify({ type: 'initial_orders', data: initialOrders }));
      } catch (error) {
        console.error('Error fetching initial orders:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to load initial orders' }));
      }
    }

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      if (data.type === 'subscribe_orders') {
        clients.get(ws)?.subscribed.push('orders');
        console.log(`${ws.username || 'Anonymous'} subscribed to orders`);
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