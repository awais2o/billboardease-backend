const express = require('express')
const { verifyAccess } = require('../VerifyToken')
const {
  getAllContents,
  addContent,
  getContentById,
  updateContent,
  deleteContent
} = require('../Controller/ContentController')

const router = express.Router()

router.post('/', verifyAccess([1, 2]), addContent)

router.get('/', verifyAccess([1, 2]), getAllContents)

router.get('/:id', verifyAccess([1, 2]), getContentById)

router.put('/:id', verifyAccess([1]), updateContent)

router.delete('/:id', verifyAccess([1]), deleteContent)

module.exports = router
