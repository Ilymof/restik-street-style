const removeBearer = require('../../lib/removeBearer')
const TokenService = require('../../services/auth/JWTService')
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const admins = db('admins')
const throwValidationError = require('../../lib/ValidationError')


async function deleteAdmin(args){
    const username = args.username
    const sql = `
        DELETE FROM admins WHERE username = $1
    `  
    try {
        await safeDbCall(() => admins.query(sql, [username]))
        console.log(`Админ с логином: ${username} был успешно удалён`);
    } catch (error) {
        throwValidationError('Ошибка при удалении админа')
    }
 
}

module.exports = deleteAdmin