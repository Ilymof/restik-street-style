'use strict'

const TokenService = require('@services/auth/JWTService')
const removeBearer = require('@lib/removeBearer')
const PermissionError = require('./PermissionError')
const { ACCESS_CONTROL } = require('../roles')

const restrictAccess = (token, url) => {
    try {
        const decoded = TokenService.verifyAccessToken(removeBearer(token))
        if (!decoded) {
            throw PermissionError.unauthorized()
        }

        const userRole = decoded?.role ?? 0
        const cleanUrl = url.split('?')[0]
        const allowedRoles = ACCESS_CONTROL[cleanUrl] || []

        if (allowedRoles.length && !allowedRoles.includes(userRole)) {
            throw PermissionError.forbiddenAction(`Endpoint ${cleanUrl} requires one of: ${allowedRoles.join(', ')}`)
        }

        return { id: decoded.admin_id, role: userRole }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new PermissionError('Недействительный или истекший токен', 'jwt expired')
        }
        if (error.name === 'JsonWebTokenError') {
            throw PermissionError.unauthorized('Invalid token')
        }
        throw error // Пробрасываем другие ошибки, чтобы они обрабатывались выше
    }
}

module.exports = restrictAccess