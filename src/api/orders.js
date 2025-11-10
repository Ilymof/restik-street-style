// 'use strict';
// const WebSocket = require('ws');
// const TokenService = require('../services/auth/JWTService');
// const getOrderByStatus = require('../use-cases/order/getOrderByStatus');
// const userOrders = require('../use-cases/order/userOrders');
// const updateOrderStatus = require('../use-cases/order/accessOrder');
// const throwValidationError = require('../lib/ValidationError');

// module.exports = (httpServer) => {
//   const wss = new WebSocket.Server({ server: httpServer });
//   const clients = new Map(); // Map<WebSocket, { role: 'admin' | 'client', username?: string, secretKey?: string }>

//   // ===============================
//   // 🔹 Утилиты
//   // ===============================

//   function send(ws, data) {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify(data));
//     }
//   }

//   function broadcast(filterFn, payload) {
//     for (const [client, info] of clients.entries()) {
//       if (client.readyState === WebSocket.OPEN && filterFn(info)) {
//         send(client, payload);
//       }
//     }
//   }

//   function notifyOrderUpdate(changeType, orderData, ownerSecretKey) {
//     const payload = { type: 'orders_update', changeType, data: orderData };

//     // Клиент-владелец
//     if (ownerSecretKey) {
//       broadcast(
//         (info) => info.role === 'client' && info.secretKey === ownerSecretKey,
//         payload
//       );
//     }

//     // Все админы
//     broadcast((info) => info.role === 'admin', payload);
//   }

//   // ===============================
//   // 🔹 Авторизация
//   // ===============================
//   function authenticateConnection(req) {
//     const url = new URL(req.url, `http://${req.headers.host}`);
//     const token = url.searchParams.get('token');
//     const secretKey = url.searchParams.get('secret_key');

//     if (!token && !secretKey) throwValidationError('Token or secret_key required');

//     if (token) {
//       const verified = TokenService.verifyAccessToken(token);
//       if (!verified?.username) throwValidationError('Invalid admin token');
//       return { role: 'admin', username: verified.username };
//     }

//     // Клиент
//     return { role: 'client', secretKey };
//   }

//   // ===============================
//   // 🔹 Обработчики сообщений
//   // ===============================
//   const handlers = {
//     async 'all-orders'(ws, info) {
//       if (info.role !== 'admin') throwValidationError('Admin token required');
//       const orders = await getOrderByStatus();
//       send(ws, { type: 'orders', orders });
//     },

//     async 'user-orders'(ws, info) {
//       if (info.role !== 'client') throwValidationError('secret_key required');
//       const orders = await userOrders(info.secretKey);
//       send(ws, { type: 'orders', orders });
//     },

//     async 'update-order-status'(ws, info, data) {
//       if (info.role !== 'admin') throwValidationError('Admin token required');
//       const { orderId, newStatus } = data;
//       if (!orderId || !newStatus) throwValidationError('orderId and newStatus required');

//       const result = await updateOrderStatus(orderId, newStatus);
//       const { updatedOrder, ownerSecretKey } = result;

//       notifyOrderUpdate('status_updated', updatedOrder, ownerSecretKey);
//       send(ws, { type: 'success', message: 'Order status updated', order: updatedOrder });
//     }
//   };

//   // ===============================
//   // 🔹 Подключение клиента
//   // ===============================
//   wss.on('connection', (ws, req) => {
//     let clientInfo;
//     try {
//       clientInfo = authenticateConnection(req);
//     } catch (err) {
//       send(ws, { type: 'error', message: err.message });
//       ws.close(1008, 'Auth failed');
//       return;
//     }

//     clients.set(ws, clientInfo);
//     console.log(`✅ Connected: ${clientInfo.role} ${clientInfo.username || clientInfo.secretKey?.slice(0, 8)}`);

//     // -------------------------------
//     // Обработка входящих сообщений
//     // -------------------------------
//     ws.on('message', async (raw) => {
//       let data;
//       try {
//         data = JSON.parse(raw);
//       } catch {
//         send(ws, { type: 'error', message: 'Invalid JSON' });
//         return;
//       }

//       const handler = handlers[data.type];
//       if (!handler) {
//         send(ws, { type: 'error', message: `Unknown type: ${data.type}` });
//         return;
//       }

//       try {
//         await handler(ws, clientInfo, data);
//       } catch (err) {
//         console.error('Handler error:', err);
//         send(ws, { type: 'error', message: err.message });
//       }
//     });

//     // -------------------------------
//     // Очистка при отключении
//     // -------------------------------
//     ws.on('close', () => {
//       console.log(`❌ Disconnected: ${clientInfo.role} ${clientInfo.username || clientInfo.secretKey?.slice(0, 8)}`);
//       clients.delete(ws);
//     });

//     ws.on('error', (err) => {
//       console.error('WebSocket error:', err);
//       clients.delete(ws);
//     });
//   });

//   // ===============================
//   // 🔹 Публичный API
//   // ===============================
//   return {
//     wss,
//     notifyOrderUpdate,
//     broadcastAdmin: (payload) => broadcast((i) => i.role === 'admin', payload),
//     broadcastClient: (key, payload) => broadcast((i) => i.role === 'client' && i.secretKey === key, payload),
//   };
// };
