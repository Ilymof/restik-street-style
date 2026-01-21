const { Schema } = require('metaschema')

const CreateDishesSchema = Schema.from({
  name: { type: 'string', length: { min: 2 } }, 
  category_id: 'number',
  composition: { array: 'string' },
  description: { type: 'string', length: { min: 2 } },
  dish_status: 'boolean',
  image: { type: 'string', length: { min: 1 } },
  characteristics: { 
    array: { 
      size: { type: 'string', length: { min: 1 } }, 
      price: { type: 'string', length: { min: 1 } }, 
      quantity: { type: 'string', length: { min: 1 } }, 
      measure:{ type: 'string', length: { min: 1 } } 
    } 
  },
  default_characteristics: 'number',
  position: 'number'
});
const UpdateDishesSchema = Schema.from({
    id: 'number',
    name: '?string',
    category_id: '?number',
    'composition?': {array: 'string'},
    description: '?string',
    dish_status: '?boolean',
    image: '?string',
    characteristics: {array: {size:'string', price:'string', quantity: 'string', measure: 'string'},  required: false},
    default_characteristics: '?number',
    position: '?number'
})
module.exports = { CreateDishesSchema, UpdateDishesSchema }
