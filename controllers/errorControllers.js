const AppError = require("../utils/appError")

const sendDevError = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {    //API
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    else {                                       //RENDERED WEBSITE
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong.',
            message: err.message
        })
    }
}

const sendProdError = (err, req, res) => {
    if(err.isOperational) {
        if(req.originalUrl.startsWith('/api')) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        else {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong.',
                message: err.message
            })
        }
    } 
    else {  //Programming or other unknown error ocurred
        if(req.originalUrl.startsWith('/api')) {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong',
            })
        }
        else {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong.'
            })
        }
    }
}

function handleCastErrorDB(err) {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

function handleDupFieldsErrorDB(err) {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value ${value}, please use another value.`
    return new AppError(message, 400)
}

function handleValidationErrorDB(err) {
    const errors = Object.values(err.errors).map(el => el.message)
    message = `Invalid input data. ${errors.join(', ')}`
    return new AppError(message, 400)
}

function handleJWTError() {
    new AppError("Invalid JWT, Please login again", 401)
}

function handleJWTExpiredError() {
    new AppError("Your Token has expired, Please login again", 401)
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if(process.env.NODE_ENV === 'development'){
        sendDevError(err, req, res)
    }
    else if(process.env.NODE_ENV === 'production') {
        let error = { ...err }
        console.error(err)
        error.message = err.message
        if(err.name === 'CastError') error = handleCastErrorDB(err)
        else if(err.code === 11000) error = handleDupFieldsErrorDB(err)
        else if(err.name === 'ValidationError') error = handleValidationErrorDB(err)
        else if(err.name === 'JsonWebTokenError') error = handleJWTError()
        else if(err.name === 'TokenExpiredError') error = handleJWTExpiredError()

        sendProdError(error, req, res)
    }
}