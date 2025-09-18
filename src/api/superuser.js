'use strict'

const addNewAdmin = require('../use-cases/superuser/addNewAdmin.js')
const deleteAdmin = require('../use-cases/superuser/deleteAdmin.js')

module.exports = { 
   async 'add-admin' (args, accessToken) {
    return await addNewAdmin(args, accessToken)
   },
   async 'del-admin' (args, accessToken) {
    return await deleteAdmin(args, accessToken)
   },
}
