'use strict'
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const config = db('config')
const {CreateListSchema} = require('../../schemas/deliveryPriceListMetaSchema')

const createPriceList = async (args) => {
    let {price_list} = args

    if (price_list && typeof price_list === 'string') {
         try {
            price_list = JSON.parse(price_list);

            if (Array.isArray(price_list)) {
                price_list = price_list.map(char => ({
                    delivery_price: char.delivery_price.size,
                    order_price: char.order_price.price,  
                    city: char.city
                }));
            }
         } catch (e) {
            throwValidationError(`Неверный JSON в characteristics: ${e.message}`);
         }
      }
      if(!CreateListSchema.check(dish).valid){
      throwValidationError(CreateListSchema.check(dish).errors[0])
      }
      price_list = JSON.stringify()
      return await safeDbCall(() => config.create(price_list))
   
}

module.exports = changeWorkTime 