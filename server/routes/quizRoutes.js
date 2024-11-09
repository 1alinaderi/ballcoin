const express = require('express');
const router = express.Router();
const { getQuizQuestion, submitUserAnswer } = require('../controllers/quizController');

// Define routes
router.get('/', getQuizQuestion);
router.post('/submit', submitUserAnswer);

module.exports = router;
