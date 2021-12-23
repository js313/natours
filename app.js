const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorControllers')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const { webhookCheckout } = require('./controllers/bookingController')

const app = express()

app.enable('trust proxy')
app.use(cors())     //only works for basic requests like get and post
app.options('*', cors())    //browser sends an option request just like get, post, patch, etc. when in preflight phase/ OR to work for other req also

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))     //no need to think about joining with appropriate paths for Windows/linux server 
app.use(express.static(path.join(__dirname, 'public')))

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
 
      fontSrc: ["'self'", 'https:', 'data:'],

      frameSrc: ['https://*.stripe.com'],

      scriptSrc: ["'self'", "'unsafe-inline'", 'https://*.cloudflare.com', 'https://*.mapbox.com', 'https://*.stripe.com', 'blob:'],
 
      scriptSrcElem: ["'self'",'https:', 'https://*.cloudflare.com', 'https://*.mapbox.com', 'https://*.stripe.com', 'blob:'],
 
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
 
      connectSrc: ["'self'", 'data', 'https://*.cloudflare.com', 'https://*.mapbox.com', 'https://*.stripe.com', 'blob:']
    },
  })
)

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, Please try again in an hour!'
})

app.use(compression())

app.use('/api', limiter)    //only to routes starting with /api

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout)

app.use(express.json({ limit: '10kb' }))    //limit the payload to 10kb
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(mongoSanitize())
app.use(xss())
app.use(hpp({ whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
] }))


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/', viewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404))    //express automatically goes to error handler middl. when arg. passed in next
})

app.use(globalErrorHandler)

module.exports = app