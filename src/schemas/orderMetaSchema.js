const { Schema } = require('metaschema')

const CreateOrderSchema = Schema.from({
    name: 'string',
    phone: 'string',
    delivery: {
    status: 'boolean',
    address: 'string',
    comment: '?string'
    },
    dishes: {array: {id: 'number',quantity: 'number', size: '?string'} },
    cutlery_status: 'boolean',
    cutlery_quantity:'?number', 
<<<<<<< HEAD
    order_comment: '?string' ,
    secret_key: 'string'
=======
    order_comment: '?string',
    secrey_key: 'string'
>>>>>>> 87f4af85205caa85042efeb38e4631d4462b9efa
})
const UpdateOrderSchema = Schema.from({
    id: 'number',
    name: '?string',
    phone: '?string',
    delivery: {
    status: '?boolean',
    address: '?string',
    comment: '?string'
    },
    dishes: {array: {id: '?number',quantity: '?number', size: '?string'} },
    cutlery_status: '?boolean',
    cutlery_quantity:'?number', 
    order_comment: '?string',
    secret_key: 'string'
})
module.exports = { CreateOrderSchema, UpdateOrderSchema }
