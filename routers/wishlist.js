const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlist');
router.post('/', addToWishlist);
router.delete('/', removeFromWishlist);
router.get('/:userId', getWishlist);

module.exports = router;
