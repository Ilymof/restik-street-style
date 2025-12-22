const AppError = require('./AppError')

const throwValidationError = (message, detail = null, status = null) => {
  throw new AppError({
    type: 'validation',
    message: message,  
    detail: detail,
    status: status ? status : 400,
    toClient: true,
    toLogs: true
  });
};


module.exports = throwValidationError
