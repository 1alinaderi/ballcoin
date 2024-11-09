const mongoose = require('mongoose');

const UserTaskSchema = new mongoose.Schema({
    userId: { type: Number, required: true, ref: 'User' },
    taskId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Task' },
    status: { type: String, enum: ['started', 'completed'], default: 'started' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
});

module.exports = mongoose.model('UserTask', UserTaskSchema);
