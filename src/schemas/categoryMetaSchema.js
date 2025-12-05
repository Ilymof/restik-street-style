const { Schema } = require('metaschema')

const CreateCategorySchema = Schema.from({
  categories: {array: {name:'string', status: '?boolean', position:'number'}}
})
const UpdateCategorySchema = Schema.from({
    categories: {array: {id: 'number', name:'?string', status: '?boolean', position:'?number'}}
})
module.exports = { CreateCategorySchema, UpdateCategorySchema }
