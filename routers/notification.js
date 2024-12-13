const express = require('express');
const router = express.Router();
const noti =require('../controllers/chat')
router.get('/:userId',noti.getNotifications)
router.put('/:notificationId', noti.markAsRead);

module.exports=router
