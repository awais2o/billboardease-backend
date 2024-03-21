const express = require('express')
const { register } = require('../Controller/AuthController')
const Route = express.Router()

Route.route('/register').post(register)

module.exports = Route
