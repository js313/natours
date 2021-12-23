const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const Tour = require("../models/tourModel")
const Booking = require("../models/bookingModel")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const { createOne, getOne, getAll, updateOne, deleteOne } = require('../controllers/handlerFactory')

module.exports.checkoutSession = catchAsync(async(req, res, next) => {
    const tour = await Tour.findById(req.params.tourId)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: `${tour.summary}`,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })

    res.status(200).json({
        status: 'success',
        session
    })
})

createBookingCheckout = catchAsync(async (session) => {
    const tour = session.client_reference_id
    const user = (await User.find({email: session.customer_email})).id
    const price = session.line_items[0].amount / 100

    if(tour && user && price) {
        await Booking.create({ tour, user, price })
    }
})

module.exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature']
    let event
    try {
        event = stripe.webhoks.constructEvent(req,body, signature, process.env.STRIPE_WEBHOOK_KEY)
    } catch(err) {
        return res.status(400).send(`webhook error: ${err.message}`)
    }

    if(event.type === 'checkout.session.completed') {
        createBookingCheckout(event.data.object)
        res.status(200).json({
            status: 'success',
            received: true
        })
    }
}

module.exports.createBooking = createOne(Booking)
module.exports.getBookings = getAll(Booking)
module.exports.getBooking = getOne(Booking)
module.exports.updateBooking = updateOne(Booking)
module.exports.deleteBooking = createOne(Booking)