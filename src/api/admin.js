'use strict'

const accessOrder = require('../use-cases/admin/accessOrder.js')


module.exports = { 
   async 'access-order' (args) {
    return await accessOrder(args)
   },
   
}
