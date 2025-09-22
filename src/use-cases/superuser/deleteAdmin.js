const removeBearer = require('../../lib/removeBearer')
const TokenService = require('../../services/auth/JWTService')
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const admins = db('admins')
const throwValidationError = require('../../lib/ValidationError')


async function deleteAdmin(args, accessToken){
    const username = args.username
    const sql = `
        DELETE FROM admins WHERE username = $1
    `  
    const clearToken = removeBearer(accessToken)
    const verifiedAccessToken = TokenService.verifyAccessToken(clearToken)
    
    if(verifiedAccessToken && verifiedAccessToken.role == 2)
    {
        await safeDbCall(() => admins.query(sql, [username]))
        console.log(`Админ с логином: ${username} был успешно удалён`);
    } else {
        throwValidationError('Ошибка сервера')
    }
    
   
}

module.exports = deleteAdmin