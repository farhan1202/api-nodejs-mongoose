const express = require("express")
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const productRoute = require("./api/route/product");
const orderRoute = require("./api/route/order");

mongoose.connect('mongodb+srv://hafifi1202:' + process.env.MONGO_PASS + '@cluster0-v1gym.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser : true, useUnifiedTopology: true
})

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Controll-Allow-Origin', '*')
    res.header('Access-Controll-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
        res.header('Access-Controll-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

app.use("/product", productRoute)
app.use("/order", orderRoute)

app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;
