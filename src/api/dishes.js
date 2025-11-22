'use strict'

const db = require('../db.js')
const dishes = db('dish')
const safeDbCall = require('../lib/safeDbCall.js')
const createDish = require('../use-cases/dish/createDish.js')
const deleteDish = require('../use-cases/dish/deleteDish.js')
const updateDish = require('../use-cases/dish/updateDish.js')
const getDishes = require('../use-cases/dish/getDishes.js')
module.exports = {
   'read-all': async () =>{
      return await getDishes()    
   },

   read: async ({ id }) => {
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
