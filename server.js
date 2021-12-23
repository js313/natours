const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const mongoose = require('mongoose')
const app = require('./app')

const DB = process.env.DB_HOST.replace('<password>', process.env.DB_PASSWORD)
mongoose.connect(DB, {}).then(() => {
    console.log('Database Connected')
})
.catch(err => {
    console.log(err)
})

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`Listening at ${port}`)
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

process.on('uncaughtException', err => {
    console.log(err)
    process.exit(1)
})

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...')
    server.close(() => {
        console.log('Process terminated')
    })
})