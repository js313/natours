const express = require('express')
const { getOverview, getTour, getLoginForm, getUserProfile, updateUserProfile, getMyTours, alerts } = require('../controllers/viewController')
const { isLoggedIn, protect } = require('../controllers/authController')

const viewRouter = express.Router()

viewRouter.use(alerts)

viewRouter.get('/profile', protect, getUserProfile)

viewRouter.get('/my-tours', protect, getMyTours)

viewRouter.use(isLoggedIn)

viewRouter.get('/', getOverview)

viewRouter.get('/tour/:slug', getTour)

viewRouter.get('/login', getLoginForm)

viewRouter.post('/profile', updateUserProfile)

module.exports = viewRouter