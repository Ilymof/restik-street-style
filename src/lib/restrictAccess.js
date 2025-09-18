'use strict'

const TokenService = require('@services/auth/JWTService')
const removeBearer = require('@lib/removeBearer')
const PermissionError = require('./PermissionError')
const { ACCESS_CONTROL } = require('../roles')

const restrictAccess = (token, url) => {
   const decoded = TokenService.verifyAccessToken(removeBearer(token)) 
   const userRole = decoded?.role ?? 0
   const cleanUrl = url.split('?')[0]
   const allowedRoles = ACCESS_CONTROL[cleanUrl] || []


   if (!decoded) {
      throw PermissionError.unauthorized()
   }

   if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      throw PermissionError.forbiddenAction(`Endpoint ${cleanUrl} requires one of: ${allowedRoles.join(', ')}`)
   }

   return { id: decoded.admin_id, role: userRole }
}

module.exports = restrictAccess