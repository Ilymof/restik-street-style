'use strict'

const db = require('../db.js')
const orders = db('orders')
const cron = require('node-cron');
const safeDbCall = require('../lib/safeDbCall.js')
const createOrder = require('../use-cases/order/createOrder.js')
const updateOrder = require('../use-cases/order/updateOrder.js')
const getByFilter = require('../use-cases/order/getOrderByAnyParametr.js') 
const {UpdateOrderSchema} = require('../schemas/orderMetaSchema.js')
const {checkOpeningHours} = require('../lib/checkOpeningHours.js')
const { notifyAdmins} = require('../lib/push-notifications.js')
const throwValidationError = require('../lib/ValidationError')
const cleanOrders = require('../use-cases/order/autoOrderCleaner.js')

cron.schedule('*/5 * * * *', async () => {
  console.log('Running cleanup...');
  await cleanOrders()
})

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  'read-by-filter': async (args) =>{
    return await getByFilter(args)
  },
  create: async (rawBody, req) => {
    if(!await checkOpeningHours())
      {
         throwValidationError('Доступ запрещен: время создания заказа ограничено по времени работы заведения') 
      }
    
    const newOrderArray = await createOrder(rawBody, req)
    const newOrder = newOrderArray[0]
    const secretKey = newOrder.secret_key
    req.server.notifyOrdersUpdate('added', newOrderArray, secretKey)
    try {
        console.log("Пробую прислать уведомление", "-> newOrder.secret_key:",newOrder.secret_key);
        await notifyAdmins(
          `Новый заказ`,
          `Пришёл новый заказ от ${newOrder.name} на сумму ${newOrder.total_price}`,
          '/admin-orders'
        )
      } catch (err) {
        console.error('Не удалось отправить push админам:', err)
      }
    return newOrderArray
  },

  update: async (rawBody) => {
    if (!UpdateOrderSchema.check(rawBody).valid){
      throw throwValidationError(UpdateOrderSchema.check(rawBody).errors[0])
    }   
    return await updateOrder(rawBody)
  }
}