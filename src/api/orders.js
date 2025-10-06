'use strict';

const db = require('../db.js');
const orders = db('orders');
const safeDbCall = require('../lib/safeDbCall.js');
const createOrder = require('../use-cases/order/createOrder.js');
const updateOrder = require('../use-cases/order/updateOrder.js');
const { CreateOrderSchema, UpdateOrderSchema } = require('../shemas/orderShema.js');
const errorHandler = require('../lib/errorHandler');
const throwValidationError = require('../lib/ValidationError');
const formatZodError = require('../lib/formatZodError');

module.exports = {
  'read-all': async () => await safeDbCall(() => orders.read()),

  read: async ({ id }) => {
    if (!Number(id)) {
      throw errorHandler(throwValidationError('id должен быть числом'));
    }
    return await safeDbCall(() => orders.read(id));
  },

  create: async (rawBody) => {
    try {
      const args = CreateOrderSchema.parse(rawBody);
      return await createOrder(args);
    } catch (error) {
      if (error.name === 'ZodError') {
        const formatted = formatZodError(error);
        throw errorHandler( throwValidationError(formatted));
      }
      throw error;
    }
  },

  update: async (rawBody) => {
    try {
      const args = UpdateOrderSchema.parse(rawBody);
      return await updateOrder(args);
    } catch (error) {
      if (error.name === 'ZodError') {
        const formatted = formatZodError(error);
        throw errorHandler( throwValidationError(formatted));
      }
      throw error;
    }
  },
};