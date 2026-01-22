'use strict';
const WebSocket = require('ws');
const TokenService = require('./services/auth/JWTService');
const getOrderByStatus = require('./use-cases/order/getOrderByStatus');
const {notifyGuest} = require('./lib/push-notifications.js')
const userOrders = require('./use-cases/order/userOrders');
const throwValidationError = require('./lib/ValidationError');
const accessOrder = require('./use-cases/order/accessOrder.js');
const { log } = require('console');

module.exports = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer });
  const clients = new Map();

  function send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  function broadcast(filterFn, payload) {
    for (const [client, info] of clients.entries()) {
      if (client.readyState === WebSocket.OPEN && filterFn(info)) {
        send(client, payload);
      }
    }
  }

  httpServer.notifyOrdersUpdate = async function (changeType, orders, ownerSecretKey = null) {
    if (ownerSecretKey) {
      const clientPayload = {
        type: 'orders',
        changeType,
        orders
      };
      broadcast(
        (info) => info.role === 'client' && info.secretKey === ownerSecretKey,
        clientPayload
      );
    }
    const adminPayload = {
      type: 'orders',
      changeType,
      orders
    };
    broadcast((info) => info.role === 'admin', adminPayload);
  };

  function authenticate(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const secretKey = url.searchParams.get('secret_key');

    if (!token && !secretKey) throwValidationError('Token or secret_key required');

    if (token) {
      const decoded = TokenService.verifyAccessToken(token);
      if (!decoded?.username) throwValidationError('Invalid admin token');
      return { role: 'admin', username: decoded.username };
    }

    return { role: 'client', secretKey };
    
  }

  // ===========================
  // ВХОДЯЩИЕ СООБЩЕНИЯ
  // ===========================
  const handlers = {
    async "user-orders"(ws, info) {
      if (info.role !== 'client') throwValidationError('secret_key required');
      const list = await userOrders(info.secretKey);
      send(ws, { type: "orders", changeType: "updated", orders: list });
    },

    async "all-orders"(ws, info) {
      if (info.role !== 'admin') throwValidationError('Admin token required');
      const list = await getOrderByStatus();
      send(ws, { type: "orders", changeType: "updated",orders: list });
    }, 

    async "update-status"(ws, info, data) {
      const { id, status } = data.action || {};

      if (!id || !status) {
        send(ws, { type: 'error', message: 'Missing id or status in action' });
        return;
      }
      if (info.role !== 'admin') throwValidationError('Admin token required');
      const result = await accessOrder(id, status);
      const updatedOrder = result[0]
      await httpServer.notifyOrdersUpdate('update_status', result, updatedOrder.secret_key);
      try {
        await notifyGuest(
          updatedOrder.secret_key,
          `Изменение статуса заказа`,
          `Статус вашего заказа №${updatedOrder.id} поменялся на ${updatedOrder.current_status}`,
          '/order-history'
        )
      } catch (err) {
        console.error('Не удалось отправить push админам:', err)
      }
    }

  };

  // ===========================
  // СОБЫТИЕ ПОДКЛЮЧЕНИЯ
  // ===========================
  wss.on('connection', (ws, req) => {
    let info;
    try {
      info = authenticate(req);
    } catch (err) {
      send(ws, { type: 'error', message: err.message });
      ws.close();
      return;
    }

    clients.set(ws, info);

    ws.on('message', async (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        send(ws, { type: 'error', message: 'Invalid JSON' });
        return;
      }

      const handler = handlers[data.type];
      if (!handler) {
        send(ws, { type: 'error', message: `Unknown type: ${data.type}` });
        return;
      }

      try {
        await handler(ws, info, data);
      } catch (err) {
        send(ws, { type: 'error', message: err.message });
      }
    });

    ws.on('close', () => clients.delete(ws));
  });

  return wss;
};
