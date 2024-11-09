const UserSetting = require('../models/UserSetting');
const Setting = require('../models/Setting');
const Mine = require('../models/Mine');

// Check if mineId is included in the settings table
const checkMineIdExists = async (req, res) => {
    const {userId, mineId} = req.body;

    try {
        // Check if the mineId exists in the settings collection
        const setting = await Setting.findOne({mineId: mineId});

        if (!setting) {
            return res.status(404).json({error: 'Mine not found in settings'});
        }

        // Check if user already has this mineId in their user settings
        const userSettingExists = await UserSetting.findOne({userId, mineId});

        if (userSettingExists) {
            return res.status(400).json({error: 'Mine already purchased'});
        }

        // Save the userId and mineId in the user settings
        const newUserSetting = new UserSetting({userId, mineId});
        await newUserSetting.save();

        // Retrieve updated user settings
        const userSettings = await UserSetting.find({userId});

        // Fetch detailed mine information
        const minesWithDetails = await Promise.all(userSettings.map(async (userSetting) => {
            const mineDetail = await Mine.findOne({_id: userSetting.mineId});
            return {
                ...userSetting.toObject(),
                mineDetail
            };
        }));

        return res.status(200).json({success: true, mines: minesWithDetails});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
};

const getUserSettings = async (req, res) => {
    const {userId} = req.body;

    try {
        // Get the current date with the time set to midnight (start of the day)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Retrieve user settings for the current day
        const userSettings = await UserSetting.find({
            userId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (!userSettings || userSettings.length === 0) {
            return res.status(404).json({error: 'No user settings found for today'});
        }

        // Fetch detailed mine information
        const minesWithDetails = await Promise.all(userSettings.map(async (userSetting) => {
            const mineDetail = await Mine.findOne({_id: userSetting.mineId});
            return {
                ...userSetting.toObject(),
                mineDetail
            };
        }));

        return res.status(200).json({success: true, mines: minesWithDetails});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({error: 'Internal Server Error'});
    }
};


module.exports = {
    checkMineIdExists, getUserSettings
};
