const { Schema } = require('metaschema')

const CreateListSchema = Schema.from({
    price_list:{array: {city: 'string', delivery_price: 'number',order_price: 'number'}}
 
})
const UpdateListSchema = Schema.from({
    price_list:{array: {city: '?string', delivery_price: '?number',order_price: '?number'},required: true}
})
module.exports = { CreateListSchema, UpdateListSchema }
