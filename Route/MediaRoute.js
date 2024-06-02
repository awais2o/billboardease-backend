const express = require('express')
const { uploadFile, getImageURL } = require('../Controller/UploadController') // Adjust the path as necessary
const { verifyAccess } = require('../VerifyToken')

const router = express.Router()

// POST endpoint for file upload
router.post('/uploadfile', verifyAccess([1, 2]), uploadFile)
// router.get('/getfile/:file', verifyAccess([1, 2]), getImageURL)

module.exports = router
