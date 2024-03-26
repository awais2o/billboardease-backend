const express = require('express')
const { uploadFile } = require('../Controller/UploadController') // Adjust the path as necessary

const router = express.Router()

// POST endpoint for file upload
router.post('/uploadfile', uploadFile)

module.exports = router
