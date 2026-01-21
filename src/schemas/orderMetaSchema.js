const { Schema } = require('metaschema')

const CreateOrderSchema = Schema.from({
    name: { type: 'string', length: { min: 1 } },
    phone: { type: 'string', length: { min: 1 } },
    delivery:{status: 'boolean',address: 'string',comment: '?string', delivery_price: '?number'},
    dishes: {array: {id: 'number',quantity: 'number', size: 'string'}, required: true },
    cutlery_status: 'boolean',
    cutlery_quantity:'?number', 
    order_comment: '?string' ,
    created_at: '?string',
    secret_key: { type: 'string', length: { min: 1 } },
})
// const UpdateOrderSchema = Schema.from({
//     id: 'number',
//     name: '?string',
//     phone: '?string',
//     'delivery?':{status: 'boolean',address: 'string',comment: '?string', delivery_price: '?number'},
//     dishes: {array: {id: 'number',quantity: 'number', size: '?string'}, required: false },
//     cutlery_status: '?boolean',
//     cutlery_quantity:'?number', 
//     order_comment: '?string',
// })
module.exports = { CreateOrderSchema}
