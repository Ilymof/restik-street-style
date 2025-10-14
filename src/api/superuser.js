'use strict'

const addNewAdmin = require('../use-cases/superuser/addNewAdmin.js')
const deleteAdmin = require('../use-cases/superuser/deleteAdmin.js')

module.exports = { 
   async 'add-admin' (args, req) {
      const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || null;
      return await addNewAdmin(args, accessToken)
   },
   async 'del-admin' (args, req) {
      const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || null;
      return await deleteAdmin(args, accessToken)
   },
}
