// In your routes file
const express = require('express');
const router = express.Router();
const regControl = require('../controllers/regestier');

router.post('/', regControl.handleReg);

module.exports = router;
