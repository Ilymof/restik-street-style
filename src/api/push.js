'use strict'
const subscribe = require('../use-cases/push-subs/push-methods')
const process = require('node:process')

module.exports = {
  subscribe: async (args, req) => {
   return await subscribe(req)
  },
  'public-key': async () =>{
    let key = process.env.PUBLIC_KEY || '';
    key = key.trim();
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1);
    }

    key = key.replace(/[^A-Za-z0-9\-_]/g, ''); 
    return key
  }
}