const express = require('express')
const { uploadFile } = require('../Controller/UploadController') // Adjust the path as necessary
const { verifyAccess } = require('../VerifyToken')

const router = express.Router()

// POST endpoint for file upload
router.post('/uploadfile', verifyAccess([1,2 ]), uploadFile)

module.exports = router
