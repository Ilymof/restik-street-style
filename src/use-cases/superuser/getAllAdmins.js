const removeBearer = require('../../lib/removeBearer')
const TokenService = require('../../services/auth/JWTService')
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const admins = db('admins')
const throwValidationError = require('../../lib/ValidationError')


async function getAllAdmin(){
    const sql = `
        SELECT username, name FROM admins; 
    `  
    try {
        const result = await safeDbCall(() => admins.query(sql, []))
        return result.rows 
    } catch (error) {
        throwValidationError('Ошибка при запросе списка админов')
    }
}

module.exports = getAllAdmin