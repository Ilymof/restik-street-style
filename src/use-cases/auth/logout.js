'use strict';
const bcrypt = require('bcrypt');
const TokenService = require('../../services/auth/JWTService');
const db = require('../../db');
const tokens = db('tokens')
const TokenStorage = require('../../storages/TokenStorage');
const jwt = require('jsonwebtoken')
const safeDbCall = require('../../lib/safeDbCall.js')
const throwValidationError = require('../../lib/ValidationError')

async function logout(req) {
    const refreshToken = req.headers.refreshToken || null;
    
    const sql =`
      DELETE FROM tokens WHERE token = $1
    `

    if(refreshToken) {
        await safeDbCall(() => tokens.query(sql, [refreshToken]))
        console.log(`Пользователь ${refreshToken} успешно разлогинен`);
    } else {
      throwValidationError(`не найден пользователь с токеном: ${refreshToken}`)
    }
}


module.exports = logout