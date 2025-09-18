const removeBearer = require('../../lib/removeBearer')
const TokenStorage = require('../../storages/TokenStorage')
const TokenService = require('../../services/auth/JWTService')
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const admins = db('admins')


async function deleteAdmin(args, accessToken){
    const username = args.username
    const sql = `
        DELETE FROM admins WHERE username = $1
    `
    try {   
         const clearToken = removeBearer(accessToken)
         const verifiedAccessToken = TokenService.verifyAccessToken(clearToken)
         
         if(verifiedAccessToken && verifiedAccessToken.role == 2)
         {
            await safeDbCall(() => admins.query(sql, [username]))
            console.log(`Админ с логином: ${username} был успешно удалён`);
         } 
    } catch (err) {
        throw new Error('Ошибка сервера: ' + err.message)
    }
   
}

module.exports = deleteAdmin