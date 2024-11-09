const mongoose = require('mongoose');

const UserTaskItemSchema = new mongoose.Schema({
    userId: { type: Number, required: true, ref: 'User' },
    taskId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Task' },
    taskItemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TaskItem' },
    status: { type: String, enum: ['watched', 'done'], default: 'watched' },
    watchedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
});

module.exports = mongoose.model('UserTaskItem', UserTaskItemSchema);
