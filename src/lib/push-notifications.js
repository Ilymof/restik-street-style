const process = require('node:process')
const webpush = require('web-push');
const {
  getSubscriptionsByOrderKey,
  getAllAdminSubscriptions,
  deleteSubscription
} = require('../use-cases/push-subs/push-methods');
const throwValidationError = require('./ValidationError');

webpush.setVapidDetails(
  'mailto:jeffrey.ilymof@gmail.com',  // любой твой email
  process.env.PUBLIC_KEY,       
  process.env.PRIVATE_KEY 
);

async function sendPush(subscriptions, payload) {
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await deleteSubscription(sub.endpoint);
      }
    }
  }
}

async function notifyGuest(orderKey, title, body = '', url = '/order-histor') {
  const subs = await getSubscriptionsByOrderKey(orderKey);
  const payload = JSON.stringify({ title, body, url });
  await sendPush(subs, payload);
}

async function notifyAdmins(title, body = '', url = '/admin-orders') {
    if(!url){
        throwValidationError('Отсутствует url')
    }
  const subs = await getAllAdminSubscriptions();
  const payload = JSON.stringify({ title, body, url });
  await sendPush(subs, payload);
}

module.exports = {
  notifyGuest,
  notifyAdmins
};