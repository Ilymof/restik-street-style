'use strict'
const process = require('node:process')


const JWT = {
   accessSecret: process.env.ACCESS_TOKEN_SECRET || 'super_secrey_key',
   refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'super_secret_key',
   accessExpiresIn: '15m',
   refreshExpiresIn: '14d'
}

module.exports = { JWT }
