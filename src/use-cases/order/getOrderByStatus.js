'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const getOrderByStatus = async () => {
    
    const sql = `
        SELECT * FROM orders
        ORDER BY status ASC, created_at DESC;
    `
    const result = await safeDbCall(() => orders.query(sql, []))
    if (!result || result.rows.length<1){
        throwValidationError('нет заказов')
    }
    console.log(result.rows);
    
    return result.rows
}

module.exports = getOrderByStatus