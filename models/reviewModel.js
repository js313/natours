const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema({
    review: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
})

reviewSchema.index({ user: 1, tour: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

reviewSchema.statics.calcAvgRating = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: { 
                _id: '$tour',
                ratingsCount: { $sum: 1 },
                ratingsAverage: { $avg: '$rating' }
            }
        }
    ])
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsAverage: stats[0].ratingsAverage,
            ratingsQuantity: stats[0].ratingsCount 
        })
    }
    else {
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsAverage: 0,
            ratingsQuantity: 1 
        })
    }
}

reviewSchema.post('save', function() {
    this.constructor.calcAvgRating(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next) {    //for 'findByIdAndUpdate' and 'findByIdAndDelete'
    this.ratingAvg = await this.findOne().clone()  //'this' is the current query here as this is a query middleware
    //used clone as mongoose does not allow execution of same query multiple times have to use clone.
    next()
})

reviewSchema.post(/^findOneAnd/, async function() {
    await this.ratingAvg.constructor.calcAvgRating(this.ratingAvg.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review