'use strict'
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const throwValidationError = require('../../lib/ValidationError')
const PermissionError = require('../../lib/PermissionError')


const toRefreshToken = async (req) => {
   const refreshToken = req.headers.refresh_token || null;
   let verified_token = null
   try{
      verified_token = await TokenService.verifyRefreshToken(refreshToken)
   }catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new PermissionError('Недействительный или истекший токен', 'jwt expired')
        }
        if (error.name === 'JsonWebTokenError') {
            throw PermissionError.unauthorized('Invalid token')
        }
        throw error // Пробрасываем другие ошибки, чтобы они обрабатывались выше
    }


   const storedToken = await TokenStorage.getToken(refreshToken)
   if(!storedToken){
      throwValidationError('invalid token')
   }
   
   const payload = { admin_id: verified_token.admin_id, username: verified_token.username, role: verified_token.role }

   const tokens = TokenService.generateTokens(payload)

   return {accessToken:tokens.accessToken}

}
const check = async (accessToken) => { 
   let is_alive = false
   try {
      const decodedToken = TokenService.verifyAccessToken(accessToken)
      is_alive =  true
      return is_alive
   } catch (error) {
      return is_alive
   }

}

module.exports = {toRefreshToken, check}