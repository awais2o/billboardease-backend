const express = require('express')
const { uploadFile, getImageURL } = require('../Controller/UploadController') // Adjust the path as necessary
const { verifyAccess } = require('../VerifyToken')
const {
  getMyWinnings,
  attachContentToBid,
  getUpcomingOrderDetails,
  approveContent
} = require('../Controller/ProceedController')

const router = express.Router()

// POST endpoint for file upload
// router.post('/uploadfile', verifyAccess([1, 2]), uploadFile)
router.get('/mywinnings', verifyAccess([2]), getMyWinnings)
router.post('/attach-content', verifyAccess([2]), attachContentToBid)
router.get('/allcontent', verifyAccess([1]), getUpcomingOrderDetails)
router.post('/approve-content', verifyAccess([1]), approveContent)
router.post('/disapprove-content', verifyAccess([1]), approveContent)

module.exports = router
