const express = require('express')

const { verifyAccess } = require('../VerifyToken')
const {
  getUsersByType,
  banUser,
  unbanUser
} = require('../Controller/AllUsersController')

const Route = express.Router()

// Only allow get for user type 2, and all operations for user type 1
Route.get('', verifyAccess([1]), getUsersByType)
Route.put('/ban/:userId', verifyAccess([1]), banUser)
Route.put('/unban/:userId', verifyAccess([1]), unbanUser)

// Restrict these operations to user type 1 only

module.exports = Route
