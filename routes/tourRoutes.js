const express = require('express')
const { getToursWithin, getDistances, aliasTopTours, getTours, newTour, getTour, updateTour, deleteTour, getTourStats, getMonthlyPlan, uploadTourImages, resizeTourImages } = require('../controllers/tourController')
const { protect, restrictTo } = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')
const tourRouter = express.Router()

// tourRouter.param('id', validateId)

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)

tourRouter.route('/distancs/:latlng/unit/:unit')
    .get(getDistances)

tourRouter.use('/:tourId/reviews', reviewRouter)

tourRouter.route('/top-5-tours')
    .get(aliasTopTours, getTours)

tourRouter.route('/getTourStats')
    .get(getTourStats)

tourRouter.route('/getMonthlyPlan/:year')
    .get(protect, restrictTo('admin', 'leadGuide'), getMonthlyPlan)

tourRouter.route('/')
    .get(getTours)
    .post(protect, restrictTo('admin', 'leadGuide'), newTour)

tourRouter.route('/:id')
    .get(getTour)
    //'/api/v1/tours:id' this works as well, i.e .../api/v1/tours3 will trigger this patch request
    .patch(protect, restrictTo('admin', 'leadGuide'), uploadTourImages, resizeTourImages, updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = tourRouter