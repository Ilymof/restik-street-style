'use strict'

const db = require('../db.js')
const categories = db('category')
const getDishesByCategory = require('../use-cases/dish/getDishesWithCategory.js')
const safeDbCall = require('../lib/safeDbCall.js')

module.exports = {

  'read-all': async () => await safeDbCall(() => categories.read()),
  
   async 'read-with-dishes'() {
      return await getDishesByCategory()
   },

   read: async ({ id }) => {
      return await safeDbCall(() => categories.read(id))
   },

   create: async (data) => {
      return await safeDbCall(() => categories.create(data))
   },

   update: async ({ id, name }) => {
     return await safeDbCall(() => categories.update(id, { name }))
   },

   delete: async ({ id }) => {
      return await safeDbCall(() => categories.delete(id))
   }
}