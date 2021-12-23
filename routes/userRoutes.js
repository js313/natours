const fs = require('fs')
const express = require('express')
const { getUsers, getUser, updateUser, updateCurrentUser, 
    deleteCurrentUser, deleteUser, getCurrentUser, updateUserPhoto, resizePhoto } = require('../controllers/userController')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo, logout } = require('../controllers/authController')


const userRouter = express.Router()

userRouter.route('/signup')
    .post(signup)
userRouter.route('/login')
    .post(login)
userRouter.route('/forgotPassword')
    .post(forgotPassword)
userRouter.route('/resetPassword/:token')
    .patch(resetPassword)
    
userRouter.route('/logout')
    .get(logout)
userRouter.use(protect)

userRouter.route('/updatePassword')
    .patch(updatePassword)
userRouter.route('/updateCurrentUser')
    .patch(updateUserPhoto, resizePhoto, updateCurrentUser)
userRouter.route('/deleteCurrentUser')
    .delete(deleteCurrentUser)
userRouter.route('/getCurrentUser')
    .get(getCurrentUser, getUser)

userRouter.use(restrictTo('admin'))

userRouter.route('/')
    .get(getUsers)

    
userRouter.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = userRouter