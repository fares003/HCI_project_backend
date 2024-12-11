const express = require('express');
const router = express.Router();
const items =require('../controllers/lists')
router.get('/',items.getCategories)

module.exports=router
