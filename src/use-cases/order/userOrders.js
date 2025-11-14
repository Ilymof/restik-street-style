'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const userOrders = async (secret_key) => {
    
    const sql = `
        SELECT * FROM orders WHERE secret_key = $1
        ORDER BY status ASC, created_at DESC;
    `
    const result = await safeDbCall(() => orders.query(sql, [secret_key]))
    if (!result || result.rows.length<1){
       return []
    }
    return result.rows
}

module.exports = userOrders