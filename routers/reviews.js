const express = require('express');
const router = express.Router();
const lists=require('../controllers/lists')

router.get('/:productId',lists.getReviews).post('/:productId',lists.addReview);
module.exports=router