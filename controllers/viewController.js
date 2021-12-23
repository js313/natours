const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
const catchAsync = require("../utils/catchAsync")
const User = require('../models/userModel')

module.exports.alerts = (req, res, next) => {
    const { alert } = req.query
    if(alert === 'booking') {
        res.locals.alert = 'Your booking was successful!'
    }
    next()
}

module.exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find()

    res.status(200).render('overview', {
        title: 'Exciting tours for adventurous people',
        tours
    })
})

module.exports.getMyTours = catchAsync(async (req, res) => {
    const bookings = await Booking.find({user: req.user.id })

    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({_id: { $in: tourIds }})

    res.status(200).render('overview', {
        title: 'My Booked Tours',
        tours
    })
})

module.exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate('reviews')

    if(!tour) {
        return next(new AppError('No tour found with that name.', 404))
    }
    res.status(200)
      .render('tour', {
        title: tour.name,
        tour
    })
})

module.exports.getLoginForm = (req, res) => {
    res.status(200)
      .render('login', {
          title: 'Login'
      })
}

module.exports.getUserProfile = (req, res, next) => {
    res.status(200)
      .render('profile', {
          title: 'Your Profile'
      })
}

module.exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {
            email: req.body.email,
            name: req.body.name
        }, {
            runValidators: true,
            new: true
        })
        res.status(201).render('profile', {
            title: 'Your Profile',
            user
        })
    }
    catch(err) {
        console.log(err)
        next()
    }
}