const express = require('express');
const router = express.Router();
const { checkMineIdExists, getUserSettings } = require('../controllers/settingController');  // Import the controller

// Route to check if a mineId exists in the settings collection
router.post('/getUserSetting', getUserSettings);
router.post('/check', checkMineIdExists);

module.exports = router;
