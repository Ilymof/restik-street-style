const AppError = require('./AppError')

const throwValidationError = (message, detail = null) => {
  throw new AppError({
    type: 'validation',
    message: message,  
    detail: detail || message,
    status: 400,
    toClient: true,
    toLogs: true
  });
};


module.exports = throwValidationError
