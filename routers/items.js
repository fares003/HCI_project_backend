const express = require('express');
const router = express.Router();
const items =require('../controllers/lists')
router.get('/',items.getAllItems)

module.exports=router