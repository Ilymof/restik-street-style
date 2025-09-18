'use strict'

const db = require('../db.js')
const dishes = db('dish')
const errorHandler = require('../lib/errorHandler.js')
const ValidationError = require('../lib/ValidationError.js')
const safeDbCall = require('../lib/safeDbCall.js')
const createDish = require('../use-cases/dish/createDish.js')
const deleteDish = require('../use-cases/dish/deleteDish.js')
const updateDish = require('../use-cases/dish/updateDish.js')
module.exports = {
   'read-all': async () => await safeDbCall(() => dishes.read()),

   read: async ({ id }) => {
      if (!Number(id))
         throw errorHandler(new ValidationError('id должен быть числом'))

      return await safeDbCall(() => dishes.read(id))
   },

   async create(RawBody) {
      return await createDish(RawBody)
   },

   async update (RawBody ) {
      return await updateDish(RawBody)
   },

   async delete(args) {
      return await deleteDish(args)
   },
}
