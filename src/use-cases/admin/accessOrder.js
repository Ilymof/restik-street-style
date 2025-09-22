'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');
const throwValidationError = require('../../lib/ValidationError')

const accessOrder = async (args) => {
      if (!args.id) throwValidationError('Поле id отсутствует');

      const existingOrder = await safeDbCall(() => orders.read(args.id));
      if (!existingOrder || existingOrder.length < 1) {
         throwValidationError(`Заказ с id ${args.id} не найден`);
      }


      const order = {
        status: args.status,   
      }
      const result = await safeDbCall(() => orders.update(args.id, order));
      if (!result) {
         throwValidationError('Ошибка при обновлении заказа');
      }

      return result 
};

module.exports = accessOrder;