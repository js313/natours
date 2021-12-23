const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const catchAsync = require('../utils/catchAsync')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "User must have a name"]
    },
    email: {
        type: String,
        required: [true, "User must have an email"],
        unique: true,
        lowercase: true,     //Not a validator, transforms email to lowercase
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, "User must have a password"],
        minLength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "User must confirm his password"],
        validate: {
            validator: function(passConfirm) {
                return passConfirm === this.password
            },
            message: "Passwords do not match"
        }
    },
    role: {
        type: String,
        enum: ["admin", "tour-guide", "guide", "user"],
        default: "user"
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()

    const saltRounds = 12
    this.password = await bcrypt.hash(this.password, saltRounds)
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000  //decreased by a second, as sometimes jwt token is created before this is set
    next()
})

userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}})   //for old users not having a active property
    next()
})

userSchema.methods.checkPassword = async function(userPass, DBPass) {
    return await bcrypt.compare(userPass, DBPass)
}

userSchema.methods.changePasswordAfter = async function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()) / 1000
        return JWTTimestamp < changedTimeStamp
    }
    return false
}

userSchema.methods.generateResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //10 min.
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User