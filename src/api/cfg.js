'use strict'
const updatePriceList = require('../use-cases/restaurant config/updatePriceList.js')
const {UpdateListSchema} = require('../schemas/deliveryPriceListMetaSchema')
const changeWorkTime = require('../use-cases/restaurant config/change_time.js')
const getConfig = require('../use-cases/restaurant config/get_config.js')
const throwValidationError = require('../lib/ValidationError')


module.exports = {
    async read () {
        return await getConfig()
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
