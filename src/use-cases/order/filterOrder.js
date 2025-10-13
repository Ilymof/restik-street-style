'use strict'
const db = require('../../db')
const orders = db('orders')
const throwValidationError = require('../../lib/ValidationError')
const safeDbCall = require('../../lib/safeDbCall')

const findOrdersBySecretKey = async (queryParams) => {
    const sql = `
        SELECT * FROM orders WHERE secret_key = $1;
    `
    const result = await safeDbCall(() => orders.query(sql, [queryParams]))
    if (!result || result.rows.length<1){
        throwValidationError(`Заказа с ключом ${queryParams} нет` )
    }
    return result.rows
}

module.exports = findOrdersBySecretKey