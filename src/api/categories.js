'use strict'

const db = require('../db.js')
const categories = db('category')
const getDishesByCategory = require('../use-cases/dish/getDishesWithCategory.js')
const safeDbCall = require('../lib/safeDbCall.js')
const updateCategory = require('../use-cases/categories/updateCategory.js')
const createCategory = require('../use-cases/categories/createCategory.js')
const getCategories = require('../use-cases/categories/getCategories.js')
const throwValidationError = require('../lib/ValidationError')
const {CreateCategorySchema, UpdateCategorySchema} = require('../schemas/categoryMetaSchema.js')


module.exports = {

  'read-all': async () => {
   return await getCategories()
  },
  
   async 'read-with-dishes'() {
      return await getDishesByCategory()
   },

   read: async ({ id }) => {
      return await safeDbCall(() => categories.read(id))
   },

   create: async (rawBody) => {   
       if (!CreateCategorySchema.check(rawBody).valid){
      throw throwValidationError(CreateCategorySchema.check(rawBody).errors[0])
    }   
    return await createCategory(rawBody)
   },

   update: async (rawBody) => {
      if (!UpdateCategorySchema.check(rawBody).valid){
      throw throwValidationError(UpdateCategorySchema.check(rawBody).errors[0])
    }   
    return await updateCategory(rawBody)
   },

   

   delete: async ({ id }) => {
      return await safeDbCall(() => categories.delete(id))
   }
}