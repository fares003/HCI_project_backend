const express = require('express');
const router = express.Router();
const loginControl=require('../controllers/login')

router.post('/',loginControl.handleLogin)

module.exports=router