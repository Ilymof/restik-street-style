'use strict'
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const removeBearer = require('../../lib/removeBearer')
const PermissionError = require('../../lib/PermissionError')
const throwValidationError = require('../../lib/ValidationError')
const jwt = require('jsonwebtoken')

const toRefreshToken = async (req, res) => {
      const refreshToken = req.cookies.refreshToken; 
      if (!refreshToken) {
         throwValidationError('Refresh token missing');
      }
      const verifiedToken = TokenService.verifyRefreshToken(refreshToken)
      
      if(!verifiedToken){
         throwValidationError('Не правильный токен')
      }

      const storedToken = 
      

      res.cookie('refreshToken', tokens.refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'strict',
         maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return { accessToken: tokens.accessToken };

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