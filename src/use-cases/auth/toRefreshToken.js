'use strict'
const ValidationError = require('../../lib/ValidationError')
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const errorHandler = require('../../lib/errorHandler')
const removeBearer = require('../../lib/removeBearer')
const toRefreshToken = async (refreshTokenData) => {
   try {
      const refreshToken = refreshTokenData.refreshToken 
      if (!refreshToken || typeof refreshToken !== 'string') {
         throw ValidationError.missingField('Refresh token must be a string')
      }
      const verifiedToken = TokenService.verifyRefreshToken(refreshToken)
      if (!verifiedToken) {
         throw ValidationError.missingField('Invalid or expired refresh token')
      }

      const storedToken = await TokenStorage.getByUsernameToken(verifiedToken.username, refreshToken)
      if (!storedToken || storedToken !== refreshToken) {
         throw ValidationError.missingField('Refresh token not found or mismatched')
      }

      const tokens = TokenService.refreshAccessToken(refreshToken)
      return tokens
   } catch (error) {
      throw errorHandler(error)
   }
}
const check = async (queryParams,token) => {
   
   const clearToken = removeBearer(token)
   if (!clearToken) throw PermissionError.unauthorized()
   const decodedToken = TokenService.verifyAccessToken(clearToken)
   let is_alive = false
   if(decodedToken){
      is_alive =  true
   }
   return {
      is_alive: is_alive
   }

}

module.exports = {toRefreshToken, check}