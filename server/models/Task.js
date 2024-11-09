const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    category: { type: String, enum: ['Cinema', 'Special', 'Leagues', 'Ref'], required: true },
    coins: { type: Number, required: true },
    league: { type: Number, default: 0 },
    ref: { type: Number, default: 0 },
    type: { type: Number, default: 0 },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    status: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }  // Set default to current date
});

module.exports = mongoose.model('Task', TaskSchema);