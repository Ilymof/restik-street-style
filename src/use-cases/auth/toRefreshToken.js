'use strict'
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const removeBearer = require('../../lib/removeBearer')
const PermissionError = require('../../lib/PermissionError')
const throwValidationError = require('../../lib/ValidationError')
const jwt = require('jsonwebtoken')

const toRefreshToken = async (accessTokenData) => {
      const accessToken = accessTokenData.accessToken
      if (!accessToken || typeof accessToken !== 'string') {
         throwValidationError('Access token must be a string')
      }
      const decodedAccessToken = jwt.decode(accessToken)
      if (!decodedAccessToken) {
         throwValidationError('Invalid access token')
      }

      const refreshToken = await TokenStorage.getByUsernameToken(decodedAccessToken.username)
      if (!refreshToken || refreshToken !== refreshToken) {
         throwValidationError('Refresh token not found or mismatched')
      }

      const tokens = TokenService.refreshAccessToken(refreshToken)
      return tokens

}
const check = async (queryParams,accessToken) => {
   
   const clearToken = removeBearer(accessToken)
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