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
    return newOrderArray
  },

  update: async (rawBody) => {
    if (!UpdateOrderSchema.check(rawBody).valid){
      throw throwValidationError(UpdateOrderSchema.check(rawBody).errors[0])
    }   
    return await updateOrder(rawBody)
  }
}