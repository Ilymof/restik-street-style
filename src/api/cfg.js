'use strict'
const db = require('../db')
const config = db('config')
const safeDbCall = require('../lib/safeDbCall.js')
const {UpdateListSchema} = require('../schemas/deliveryPriceListMetaSchema')
const changeWorkTime = require('../use-cases/restaurant config/change_time.js')
const updatePriceList = require('../use-cases/restaurant config/updatePriceList.js')
const throwValidationError = require('../lib/ValidationError')


module.exports = {
    async read () {
        return await safeDbCall(() => config.read())
    }, 
    
    async 'change-time' (args) {
        return changeWorkTime(args)
    },

    async 'update-price-list' (args) {
        if(!UpdateListSchema.check(args).valid){
        throwValidationError(UpdateListSchema.check(args).errors[0])
      }
        return updatePriceList(args)
    }
    
}
