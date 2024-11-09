const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAnswerSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    answerId: {
        type: Schema.Types.ObjectId,
        ref: 'Answer',
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } }); // Add timestamps option

const UserAnswer = mongoose.model('UserAnswer', UserAnswerSchema);
module.exports = UserAnswer;
