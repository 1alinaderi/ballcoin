const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const path = require('path');

// Function to generate referral code
function generateReferralCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Function to get the rank of a level
const getLevelRank = async (level) => {
    const tasks = await Task.find({category: 'Leagues'}).sort({coins: 1});
    const levelOrder = tasks.map(task => task.title);
    return levelOrder.indexOf(level);
};

// Function to get the user's current level based on coins
const getUserLevel = async (coins) => {
    const tasks = await Task.find({category: 'Leagues'}).sort({coins: -1});
    for (const task of tasks) {
        if (coins >= task.league) {
            return {
                level: task.title,
                icon: task.icon
            };
        }
    }
    return {
        level: 'Beginner',
        icon: 'default_icon.png'  // Provide a default icon if needed
    };
};

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({userId: req.params.userId});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const SIX_HOURS = 6 * 60 * 60 * 1000; // Six hours in milliseconds
        const now = new Date();

        if (user.turboUses === 0 && user.lastTurboUse && (now - new Date(user.lastTurboUse)) >= SIX_HOURS) {
            user.turboUses = 3;
            user.lastTurboUse = null;
        }

        if (user.fullEnergyUses === 0 && user.lastFullEnergyUse && (now - new Date(user.lastFullEnergyUse)) >= SIX_HOURS) {
            user.fullEnergyUses = 3;
            user.lastFullEnergyUse = null;
        }

        const userLevel = await getUserLevel(user.coins);

        // Ensure user level never decreases
        const currentLevelRank = await getLevelRank(user.level);
        const newLevelRank = await getLevelRank(userLevel.level);

        if (newLevelRank > currentLevelRank) {
            user.level = userLevel.level;
            user.icon = userLevel.icon;
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
};

const createUser = async (req, res) => {
    const {userId, chatId, first_name, last_name, username, avatar, referredBy} = req.body;
    try {
        // Initialize coins to 0
        let coins = 0;
        // If the user is referred, set coins to 5000
        if (referredBy != null) {
            coins = 2000;
        }

        const user = new User({
            userId,
            chatId,
            first_name,
            last_name,
            username,
            avatar,
            referralCode: generateReferralCode(),
            referredBy,
            coins,  // Set the coins based on referral status
            turboUses: 3,
            fullEnergyUses: 3,
            lastTurboUse: null,
            lastFullEnergyUse: null
        });

        const userLevel = await getUserLevel(user.coins);
        user.level = userLevel.level;
        user.icon = userLevel.icon;

        await user.save();

        // If referred, update the referrer's coins
        if (referredBy != null) {
            const referrer = await User.findOne({referralCode: referredBy});
            if (referrer) {
                referrer.coins += 2000;
                await referrer.save();
            }
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({message: 'Error creating user', error});
    }
};

const updateUser = async (req, res) => {
    const {userId, coins, cost, energy, turbo, fullEnergy, boosterType, skin} = req.body;
    try {
        const user = await User.findOne({userId});
        const boosterCost = cost; // Assume the cost for boosters and skins
        const SIX_HOURS = 6 * 60 * 60 * 1000; // Six hours in milliseconds
        const now = new Date();

        if (user) {
            // Update user attributes based on boosterType
            switch (boosterType) {
                case 'Multitap':
                    if (user.coins >= boosterCost) {
                        user.tapLevel += 1;
                        user.coins -= boosterCost;
                    } else {
                        return res.status(400).json({message: 'Insufficient coins'});
                    }
                    break;
                case 'Energy Limit':
                    if (user.coins >= boosterCost) {
                        user.coins -= boosterCost;
                        user.energyLevel += 1;
                    } else {
                        return res.status(400).json({message: 'Insufficient coins'});
                    }
                    break;
                case 'Recharging Speed':
                    if (user.coins >= boosterCost) {
                        user.coins -= boosterCost;
                        user.speedLevel += 1;
                    } else {
                        return res.status(400).json({message: 'Insufficient coins'});
                    }
                    break;
                case 'Tap Bot':
                    if (user.coins >= boosterCost) {
                        user.coins -= boosterCost;
                        user.bot = true;
                    } else {
                        return res.status(400).json({message: 'Insufficient coins'});
                    }
                    break;
                default:
                    break;
            }

            // Update user skin
            if (skin) {
                if (!user.skins.includes(skin)) {
                    if (user.coins >= boosterCost) {
                        user.coins -= boosterCost;
                        user.skins.push(skin);
                    } else {
                        return res.status(400).json({message: 'Insufficient coins'});
                    }
                }
            }

            // Update other attributes
            if (coins !== undefined && coins > 0) {
                user.coins = Math.floor(coins);
                user.lastTapUse = now;
            }
            if (energy !== undefined) user.energy = energy;

            if (turbo) {
                if (user.turboUses > 0 || (!user.lastTurboUse || (new Date() - new Date(user.lastTurboUse)) >= SIX_HOURS)) {
                    user.turboUses -= 1;
                    user.lastTurboUse = now;
                } else {
                    return res.status(400).json({message: 'No Turbo uses left or countdown period not yet over'});
                }
            }

            if (fullEnergy) {
                if (user.fullEnergyUses > 0 || (!user.lastFullEnergyUse || (new Date() - new Date(user.lastFullEnergyUse)) >= SIX_HOURS)) {
                    user.energy = user.energyLevel * 500;
                    user.fullEnergyUses -= 1;
                    user.lastFullEnergyUse = now;
                } else {
                    return res.status(400).json({message: 'No Full Energy uses left or countdown period not yet over'});
                }
            }

            const userLevel = await getUserLevel(user.coins);

            // Ensure user level never decreases
            const currentLevelRank = await getLevelRank(user.level);
            const newLevelRank = await getLevelRank(userLevel.level);

            if (newLevelRank > currentLevelRank) {
                user.level = userLevel.level;
                user.icon = userLevel.icon;
            }

            await user.save();
            res.json(user);
        } else {
            res.status(404).json({message: 'User not found'});
        }
    } catch (error) {
        res.status(400).json({message: 'Error updating user', error});
    }
};

const getAvatar = async (req, res) => {
    try {
        const user = await User.findOne({userId: req.params.userId});
        if (!user || !user.avatar) {
            return res.status(404).send('Image not found.');
        }

        const imagePath = path.resolve(__dirname, user.avatar);
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error retrieving the image:', error);
        res.status(500).send('Failed to retrieve image.');
    }
};

const getReferredUsers = async (req, res) => {
    try {
        const referralCode = req.params.referralCode;

        const referredUserCount = await User.countDocuments({referredBy: referralCode});
        const referredUsers = await User.find({referredBy: referralCode}, 'first_name last_name coins level');

        res.json({
            count: referredUserCount,
            users: referredUsers
        });
    } catch (error) {
        console.error('Error fetching referred users:', error);
        res.status(500).send('Server Error');
    }
};

const getTopUsers = async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({coins: -1}) // Sort by coins in descending order
            .limit(50) // Limit the results to top 50 users
            .select('userId first_name last_name coins avatar level'); // Select only the required fields
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
};

const getServerTime = async (req, res) => {
    try {
        const serverTime = new Date().toISOString(); // Get the current server time in ISO format
        res.json({ serverTime }); // Respond with the server time
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {getUser, createUser, updateUser, getAvatar, getReferredUsers, getTopUsers, getServerTime};
