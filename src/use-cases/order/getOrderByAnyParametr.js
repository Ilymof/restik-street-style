'use strict';
const db = require('../../db');
const orders = db('orders');
const safeDbCall = require('../../lib/safeDbCall');
const throwValidationError = require('../../lib/ValidationError')
const { createCondition } = require('../../lib/queryConditions')
const SqlQueryBuilder = require('../../lib/SqlQueryBuilder')

const readSql = `
    SELECT * FROM orders o
`
const getOrderWhereParametr = async (queryParams) => {
    const conditions = [
         (p) => p.phone && createCondition('o.phone', '=', p.phone),
         (p) => p.name && createCondition('o.name', '=', p.name),
         (p) => p.minCash && createCondition('o.total_price', '>=', p.minCash),
         (p) => p.maxCash && createCondition('o.total_price', '<=', p.maxCash),
         (p) => p.status && createCondition('o.status', '=', p.status),
         (p) => p.secret_key && createCondition('o.secret_key', '=', p.secret_key),
         (p) => p.dishName && createCondition('o.dishes', '@>', JSON.stringify([{name: p.dishName}])),
         (p) => p.size && createCondition('o.dishes', '@>', JSON.stringify([{size: p.size}])),
     ]

     const activeConditions = conditions.map(fn => fn(queryParams)).filter(Boolean)
     const whereClause = activeConditions.length 
        ? `WHERE ${activeConditions.map((_, i) => _.sql.replace('?', `$${i + 1}`)).join(' AND ')}` 
        : ''
     const values = activeConditions.map(c => c.value)
  
     const { sql: dataSql, values: dataValues } = new SqlQueryBuilder(readSql)
        .createWhere(conditions, queryParams)
        .createOrder('o.created_at', 'DESC')
        .end()
  
     const countSql = `
        SELECT COUNT(*) as total 
        FROM orders o
        ${whereClause}
     `.trim()
  
     const [dataResult, countResult] = await Promise.all([
        safeDbCall(() => orders.query(dataSql, dataValues)),
        safeDbCall(() => orders.query(countSql, values))
     ])
  
     return {
        orders: dataResult.rows,
        total: parseInt(countResult.rows[0].total)
     }
   }
 

module.exports = getOrderWhereParametr;