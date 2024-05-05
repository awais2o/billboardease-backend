const express = require('express')
const {
  addToWishlist,
  getWishlist
} = require('../Controller/WishlistController')

const router = express.Router()

router.post('/:id', addToWishlist)
router.get('/', getWishlist)

module.exports = router
