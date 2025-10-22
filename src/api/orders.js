'use strict';

const db = require('../db.js');
const orders = db('orders');
const safeDbCall = require('../lib/safeDbCall.js');
const createOrder = require('../use-cases/order/createOrder.js');
const updateOrder = require('../use-cases/order/updateOrder.js');
const userOrders = require('../use-cases/order/userOrders.js');
const getByFilter = require('../use-cases/order/getOrderByAnyParametr.js') 
const {UpdateOrderSchema} = require('../schemas/orderMetaSchema.js');
const errorHandler = require('../lib/errorHandler');
const throwValidationError = require('../lib/ValidationError')
const accessOrder = require('../use-cases/order/accessOrder.js')

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  'read-by-filter': async (args) =>{
    return await getByFilter(args)
  },

  'user-orders': async (arg, req) => {
    return await userOrders(req);
  },

  read: async ({ id }) => {
    if (!Number(id)) {
      throw errorHandler(throwValidationError('id должен быть числом'));
    }
    return await safeDbCall(() => orders.read(id))
  },

  async 'access-order' (args) {
    return await accessOrder(args)
   },
   
  create: async (rawBody, req) => {
    const newOrder = await createOrder(rawBody, req)
    req.server.notifyOrdersUpdate('added', newOrder)
    return newOrder
  },

  update: async (rawBody) => {
    if (!UpdateOrderSchema.check(rawBody).valid){
      throw errorHandler(throwValidationError(UpdateOrderSchema.check(rawBody).errors[0]))
    }   
    return await updateOrder(rawBody);
  }
};