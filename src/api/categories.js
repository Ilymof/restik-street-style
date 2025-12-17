'use strict'

const db = require('../db.js')
const categories = db('category')
const getDishesByCategory = require('../use-cases/dish/getDishesWithCategory.js')
const safeDbCall = require('../lib/safeDbCall.js')
const updateCategories = require('../use-cases/categories/updateCategory.js')
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

   update: async (rawBody) => {  
    return await updateCategories(rawBody)
   },

   

   delete: async ({ id }) => {
      return await safeDbCall(() => categories.delete(id))
   }
}