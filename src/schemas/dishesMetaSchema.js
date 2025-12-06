const { Schema } = require('metaschema')

const CreateDishesSchema = Schema.from({
  name: 'string',
  categoryid: 'number',
  composition: { array: 'string'},
  description: 'string',
  dish_status: 'boolean',
  image: 'string',
  characteristics: {array: {size:'string', price:'string', weight: 'string', measure: 'string'}},
  default_characteristics: 'number',
  position: 'number'

})
const UpdateDishesSchema = Schema.from({
    id: 'number',
    name: '?string',
    categoryid: '?number',
    '?composition': {array: 'string'},
    description: '?string',
    dish_status: '?boolean',
    image: '?string',
    '?characteristics': {array: {size:'string', price:'string', weight: 'string', measure: 'string'}},
    default_characteristics: '?number',
    position: '?number'
})
module.exports = { CreateDishesSchema, UpdateDishesSchema }
