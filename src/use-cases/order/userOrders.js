'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const userOrders = async (secret_key) => {
    
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
        WHERE secret_key = $1
    ORDER BY
      created_at ASC;
    `
    const result = await safeDbCall(() => orders.query(sql, [secret_key]))
    if (!result || result.rows.length<1){
       return []
    }
    return result.rows
}

module.exports = userOrders