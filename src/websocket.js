'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService');
const getOrderByStatus = require('./use-cases/order/getOrderByStatus');
const userOrders = require('./use-cases/order/userOrders');
const throwValidationError = require('./lib/ValidationError');

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });
  const clients = new Map(); // Map<WebSocket, { username: string, subscribed: string[] }>

  wss.on('connection', (ws, req) => {
    // Парсим query-параметры из URL подключения
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const secretKey = url.searchParams.get('secret_key');

    let username = null;
    let verifiedToken = null;

    // Пытаемся верифицировать токен для username (если передан)
    if (token) {
      try {
        verifiedToken = TokenService.verifyAccessToken(token);
        username = verifiedToken.username || 'anonymous'; // Предполагаем поле username в токене
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        ws.close(1008, 'Invalid token'); // Закрываем соединение при неверном токене
        return;
      }
    }

    // Сохраняем клиента в Map (по умолчанию подписан на 'orders')
    clients.set(ws, { username, subscribed: ['orders'] });

    console.log(`Клиент подключился (username: ${username || 'no token'}, token: ${!!token}, secret_key: ${!!secretKey})`);

    ws.on('message', async (message) => { // async для возможных Promise в use-cases
      try {
        const data = JSON.parse(message.toString());
        const { type } = data;
        console.log(`Получен тип: ${type} от ${username || 'anonymous'}`);

        let response;
        switch (type) {
          case 'all-orders':
            if (!token) {
              throwValidationError('Token required for all-orders');
            }
            try {
              const allOrders = await getOrderByStatus(); // Если sync — уберите await
              response = { type: 'orders', orders: allOrders };
            } catch (err) {
              response = { type: 'error', message: err.message || 'Failed to fetch all orders' };
            }
            break;

          case 'user-orders':
            if (!secretKey) {
              throwValidationError('secret_key required for user-orders');
            }
            try {
              const userOrdersList = await userOrders(secretKey); // Если sync — уберите await
              response = { type: 'orders', orders: userOrdersList };
            } catch (err) {
              response = { type: 'error', message: err.message || 'Failed to fetch user orders' };
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
      console.log(`Клиент отключился (username: ${username || 'anonymous'})`);
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
      clients.delete(ws);
    });
  });

  function notifyOrdersUpdate(changeType, orderData, targetUsers = null) {
    const message = JSON.stringify({ type: 'orders_update', changeType, data: orderData });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const clientInfo = clients.get(client);
        if (clientInfo?.subscribed.includes('orders') &&
            (!targetUsers || targetUsers.includes(clientInfo.username))) {
          client.send(message);
        }
      }
    });
  }
  return { wss, notifyOrdersUpdate };
};