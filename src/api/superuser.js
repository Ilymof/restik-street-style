'use strict'

const addNewAdmin = require('../use-cases/superuser/addNewAdmin.js')
const deleteAdmin = require('../use-cases/superuser/deleteAdmin.js')
const getAllAdmin = require('../use-cases/superuser/getAllAdmins.js')
module.exports = { 
   async 'add-admin' (args) {
      return await addNewAdmin(args)
   },
   async 'del-admin' (args) {
      return await deleteAdmin(args)
   },
   async 'get-admins' (args) {
      return await getAllAdmin(args)
   }
}
