'use strict'
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const config = db('config')



const updatePriceList = async (args) => {
    let {price_list} = args  
    price_list = JSON.stringify(price_list)
    const values = {
        price_list
    }
    return await safeDbCall(() => config.update(1,values))
}

module.exports = updatePriceList 