'use strict';
const errorHandler = require('../../lib/errorHandler');
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');

const accessOrder = async (args) => {
   try {
      if (!args.id) throw new Error('Поле id отсутствует');

      const existingOrder = await safeDbCall(() => orders.read(args.id));
      if (!existingOrder || existingOrder.length < 1) {
         throw new Error(`Заказ с id ${args.id} не найден`);
      }


      const order = {
        status: args.status,   
      }
      const result = await safeDbCall(() => orders.update(args.id, order));
      if (!result) {
         throw new Error('Ошибка при обновлении заказа' + err.message);
      }

      return result
   } catch (error) {
      throw errorHandler(error);
   }
};

module.exports = accessOrder;