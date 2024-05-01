const express = require('express')
const { getTags } = require('../Controller/TagController')

const router = express.Router()

router.get('/', getTags)

module.exports = router
