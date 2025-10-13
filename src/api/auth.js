'use strict'

const db = require('../db.js')
const admins = db('admins')
const safeDbCall = require('../lib/safeDbCall.js')
const loginAdmin = require('../use-cases/auth/login.js')
const logout = require('../use-cases/auth/logout.js')
const {toRefreshToken, check} = require('../use-cases/auth/toRefreshToken.js')


module.exports = {
    async read () {
        return await safeDbCall(() => admins.read())
    }, 

    async login(rawBody) {
        return await loginAdmin(rawBody)
    },

    async refresh(accessToken) {
        return await toRefreshToken(accessToken)
    },
    
    async 'token-check'(queryParams,accessToken){
        return await check(queryParams,accessToken)
    },

   async logout(refreshToken) {
        return await logout(refreshToken)
    },

}
