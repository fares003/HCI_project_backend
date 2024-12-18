const express = require('express');
const router = express.Router();
const insights =require('../controllers/wishlist')
router.get('/:sellerId', insights.sellerInsightsController.getWishlistInsights)


module.exports=router
