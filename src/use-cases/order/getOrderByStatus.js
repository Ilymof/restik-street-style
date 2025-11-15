'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const getOrderByStatus = async () => {
    
    const sql = `
        SELECT * FROM orders
    ORDER BY 
      CASE 
        WHEN current_status = 'processing' THEN 1
        WHEN current_status = 'finished' THEN 2
        WHEN current_status = 'canceled' THEN 3
        ELSE 4 
      END ASC,
      created_at DESC;
    `
    const result = await safeDbCall(() => orders.query(sql, []))
    if (!result || result.rows.length<1){
        throwValidationError('нет заказов')
    }
    console.log(result.rows);
    
    return result.rows
}

module.exports = getOrderByStatus