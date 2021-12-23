const util = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const Email = require('../utils/email')

function signToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

function signAndSendToken(req, res, user, statusCode, sendUser) {
    const token = signToken(user)
    user.password = undefined
    if(!sendUser) user = undefined
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 *1000),
        httpOnly: true,
        secure: (req.secure || req.headers('x-forward-proto') === 'https')
    }

    res.cookie('jwt', token, cookieOptions)

    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

module.exports.signup = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.phto,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    })
    const url = `${req.protocol}://${req.get('host')}/profile`
    await new Email(newUser, url).sendWelcome()
    return signAndSendToken(req, res, newUser, 201, true)
})

module.exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if(!email || !password) {
        return next(new AppError("Email or Password not defined", 400))
    }
    const user = await User.findOne({ email }).select('+password')
    if(user && await user.checkPassword(password, user.password)) {
        return signAndSendToken(req, res, user, 201, true)
    }
    next(new AppError("Invalid Username or Password", 401))    
})

module.exports.protect = catchAsync(async (req, res, next) => {
    let token = undefined
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    else if(req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if(!token) {
        next(new AppError('Please login to get access', 401))
    }
    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if(!user) {
        return next(new AppError("The user belonging to this token, does no longer exist", 401))
    }
    if(await user.changePasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password, Please login again", 401))
    }
    req.user = user
    res.locals.user = user
    next()
})

module.exports.restrictTo = (...roles) => {     //multiple arguments    //this middleware need 'protect' midd. to run before it.
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {     //saved user to request in previous middleware function
            return next(new AppError("You are not authorized to perform that action", 403))
        }
        next()
    }
}

module.exports.forgotPassword = catchAsync(async(req, res, next) => {
    const email = req.body.email
    const user = await User.findOne({email})
    if(!user) {
        return next(new AppError("No user found with that email ID", 404))
    }

    const resetToken = user.generateResetToken()
    await user.save({ validateBeforeSave: false })

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        await new Email( 
            user,
            resetURL
        ).sendPasswordReset()
        res.status(200).json({
            status: 'success',
            message: 'Token sent to your email'
        })
    } catch(err) {
        console.log(err)
        user.passwordResetToken = undefined,
        user.passwordResetExpires = undefined
        return next(new AppError("There was an error sending the email. Try again later!", 500))
    }
})

module.exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

    if(!user)
        return next(new AppError("Password Token has expired or is invalid, Please try again", 400))
    
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    
    await user.save()   //Need to validate thus cannot use findoneandupdate

    res.status(205).json({
        status: 'success',
        message: 'Password changed successfully, please login again'
    })
})

module.exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password')  //as req.user does not store password
    if(await user.checkPassword(req.body.currentPassword, user.password)) {
        user.password = req.body.newPassword
        user.passwordConfirm = req.body.confirmPassword
        await user.save()
        return signAndSendToken(req, res, user, 205, false)
    }
    next(new AppError("Current password is  not valid", 400))

})

module.exports.isLoggedIn = async (req, res, next) => {
    try {
        let token = undefined
        if(req.cookies.jwt) {
            token = req.cookies.jwt
        }
        else {
            return next()
        }
        const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if(!user) {
            return next()
        }
        if(await user.changePasswordAfter(decoded.iat)) {
            return next()
        }
        res.locals.user = user
        req.user = user
        return next()
    } catch {
        return next()
    }
}

module.exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 5000),
        httpOnly: true
    })
    res.status(201).json({
        status: 'success'
    })
})