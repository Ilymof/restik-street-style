'use strict'

const db = require('../db.js')
const categories = db('category')
const getDishesByCategory = require('../use-cases/dish/getDishesWithCategory.js')
const errorHandler = require('../lib/errorHandler.js')
const ValidationError = require('../lib/ValidationError.js')
const safeDbCall = require('../lib/safeDbCall.js')
const { CreateCategoryShema, UpdateCategoryShema } = require('../shemas/category')

module.exports = {
   async 'read-all'() {
      return await getDishesByCategory()
   },

   read: async ({ id }) => {
      if (!Number(id))
         throw errorHandler(new ValidationError('id должен быть числом'))

      return await safeDbCall(() => categories.read(id))
   },

   create: async (data) => {
      if (!CreateCategoryShema.check(data).valid)
         throw errorHandler(new ValidationError(CreateCategoryShema.check(data).errors[0]))

      return await safeDbCall(() => categories.create(data))
   },

   update: async ({ id, name }) => {
      if (!UpdateCategoryShema.check({ id, name }).valid)
         throw errorHandler(new ValidationError(UpdateCategoryShema.check({ id, name }).errors[0]))

      return await safeDbCall(() => categories.update(id, { name }))
   },

   delete: async ({ id }) => {
      if (!Number(id))
         throw errorHandler(new ValidationError('id должен быть числом'))

      return await safeDbCall(() => categories.delete(id))
   }
}
