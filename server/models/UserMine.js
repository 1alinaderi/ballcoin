const mongoose = require('mongoose');

const UserMineSchema = new mongoose.Schema({
    userId: { type: Number, required: true, ref: 'User' },
    mineId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Mine' },
    levelId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'MineLevel' },
    status: { type: String, default: 'completed' },
    completedAt: { type: Date, default: Date.now },
});

UserMineSchema.index({ userId: 1, mineId: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('UserMine', UserMineSchema);
