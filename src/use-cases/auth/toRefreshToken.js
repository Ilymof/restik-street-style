'use strict'
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const throwValidationError = require('../../lib/ValidationError')


const toRefreshToken = async (req) => {
   const refreshToken = req.headers.refresh_token || null;
   
   const storedToken = await TokenStorage.getToken(refreshToken)
   if(!storedToken){
      throwValidationError('invalid token')
   }
   
   const verifiedToken = await TokenService.verifyRefreshToken(storedToken)
   
   const payload = { admin_id: verifiedToken.admin_id, username: verifiedToken.username, role: verifiedToken.role }

   const tokens = TokenService.generateTokens(payload)

   return tokens

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