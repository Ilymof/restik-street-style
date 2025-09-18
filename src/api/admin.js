'use strict'

const accessOrder = require('../use-cases/admin/accessOrder.js')


module.exports = { 
   async 'access-order' (RawBody) {
    return await accessOrder(RawBody)
   },
   
}
