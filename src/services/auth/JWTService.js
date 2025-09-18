'use strict'

const jwt = require('jsonwebtoken')
const { JWT } = require('../../config')

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

   refreshAccessToken(refreshToken) {
      const decoded = this.verifyRefreshToken(refreshToken)
      if (!decoded) {
         throw new Error('Invalid or expired refresh token')
      }
      // Генерируем новый access-токен с тем же payload
      const payload = {
         sub: decoded.sub,
         role: decoded.role,
         is_blocked: decoded.isBlocked,
         auth_provider: decoded.auth_provider,
         provider_user_id: decoded.provider_user_id
      }
      const accessToken = jwt.sign(payload, JWT.accessSecret, {
         expiresIn: JWT.accessExpiresIn
      })
      return { accessToken }
   },
   logout(refreshToken) {
      const decoded = this.verifyRefreshToken(refreshToken)
      if (!decoded) {
         throw new Error('Invalid or expired refresh token')
      }
      return decoded.sub 
   }
}

module.exports = TokenService