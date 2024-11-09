const express = require('express');
const router = express.Router();
const { getReferredUsers } = require('../controllers/referralController');

router.get('/:referralCode', getReferredUsers);

module.exports = router;
