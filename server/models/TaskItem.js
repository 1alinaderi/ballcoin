const mongoose = require('mongoose');

const TaskItemSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    title: String,
    isSocial: { type: Number, default: 0 },
    isTelegram: { type: Number, default: 0 },
    time: { type: Number, default: 15 },
    code: String,
    link: String,
    status: { type: Number, default: 0 },
    ref: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    // other fields as needed
});

module.exports = mongoose.model('TaskItem', TaskItemSchema);