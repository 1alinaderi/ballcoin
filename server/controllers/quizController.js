const Question = require('../models/Question');
const Answer = require('../models/Answer');
const UserAnswer = require('../models/UserAnswer');

// Get a question with four answers
const getQuizQuestion = async (req, res) => {
    const { userId } = req.query;

    try {
        // Get the current date with time set to midnight (start of the day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate the difference in days since the first question was created
        const firstQuestion = await Question.findOne().sort({ createdAt: 1 });
        if (!firstQuestion) {
            return res.status(404).json({ message: 'No questions found' });
        }

        const dayDifference = Math.floor((today - firstQuestion.createdAt) / (1000 * 60 * 60 * 24));

        // Retrieve the question for the current day based on dayDifference
        const question = await Question.findOne().skip(dayDifference);
        if (!question) {
            return res.status(404).json({ message: 'No question available for today' });
        }

        // Check if the user has already answered a question today
        const existingAnswer = await UserAnswer.findOne({
            userId,
            questionId: question._id,
            createdAt: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        // Calculate the remaining time until the next day's question
        const timeRemaining = today.getTime() + 24 * 60 * 60 * 1000 - new Date().getTime();

        // Find answers related to the current day's question
        const answers = await Answer.find({ questionId: question._id }).limit(4);
        if (answers.length < 4) {
            return res.status(404).json({ message: 'Insufficient answers found for the question' });
        }

        res.json({
            question,
            answers,
            alreadyAnswered: !!existingAnswer,
            timeRemaining
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit a user's answer
const submitUserAnswer = async (req, res) => {
    const { userId, questionId, answerId } = req.body;

    try {
        // Get the current date with the time set to midnight (start of the day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if the user has already answered the question today
        const existingAnswer = await UserAnswer.findOne({
            userId,
            questionId,
            createdAt: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (existingAnswer) {
            const timeRemaining = today.getTime() + 24 * 60 * 60 * 1000 - new Date().getTime();
            return res.status(400).json({
                message: 'You have already answered a question today.',
                timeRemaining
            });
        }

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const isCorrect = answer.isCorrect;

        const userAnswer = new UserAnswer({
            userId,
            questionId,
            answerId,
            isCorrect,
            createdAt: new Date()
        });
        await userAnswer.save();

        res.json({ success: true, isCorrect });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getQuizQuestion,
    submitUserAnswer
};
