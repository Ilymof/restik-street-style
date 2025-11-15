'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');
const throwValidationError = require('../../lib/ValidationError')

const accessOrder = async (id, status) => {
      if (!id && !status) throwValidationError('Поле id или status отсутствует');
      
      const existingOrder = await safeDbCall(() => orders.read(id));
      if (!existingOrder || existingOrder.length < 1) {
         throwValidationError(`Заказ с id ${id} не найден`);
      }

      const order = {
        current_status: status,   
      }
      const result = await safeDbCall(() => orders.update(id, order));
      if (!result) {
         throwValidationError('Ошибка при обновлении заказа');
      }

      return result 
};

module.exports = accessOrder;