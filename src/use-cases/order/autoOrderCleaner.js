
'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');
const throwValidationError = require('../../lib/ValidationError')

const cleanOrders = async () => {
    const sql = `DELETE FROM orders WHERE created_at < NOW() - INTERVAL '60 minutes' AND current_status = 'Отменён';`
    try {
    const result = await safeDbCall(() => orders.query(sql, []))
    console.log(`Удалено истёкших заказов: ${result.rowCount}`);
    } catch (error) {
        throwValidationError('Ошибка при чистке заказов')
    }

};

module.exports = cleanOrders