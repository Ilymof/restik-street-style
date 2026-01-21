'use strict'
const {subscribeClient, subscribeAdmin, deleteSubscription} = require('../use-cases/push-subs/push-methods')
const process = require('node:process')

module.exports = {
  'subscribe-client': async (rawBody, req) => {
   return await subscribeClient(rawBody,req)
  },
  'subscribe-admin': async (rawBody, req) => {
   return await subscribeAdmin(rawBody,req)
  },
  'unsubscribe': async (endpoint) => {
   return await deleteSubscription(endpoint)
  },
  'public-key': async () =>{
    let key = process.env.PUBLIC_KEY?.trim() || '';
    if (!key) throw new Error('PUBLIC_KEY не задан');
    return key
  }
}