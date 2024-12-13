const express = require('express');
const router = express.Router();
const lists=require('../controllers/lists')

router.get('/:ownerId',lists.getReviewsByOwnerId);
module.exports=router