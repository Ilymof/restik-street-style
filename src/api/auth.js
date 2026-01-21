'use strict'

const db = require('../db.js')
const admins = db('admins')
const safeDbCall = require('../lib/safeDbCall.js')
const loginAdmin = require('../use-cases/auth/login.js')
const logout = require('../use-cases/auth/logout.js')
const {toRefreshToken, check} = require('../use-cases/auth/toRefreshToken.js')
const {deleteSubscription} = require('../use-cases/push-subs/push-methods')


module.exports = {
    async read () {
        return await safeDbCall(() => admins.read())
    }, 

    async login(args, req, res) {
        return await loginAdmin(args, res)
    },

    async refresh(args, req, res) {
        return await toRefreshToken(req)
    },
    
    async 'token-check'(args,req){
        const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || null;
        return await check(accessToken)
    },

    async logout(endpoint, req) {   
        if(endpoint){
            await deleteSubscription(endpoint)
        }
        return await logout(req)
    }
}
