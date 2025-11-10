'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService');
const getOrderByStatus = require('./use-cases/order/getOrderByStatus');
const userOrders = require('./use-cases/order/userOrders');
const updateOrderStatus = require('./use-cases/order/updateOrderStatus'); // Use-case для обновления
const throwValidationError = require('./lib/ValidationError');

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });
  const clients = new Map(); // Map<WebSocket, { username?: string, secretKey?: string, subscribed: string[] }>

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const secretKey = url.searchParams.get('secret_key');

    let username = null;
    let verifiedToken = null;

    // Верификация токена только для админов
    if (token) {
      try {
        verifiedToken = TokenService.verifyAccessToken(token);
        username = verifiedToken.username || null;
        if (!username) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid username in token' }));
          ws.close(1008, 'Invalid token');
          return;
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        ws.close(1008, 'Invalid token');
        return;
      }
    }

    // Для клиентов: secretKey обязателен, username = null
    // Для админов: token обязателен, secretKey = null (или игнорируем, если передан)
    if (!token && !secretKey) {
      ws.send(JSON.stringify({ type: 'error', message: 'Token or secret_key required' }));
      ws.close(1008, 'Auth required');
      return;
    }

    // Сохраняем: для админов — username, для клиентов — secretKey
    clients.set(ws, { 
      username: username || null, 
      secretKey: secretKey || null,
      subscribed: ['orders'] 
    });

    const clientType = username ? 'admin' : 'client';
    console.log(`Клиент подключился (${clientType}: ${username || secretKey?.substring(0, 8) + '...'} )`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { type } = data;
        const clientInfo = clients.get(ws);
        const isAdmin = !!clientInfo.username;
        const isClient = !!clientInfo.secretKey;

        console.log(`Получен тип: ${type} от ${isAdmin ? clientInfo.username : 'client'}`);

        let response;
        switch (type) {
          case 'all-orders':
            if (!isAdmin) {
              throwValidationError('Admin token required for all-orders');
            }
            try {
              const allOrders = await getOrderByStatus();
              response = { type: 'orders', orders: allOrders };
            } catch (err) {
              response = { type: 'error', message: err.message || 'Failed to fetch all orders' };
            }
            break;

          case 'user-orders':
            if (!isClient) {
              throwValidationError('secret_key required for user-orders');
            }
            try {
              const userOrdersList = await userOrders(secretKey);
              response = { type: 'orders', orders: userOrdersList };
            } catch (err) {
              response = { type: 'error', message: err.message || 'Failed to fetch user orders' };
            }
            break;

          case 'update-order-status': // Только для админов
            if (!isAdmin) {
              throwValidationError('Admin token required for update');
            }
            const { orderId, newStatus } = data;
            if (!orderId || !newStatus) {
              throwValidationError('orderId and newStatus required');
            }
            try {
              // Use-case возвращает { updatedOrder, ownerSecretKey }
              const result = await updateOrderStatus(orderId, newStatus);
              const { updatedOrder: orderData, ownerSecretKey } = result;

              // Уведомляем владельца (по secret_key) + всех админов
              notifyOrderUpdate('status_updated', orderData, ownerSecretKey);

              response = { type: 'success', message: 'Order status updated', order: orderData };
            } catch (err) {
              response = { type: 'error', message: err.message || 'Failed to update order' };
            }
            break;

          default:
            response = { type: 'error', message: 'Unknown type' };
        }

        ws.send(JSON.stringify(response));
      } catch (err) {
        console.error('Message handler error:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON or processing error' }));
      }
    });

    ws.on('close', () => {
      const clientInfo = clients.get(ws);
      console.log(`Клиент отключился (${!!clientInfo.username ? 'admin' : 'client'}: ${clientInfo.username || 'anonymous'})`);
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      clients.delete(ws);
    });
  });

  // Уведомление: владельцу по secret_key + всем админам
  function notifyOrderUpdate(changeType, orderData, ownerSecretKey) {
    const message = JSON.stringify({ type: 'orders_update', changeType, data: orderData });

    // 1. Уведомляем владельца (клиента) по secret_key, если онлайн
    if (ownerSecretKey) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const clientInfo = clients.get(client);
          if (clientInfo?.secretKey === ownerSecretKey && clientInfo.subscribed.includes('orders')) {
            client.send(message);
            console.log(`Уведомление владельцу по secret_key: ${ownerSecretKey.substring(0, 8)}...`);
          }
        }
      });
    }

    // 2. Уведомляем всех админов (с username, подписанных на 'orders')
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const clientInfo = clients.get(client);
        if (clientInfo?.username && clientInfo.subscribed.includes('orders')) {
          client.send(message);
          console.log(`Уведомление админу: ${clientInfo.username}`);
        }
      }
    });
  }

  return { wss, notifyOrderUpdate };
};