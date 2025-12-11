const { Schema } = require('metaschema')

const CreateListSchema = Schema.from({
    price_list:{array: {city: 'string', prices: {array:{from: 'number', to:'number', price: 'number' }}}}
 
})
const UpdateListSchema = Schema.from({
    price_list:{array: {city: 'string', prices: {array:{from: 'number', to:'number', price: 'number' }}}, required: true}
})
module.exports = { CreateListSchema, UpdateListSchema }
