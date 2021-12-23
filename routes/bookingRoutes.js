const express = require('express')
const { checkoutSession, getBookings, createBooking, getBooking, updateBooking, deleteBooking } = require('../controllers/bookingController')
const authController = require('../controllers/authController')

const bookingRouter = express.Router()

bookingRouter.use(authController.protect, authController.restrictTo('admin', 'lead-guide'))

bookingRouter.route('/checkout-session/:tourId')
    .get(checkoutSession)

bookingRouter.route('/')
    .get(getBookings)
    .post(createBooking)

bookingRouter.route('/:id')
    .get(getBooking)
    .patch(updateBooking)
    .delete(deleteBooking)

module.exports = bookingRouter