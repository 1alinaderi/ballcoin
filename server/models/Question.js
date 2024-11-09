const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    text: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: true, updatedAt: false } });

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
