'use strict'
const subscribe = require('../use-cases/push-subs/push-methods')
const process = require('node:process')

module.exports = {
  subscribe: async (args, req) => {
   return await subscribe(req)
  },
  'public-key': async () =>{
    return process.env.PUBLIC_KEY
  }
}