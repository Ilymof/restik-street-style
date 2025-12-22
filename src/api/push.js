'use strict'
const subscribe = require('../use-cases/push-subs/push-methods')
const process = require('node:process')

module.exports = {
  subscribe: async (args, req) => {
   return await subscribe(req)
  },
  'public-key': async () =>{
    let key = process.env.PUBLIC_KEY || '';
    key = key.trim();  // убирает пробелы/переносы в начале и конце
    key = key.replace(/[^A-Za-z0-9\-_]/g, '');
    return key
  }
}