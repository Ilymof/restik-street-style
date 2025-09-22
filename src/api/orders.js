'use strict'

const db = require('../db.js')
const orders = db('orders')
const safeDbCall = require('../lib/safeDbCall.js')
const createOrder = require('../use-cases/order/createOrder.js')
const updateOrder = require('../use-cases/order/updateOrder.js')

module.exports = {
   'read-all': async () => await safeDbCall(() => orders.read()),

   read: async ({ id }) => {
      return await safeDbCall(() => orders.read(id))
   },

   async create(rawBody) {
      return await createOrder(rawBody)
   },

   async update(rawBody) {
      return await updateOrder(rawBody)
   },

}
