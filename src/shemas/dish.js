const { Schema } = require('metaschema')

const CreateDishShema = Schema.from({
   name: { type: 'string', required: true },
   categoryid: { type: 'number', required: true },
   price: { type: 'number', required: true },
   description: { type: 'string', required: true },
   dish_weight : { type: 'string', required: true },
   composition : { type: 'array', subtype: 'string', required: true },
   image: { type: 'string', required: true },
   time_to_cook: { type: 'string', required: true }
})
const UpdateDishShema = Schema.from({
   id: { type: 'number', required: true },
   name: { type: 'string', required: true },
   categoryid: { type: 'number', required: true },
   price: { type: 'number', required: true },
   dish_status: { type: 'boolean', required: false },
   description: { type: 'string', required: true },
   dish_weight : { type: 'string', required: true },
   composition : { type: 'array', subtype: 'string', required: true },
   image: { type: 'string', required: true },
   time_to_cook: { type: 'string', required: true },
})
module.exports = { CreateDishShema, UpdateDishShema }
