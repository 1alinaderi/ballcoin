const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MineSchema = new Schema({
    category: {
        type: String,
        enum: ['Players', 'Stadiums', 'Teams', 'Special'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    time: {
        type: Number, // Updated to store time as a number
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the updatedAt field before save
MineSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Mine = mongoose.model('Mine', MineSchema);

module.exports = Mine;
