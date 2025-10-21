'use strict'
const process = require('node:process')


const JWT = {
   accessSecret: process.env.ACCESS_TOKEN_SECRET,
   refreshSecret: process.env.REFRESH_TOKEN_SECRET,
   accessExpiresIn: '1m',
   refreshExpiresIn: '10m'
}

module.exports = { JWT }
