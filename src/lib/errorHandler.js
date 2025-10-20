'use strict'
const PermissionError = require('./PermissionError')

module.exports = (error) => {
    if (error instanceof PermissionError) {
        const status = error.message.includes('Требуется токен авторизации') ? 401 : 403
        return {
            status,
            message: error.message,
            type: error.type || 'permission',
            detail: error.detail || 'Unknown permission error'
        }
    }

    return {
        status: 500,
        message: 'Внутренняя ошибка сервера',
        type: 'server',
        detail: error.message || 'Unknown error'
    }
}