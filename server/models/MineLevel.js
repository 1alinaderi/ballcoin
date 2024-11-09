const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MineLevelSchema = new Schema({
    mineId: {
        type: Schema.Types.ObjectId,
        ref: 'Mine',
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true
    },
    ref: {
        type: Number,
        default: 0 // No prerequisite by default
    },
    limitTime: {
        type: Number,
        default: 0 // No prerequisite by default
    },
    prerequisite: {
        type: Schema.Types.ObjectId, // Reference to the MineLevel that must be bought first
        ref: 'MineLevel',
        default: null // No prerequisite by default
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const MineLevel = mongoose.model('MineLevel', MineLevelSchema);

module.exports = MineLevel;
