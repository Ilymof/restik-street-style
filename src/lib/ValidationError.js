const AppError = require('./AppError')

const throwValidationError = (detail) => {
  throw new AppError({
    type: 'validation',
    message: 'Ошибка валидации',
    detail: detail,
    status: 400,
    toClient: true,
    toLogs: true
  });
};


module.exports = throwValidationError
