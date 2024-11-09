const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const Answer = mongoose.model('Answer', AnswerSchema);
module.exports = Answer;
