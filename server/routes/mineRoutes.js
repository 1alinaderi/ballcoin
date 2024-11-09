const express = require('express');
const router = express.Router();
const { getMines, purchase } = require('../controllers/mineController');

router.get('/:category', getMines);
router.put('/purchase', purchase);
// router.get('/details/:taskId', getTaskDetails);
// router.post('/complete', completeTaskItem);
// router.post('/watch', watchTaskItem);
// router.post('/check-join', checkTaskStatus);
// router.post('/check-submit', updateUserTaskItemStatus);
// router.post('/claim', claimTaskReward);

module.exports = router;
