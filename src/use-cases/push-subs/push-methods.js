const throwValidationError = require('../../lib/ValidationError');
const db = require('../../db')
const push_subscriptions = db('push_subscriptions')
const JWTService = require('../../services/auth/JWTService')
const removeBearer = require('../../lib/removeBearer')

function mapRowToSubscription(row) {
  return {
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth
    }
  };
}

async function saveGuestSubscription(subscription, orderKey) {
  const { endpoint, keys: { p256dh, auth } } = subscription;

  const sql = `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, order_key)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        order_key = EXCLUDED.order_key
    RETURNING id
  `;

  const result = await push_subscriptions.query(sql, [endpoint, p256dh, auth, orderKey]);
  return result.rows[0]?.id;
}

async function saveAdminSubscription(subscription, adminUsername) {
  const { endpoint, keys: { p256dh, auth } } = subscription;

  const sql = `
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, admin_username)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        admin_username = EXCLUDED.admin_username
    RETURNING id
  `;

  const result = await push_subscriptions.query(sql, [endpoint, p256dh, auth, adminUsername]);
  return result.rows[0]?.id;
}

async function getSubscriptionsByOrderKey(orderKey) {
  const sql = `
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE order_key = $1
  `;

  const result = await push_subscriptions.query(sql, [orderKey]);
  return result.rows.map(mapRowToSubscription);
}

async function getAllAdminSubscriptions() {
  const sql = `
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE admin_username IS NOT NULL
  `;

  const result = await push_subscriptions.query(sql);
  return result.rows.map(mapRowToSubscription);
}

async function deleteSubscription(body) {
  const { endpoint } = body
  await push_subscriptions.query(
    `DELETE FROM push_subscriptions WHERE endpoint = $1`,
    [endpoint]
  );
}

async function subscribeClient (rawBody,req) {
    const subscription = rawBody
    const orderKey = req.headers['secret-key'] ? req.headers['secret-key'] : null

    if (orderKey) {
        await saveGuestSubscription(subscription, orderKey);
    } else{
      throwValidationError('Пользовательский ключ отсутсвует')
    }

    return { success: true };
  
  }
async function subscribeAdmin (rawBody,req) {
  const subscription = rawBody
  const token = removeBearer(req.headers.authorization) || null;
  if (!token) {
    throwValidationError('Токен авторизации отсутствует');
  }
  
  let decoded = null
  let adminUsername = null
  if (token){
    decoded = JWTService.verifyAccessToken(token);
    adminUsername = decoded.username
  }
  
  if (adminUsername) {
    await saveAdminSubscription(subscription, adminUsername);
  } else {
    throwValidationError('Не найдено имя пользователя в токене')
  }

  return { success: true };

}

module.exports = {
  saveGuestSubscription,
  saveAdminSubscription,
  getSubscriptionsByOrderKey,
  getAllAdminSubscriptions,
  deleteSubscription,
  subscribeClient,
  subscribeAdmin
};