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

       await safeDbCall(() => orders.update(id, order));
      const sql = `
        SELECT 
        id,
        phone,
        name,
        dishes,
        total_price,
        current_status,
        delivery,
        cutlery_status,
        cutlery_quantity,
        order_comment,
        created_at,
        secret_key
        FROM orders
        WHERE id = $1
        `
      const result = await safeDbCall(() => orders.query(sql, [id]))
         
      if (!result) {
         throwValidationError('Ошибка при обновлении заказа');
      }

      return result.rows 
};

module.exports = accessOrder;