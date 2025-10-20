'use strict'

const PermissionError = require('./PermissionError')
const AppError = require('./AppError') // Добавляем импорт AppError

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

    if (error instanceof AppError) { // Добавляем обработку AppError
        return {
            status: error.status || 400,
            message: error.message || 'Ошибка валидации',
            type: error.type || 'validation',
            detail: error.detail || 'Unknown validation error'
        }
    }

    return {
        status: 500,
        message: 'Внутренняя ошибка сервера',
        type: 'server',
        detail: error.message || 'Unknown error'
    }
}