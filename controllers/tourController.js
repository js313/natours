const multer = require('multer')
const sharp = require('sharp')
const AppError = require('../utils/appError')
const Tour = require('./../models/tourModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }
    else {
        cb(new AppError('Please upload only images', 400), false)
    }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

module.exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

module.exports.resizeTourImages = catchAsync(async(req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next()
    const imageCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverName}`)
    req.body.imageCover = imageCoverName
    req.body.images = []
    await Promise.all(req.files.images.map(async (image, index) => {
        const imageName = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`
        await sharp(image.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${imageName}`)
        req.body.images.push(imageName)
    }))
    next()
})

module.exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5
    req.query.page = 1
    req.query.sort = "-ratingsAverage,price"
    req.query.fields = "name,price,ratingsAverage,summary,difficulty"
    next()
}

module.exports.getTours = factory.getAll(Tour)

module.exports.getTour = factory.getOne(Tour, { path: 'reviews' })
module.exports.newTour = factory.createOne(Tour)
module.exports.updateTour = factory.updateOne(Tour)
module.exports.deleteTour = factory.deleteOne(Tour)

module.exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: { 
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsAverage' },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})
module.exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1
    const stats = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${year + 1}-01-01`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                count: { $sum: 1 },
                name: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {_id: 0}
        },
        {
            $sort: { count: 1 }
        },
        {
            $limit: 12
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

module.exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    if(!lng || !lat) {
        next(new AppError("Please provide latitude and longitude in the format <lat>,<lng>", 400))
    }

    const radius = unit === 'mi' ? (distance / 3963.2) : (distance / 6378.1)
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }})

    res.status(200).json({
        status: 'success',
        count: tours.length,
        data: {
            tours
        }
    })
})

module.exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    if(!lng || !lat) {
        next(new AppError("Please provide latitude and longitude in the format <lat>,<lng>", 400))
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        count: distances.length,
        data: {
            distances
        }
    })
})