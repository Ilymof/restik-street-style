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
  if (subscriptions.length === 0) {
    console.log('Нет подписок для отправки push: ', subscriptions);
    return;
  }

  console.log(`Отправка push ${subscriptions.length} подписчикам`);

  for (const sub of subscriptions) {
    try {
      // ← Вот сюда добавляем третий параметр с опциями
      await webpush.sendNotification(sub, payload);
      console.log('Push успешно отправлен');
    } catch (err) {
      console.error('Ошибка отправки push:', err.statusCode, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('Удаляем устаревшую подписку');
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