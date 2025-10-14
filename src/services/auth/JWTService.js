'use strict'

const jwt = require('jsonwebtoken')
const { JWT } = require('../../config')
const throwValidationError = require('../../lib/ValidationError')

 

const TokenService = {
   generateTokens(payload) {
      const accessToken = jwt.sign(payload, JWT.accessSecret, {
         expiresIn: JWT.accessExpiresIn
      })

      const refreshToken = jwt.sign(payload, JWT.refreshSecret, {
         expiresIn: JWT.refreshExpiresIn
      })

      return { accessToken, refreshToken }
   },

   refreshAccessToken(refreshToken) {
      const decoded = this.verifyRefreshToken(refreshToken)
      if (!decoded) {
         throwValidationError('Invalid or expired refresh token')
      }
    
      const payload = {
      admin_id: decoded.admin_id ,
      username: decoded.username ,
      role: decoded.role
      }
      const accessToken = jwt.sign(payload, JWT.accessSecret, {
         expiresIn: JWT.accessExpiresIn
      })
      return { accessToken }
   },
   
   verifyRefreshToken(token) {
      try {
         return jwt.verify(token, JWT.refreshSecret)
      } catch {
         return null
      }
   },

   verifyAccessToken(token){
      try {
         const verifiedToken = jwt.verify(token, JWT.accessSecret)
         return verifiedToken 
      } catch (err) {
         console.dir(err)
         throw err 
      }
   },

   
   logout(refreshToken) {
      const decoded = this.verifyRefreshToken(refreshToken)
      if (!decoded) {
         throwValidationError('Invalid or expired refresh token')
      }
      return decoded.sub 
   }
}

module.exports = {TokenService}