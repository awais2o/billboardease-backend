const express = require('express')
const { register, login } = require('../Controller/AuthController')
const Route = express.Router()

Route.route('/register').post(register)
Route.route('/login').post(login)

module.exports = Route
