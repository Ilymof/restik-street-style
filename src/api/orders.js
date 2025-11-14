'use strict'

const db = require('../db.js')
const orders = db('orders')
const safeDbCall = require('../lib/safeDbCall.js')
const createOrder = require('../use-cases/order/createOrder.js')
const updateOrder = require('../use-cases/order/updateOrder.js')
const userOrders = require('../use-cases/order/userOrders.js')
const getByFilter = require('../use-cases/order/getOrderByAnyParametr.js') 
const {UpdateOrderSchema} = require('../schemas/orderMetaSchema.js')
const checkOpeningHours = require('../lib/checkOpeningHours.js')
const errorHandler = require('../lib/errorHandler')
const throwValidationError = require('../lib/ValidationError')
const accessOrder = require('../use-cases/order/accessOrder.js')

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  'read-by-filter': async (args) =>{
    return await getByFilter(args)
  },

  'user-orders': async (arg) => {
    return await userOrders(arg)
  },

  read: async ({ id }) => {
    if (!Number(id)) {
      throwValidationError('id должен быть числом')
    }
    return await safeDbCall(() => orders.read(id))
  },

  'access-order': async (args, req) => {

  let updatedOrderArray = await accessOrder(args)
  const updatedOrder = updatedOrderArray[0]
  const secretKey = updatedOrder.secret_key
  const updatedOrderList = await userOrders(secretKey)
  req.server.notifyOrdersUpdate('status_updated', updatedOrderList, secretKey)
  return updatedOrder
},

  create: async (rawBody, req) => {
    if(!checkOpeningHours())
      {
         throwValidationError('Доступ запрещен: время создания заказа ограничено (23:00–10:00)') 
      }
    const newOrderArray = await createOrder(rawBody, req)
    const newOrder = newOrderArray[0]
    const secretKey = newOrder.secret_key
    const updatedOrders = await userOrders(secretKey )
    req.server.notifyOrdersUpdate('added', updatedOrders, secretKey)

    return newOrder
  },

  

  update: async (rawBody) => {
    if (!UpdateOrderSchema.check(rawBody).valid){
      throw errorHandler(throwValidationError(UpdateOrderSchema.check(rawBody).errors[0]))
    }   
    return await updateOrder(rawBody)
  }
}