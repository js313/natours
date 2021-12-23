const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const ApiFeatures = require('./../utils/appFeatures')

module.exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(204).end()
})

module.exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    if(!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

module.exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    })
})

module.exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if(populateOptions)
        query = query.populate('reviews')     //Don't want to populate for getAllTours

    const doc = await query
    if(!doc) {
        return next(new AppError('No document found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

module.exports.getAll = Model => catchAsync(async (req, res, next) => {
    let filter = {}
    if(req.params.tourId)   filter = { tour: req.params.tourId }    //For nested Review route

    const features = new ApiFeatures(Model.find(filter), req.query)
    let query = features.filter()
    query = features.sort()
    query = features.select()
    query = features.paginate()
    const docs = await query   //When we await the query object is executed, nad data is returned
    res.status(200).json({      //Jsend specifications
        status: 'success',
        count: docs.length,
        data: {
            docs
        }
    })
})