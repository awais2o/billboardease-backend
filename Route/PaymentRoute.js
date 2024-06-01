// Route/PaymentRoute.js
const express = require('express')
const { initiatePayment } = require('../Controller/PaymentController')

const router = express.Router()

router.post('/initiate', initiatePayment)

module.exports = router
