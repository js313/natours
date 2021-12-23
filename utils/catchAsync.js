const catchAsync = (fn) => {
    return async (req, res, next) => {
        // fn(req, res, next).catch(next)  //this passes the incoming error object into next, similar but without async await
        try {
            await fn(req, res, next)
        } catch(err) {
            next(err)
        }
    }
}

module.exports = catchAsync