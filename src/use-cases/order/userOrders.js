'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const userOrders = async (req) => {
    const secret_key = req.headers.secret_key
    
    const sql = `
        SELECT * FROM orders WHERE secret_key = $1;
    `
    const result = await safeDbCall(() => orders.query(sql, [secret_key]))
    if (!result || result.rows.length<1){
       return []
    }
    return result.rows
}

module.exports = userOrders