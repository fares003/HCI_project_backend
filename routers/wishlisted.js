const express = require('express');
const router = express.Router();
const insights =require('../controllers/wishlist')
router.get('/:itemId', insights.sellerInsightsController.trackSoldItems)


module.exports=router
