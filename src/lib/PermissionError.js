'use strict'

const AppError = require('./AppError')

class PermissionError extends AppError {
    constructor(message, detail = null) {
        super({
            type: 'permission',
            message,
            detail,
            toClient: true,
            toLogs: false
        })
    }

    static unauthorized(detail = null) {
        return new PermissionError('Требуется токен авторизации', detail || 'jwt must be provided')
    }

    static forbiddenAction(detail) {
        return new PermissionError('Доступ запрещен', detail)
    }

    static insufficientRole(role) {
        return new PermissionError('Недостаточно прав', `Required role: ${role}`)
    }

    static accountBlocked() {
        return new PermissionError('Аккаунт заблокирован')
    }
}

module.exports = PermissionError