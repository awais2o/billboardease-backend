const express = require('express')
const {
  getCurrentBid,
  placeBid,
  order
} = require('../Controller/BidController') // Adjust the path as necessary
const { verifyAccess } = require('../VerifyToken')

const router = express.Router()

// GET endpoint for fetching the current highest bid
router.get('/', verifyAccess([1, 2]), getCurrentBid)

// POST endpoint for placing a new bid
router.post('/', verifyAccess([1, 2]), placeBid)
router.post('/order', verifyAccess([1, 2]), order)
module.exports = router
