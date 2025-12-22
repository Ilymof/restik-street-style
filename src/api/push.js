'use strict'
const subscribe = require('../use-cases/push-subs/push-methods')
const process = require('node:process')

module.exports = {
  subscribe: async (args, req) => {
   return await subscribe(req)
  },
  'public-key': async () =>{
    let key = process.env.PUBLIC_KEY?.trim() || '';
    if (!key) throw new Error('PUBLIC_KEY не задан');
    return key
  }
}