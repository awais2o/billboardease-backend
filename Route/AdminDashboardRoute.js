const express = require('express')
// const { getCurrentBid, placeBid } = require('../Controller/BidController') // Adjust the path as necessary
const { verifyAccess } = require('../VerifyToken')
const {
  getTotalBillboards,
  getRecentBillboards,
  getTotalUsers1,
  getRecentAdvertisersCount,
  getTotalUsers2,
  getTotalRevenue,
  getAverageBid,
  getMonthlyRevenueGrowth
} = require('../Controller/AdminDashboardController')

const router = express.Router()
router.get('/totalbillboard', verifyAccess([1]), getTotalBillboards)
router.get('/recentbillboards', verifyAccess([1]), getRecentBillboards)
router.get('/totaladvertisers', verifyAccess([1]), getTotalUsers1)
router.get('/recentadvertisers', verifyAccess([1]), getRecentAdvertisersCount)
router.get('/totaladmins', verifyAccess([1]), getTotalUsers2)
router.get('/totalrevenue', verifyAccess([1]), getTotalRevenue)
router.get('/averagebid', verifyAccess([1]), getAverageBid)
router.get('/monthlygrowth', verifyAccess([1]), getMonthlyRevenueGrowth)

module.exports = router
