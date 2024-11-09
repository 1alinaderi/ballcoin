const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Setting Schema
const SettingSchema = new Schema({
    title: {
        type: String,
        required: true  // Will store values like 'firstMine', 'secondMine', etc.
    },
    mineId: {
        type: Schema.Types.ObjectId,
        ref: 'Mine',  // Refers to the Mine model
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
SettingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Define the model with the collection name 'settings'
const Setting = mongoose.model('Setting', SettingSchema); // Explicitly naming the collection as 'settings'

module.exports = Setting;
