const express = require('express');
const router = express.Router();
const { getTasks, getTaskDetails, startTask, completeTaskItem, checkTaskStatus, watchTaskItem, updateUserTaskItemStatus, claimTaskReward } = require('../controllers/taskController');

router.get('/:category', getTasks);
router.get('/details/:taskId', getTaskDetails);
router.post('/start', startTask);
router.post('/complete', completeTaskItem);
router.post('/watch', watchTaskItem);
router.post('/check-join', checkTaskStatus);
router.post('/check-submit', updateUserTaskItemStatus);
router.post('/claim', claimTaskReward);

module.exports = router;
