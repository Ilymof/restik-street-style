'use strict';
const bcrypt = require('bcrypt');
const TokenService = require('../../services/auth/JWTService');
const db = require('../../db');
const tokens = db('tokens')
const TokenStorage = require('../../storages/TokenStorage');
const jwt = require('jsonwebtoken')
const safeDbCall = require('../../lib/safeDbCall.js')
const throwValidationError = require('../../lib/ValidationError')

async function logout(args) {
    const username = args.username 
  
    const sql =`
      DELETE FROM tokens WHERE username = $1 RETURNING *
    `

    if(username) {
        await safeDbCall(() => tokens.query(sql, [username]))
        console.log(`Пользователь ${username} успешно разлогинен`);
    } else {
      throwValidationError(`не найден пользователь с username: ${username}`)
    }
}


module.exports = logout