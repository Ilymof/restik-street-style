'use strict';

const db = require('../db.js');
const orders = db('orders');
const safeDbCall = require('../lib/safeDbCall.js');
const createOrder = require('../use-cases/order/createOrder.js');
const updateOrder = require('../use-cases/order/updateOrder.js');
const userOrders = require('../use-cases/order/userOrders.js');
const {UpdateOrderSchema} = require('../schemas/orderMetaSchema.js');
const errorHandler = require('../lib/errorHandler');
const throwValidationError = require('../lib/ValidationError');

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  'user-orders': async (arg, req) => {
    return await userOrders(req);
  },

  read: async ({ id }) => {
    if (!Number(id)) {
      throw errorHandler(throwValidationError('id должен быть числом'));
    }
    return await safeDbCall(() => orders.read(id));
  },

  create: async (rawBody, req) => {
    return await createOrder(rawBody, req);
  },


  update: async (rawBody) => {
    if (!UpdateOrderSchema.check(rawBody).valid){
      throw errorHandler(throwValidationError(UpdateOrderSchema.check(rawBody).errors[0]))
    }   
    return await updateOrder(rawBody);
  }
};