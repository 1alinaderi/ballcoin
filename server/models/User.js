const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {type: Number, required: true, unique: true},
    chatId: { type: String, required: true },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    avatar: { type: String },
    coins: { type: Number, default: 0 },
    profits: { type: Number, default: 0 },
    touches: { type: Number, default: 0 },
    energy: { type: Number, default: 500 },
    level: { type: String, default: 'Beginner' },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null },
    turboUses: { type: Number, default: 3 },
    fullEnergyUses: { type: Number, default: 3 },
    lastTurboUse: { type: Date, default: null },
    lastFullEnergyUse: { type: Date, default: null },
    tapLevel: { type: Number, default: 1 },
    speedLevel: { type: Number, default: 1 },
    energyLevel: { type: Number, default: 1 },
    bot: { type: Boolean, default: false },
    lastTapUse: { type: Date, default: null },
    skin: { type: String, default: 'Basic' }, // Default skin
    skins: { type: [String], default: ['Basic'] } // Array of purchased skins
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
