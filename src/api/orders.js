'use strict';

const db = require('../db.js');
const orders = db('orders');
const safeDbCall = require('../lib/safeDbCall.js');
const createOrder = require('../use-cases/order/createOrder.js');
const updateOrder = require('../use-cases/order/updateOrder.js');
const filterOrder = require('../use-cases/order/filterOrder.js');
const {UpdateOrderSchema} = require('../schemas/orderMetaSchema.js');
const errorHandler = require('../lib/errorHandler');
const throwValidationError = require('../lib/ValidationError');

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  'filter-order': async ({secretkey}) => {
    return await filterOrder(secretkey);
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