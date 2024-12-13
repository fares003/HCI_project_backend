const express = require('express');
const router = express.Router();
const chat =require('../controllers/chat')
router.get('/:userId',chat.getMessages).post('/',chat.sendMessage)


module.exports=router
