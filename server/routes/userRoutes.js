const express = require('express');
const router = express.Router();
const { getUser, createUser, updateUser, getAvatar, getTopUsers, getServerTime } = require('../controllers/userController');


router.get('/server-time', getServerTime);

router.get('/leaderboard', getTopUsers);
// Get user data by chatId
router.get('/:userId', getUser);
// Create a new user
router.post('/', createUser);
// Update user data
router.put('/', updateUser);
// Get Avatar
router.get('/avatar/:userId', getAvatar)

module.exports = router;
