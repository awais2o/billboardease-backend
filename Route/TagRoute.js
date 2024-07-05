const express = require('express')
const { getTags, createTag, deleteTag } = require('../Controller/TagController')

const router = express.Router()

router.get('/', getTags)
router.post('/', createTag)
router.delete('/:tag_id', deleteTag)

module.exports = router
