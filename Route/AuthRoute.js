const express = require('express')
const {
  register,
  login,
  getUserById,
  updateUserById
} = require('../Controller/AuthController')
const Route = express.Router()
console.log('HIH')
Route.route('/register').post(register)
Route.route('/login').post(login)
Route.route('/user/:user_id').get(getUserById)
Route.route('/user/:user_id').put(updateUserById)

module.exports = Route
