const express = require('express')
const {
  getAllBillboards,
  getBillboardById,
  updateBillboard,
  deleteBillboard,
  addBillboard
} = require('../Controller/BillboardController')
const { verifyAccess } = require('../VerifyToken')

const Route = express.Router()

// Only allow get for user type 2, and all operations for user type 1
Route.post('', verifyAccess([1]), addBillboard)
Route.get('', verifyAccess([1, 2]), getAllBillboards)
Route.get('/:id', verifyAccess([1, 2]), getBillboardById)

// Restrict these operations to user type 1 only
Route.put('/:id', verifyAccess([1]), updateBillboard)
Route.delete('/:id', verifyAccess([1]), deleteBillboard)

module.exports = Route
