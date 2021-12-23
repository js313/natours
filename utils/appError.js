class AppError extends Error {
    constructor(message, statusCode) {
        super(message)  //no need for this.message as super class has that property already
        this.statusCode = statusCode
        this.status = toString(statusCode).startsWith('4') ? 'fail' : 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor) //refer notes and/or docs
    }
}

module.exports = AppError