const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSettingSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    mineId: {
        type: Schema.Types.ObjectId,
        ref: 'Mine',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserSetting = mongoose.model('UserSetting', UserSettingSchema);

module.exports = UserSetting;
