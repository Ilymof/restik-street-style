'use strict';
const bcrypt = require('bcrypt');
const TokenService = require('../../services/auth/JWTService');
const db = require('../../db');
const tokens = db('tokens')
const TokenStorage = require('../../storages/TokenStorage');
const jwt = require('jsonwebtoken')
const safeDbCall = require('../../lib/safeDbCall.js')

async function logout(args) {
  try {
    const username = args.username 
  
    const sql =`
      DELETE FROM tokens WHERE username = $1 RETURNING *
    `

    if(username) {
        await safeDbCall(() => tokens.query(sql, [username]))
        console.log(`Пользователь ${username} успешно разлогинен`);
    } 
  } catch (error) {
    throw new Error('Ошибка при logout' + error.message)
  }
    
    
}


module.exports = logout