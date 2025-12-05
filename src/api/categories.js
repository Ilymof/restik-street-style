'use strict'

const db = require('../db.js')
const categories = db('category')
const getDishesByCategory = require('../use-cases/dish/getDishesWithCategory.js')
const safeDbCall = require('../lib/safeDbCall.js')
const updateCategory = require('../use-cases/categories/updateCategory.js')
const createCategory = require('../use-cases/categories/createCategory.js')
const getCategories = require('../use-cases/categories/getCategories.js')

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
       return await createCategory(rawBody)
   },

   update: async (rawBody) => {
     return await updateCategory(rawBody)
   },

   delete: async ({ id }) => {
      return await safeDbCall(() => categories.delete(id))
   }
}