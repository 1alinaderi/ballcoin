const User = require('../models/User');
const Mine = require('../models/Mine');
const UserMine = require('../models/UserMine');
const MineLevel = require('../models/MineLevel');

const getMines = async (req, res) => {
    const {category} = req.params;
    const {userId} = req.query;

    // try {
    // Fetch active mines based on category
    let mines = await Mine.find({category, status: 'active'});

    // Attach user-specific data (if needed)
    const minesWithCurrentPurchase = await Promise.all(mines.map(async (mine) => {
        // Fetch last UserMine for this user and mine
        const lastUserMine = await UserMine.findOne({userId, mineId: mine._id}).sort({completedAt: -1});

        let nextLevel;
        let status = 'active'; // Default status is inactive
        let time = null; // Default time is null

        if (!lastUserMine) {
            // If no purchase has been made, set the first level for purchase
            nextLevel = await MineLevel.findOne({mineId: mine._id}).sort({level: 1});
        } else {
            // Find the next level after the last purchased level
            const lastLevel = await MineLevel.findById(lastUserMine.levelId);
            nextLevel = await MineLevel.findOne({mineId: mine._id, level: lastLevel.level + 1});
        }

        // If no next level, it means the user has purchased all levels
        if (!nextLevel) {
            nextLevel = {
                _id: null,
                level: 'max',
                profit: 0,
                price: 0,
                prerequisite: []
            };
            status = 'inactive'; // All levels purchased, so status is active
        } else if (nextLevel.prerequisite) {
            const prerequisiteLevel = await MineLevel.findOne({_id: nextLevel.prerequisite}).populate('mineId');
            nextLevel = {
                ...nextLevel.toObject(),
                prerequisite: {
                    level: prerequisiteLevel.level ? prerequisiteLevel.level : null,
                    profit: prerequisiteLevel.profit ? prerequisiteLevel.profit : null,
                    price: prerequisiteLevel.price ? prerequisiteLevel.price : null,
                    mineName: prerequisiteLevel.mineId.title ? prerequisiteLevel.mineId.title : null // Get the mine name from the populated mineId
                }
            };

            // Check if the prerequisite is already purchased
            const prerequisitePurchase = await UserMine.findOne({
                userId,
                levelId: prerequisiteLevel._id
            });

            // If prerequisite is purchased, set status to active
            if (!prerequisitePurchase) {
                status = 'inactive';
            }
        }

        // Check if there's a limitTime and calculate time remaining
        if (nextLevel && nextLevel.limitTime) {
            const lastPurchaseTime = lastUserMine ? new Date(lastUserMine.completedAt) : null; // Ensure lastPurchaseTime is a Date object

            if (lastPurchaseTime) {
                const limitTimeMs = nextLevel.limitTime * 60 * 1000; // Convert minutes to milliseconds
                const expirationTime = new Date(lastPurchaseTime.getTime() + limitTimeMs);
                const currentTime = new Date();

                if (currentTime < expirationTime) {
                    const timeRemainingMs = expirationTime - currentTime;
                    const timeRemainingSeconds = Math.floor(timeRemainingMs / 1000); // Convert to seconds
                    time = timeRemainingSeconds; // Set time remaining in seconds
                    status = 'inactive';
                }
            }
        }

        return {
            ...mine.toObject(),
            nextLevel,  // Include the next level as currentPurchase
            status,     // Include status ('active' or 'inactive')
            time        // Include time remaining or null
        };
    }));

    res.json(minesWithCurrentPurchase);
    // } catch (error) {
    //     console.error('Error fetching mines:', error);
    //     res.status(500).json({ message: 'Server error', error });
    // }
};


const getUserMineLevel = async (req, res) => {
    const {userId, mineId} = req.params;

    try {
        const userMine = await UserMine.findOne({userId, mineId});
        if (userMine) {
            res.json(userMine);
        } else {
            res.status(404).json({message: 'No level found for this mine and user'});
        }
    } catch (error) {
        console.error('Error fetching user mine level:', error);
        res.status(500).json({message: 'Server error', error});
    }
};

const purchase = async (req, res) => {
    const { userId, mineId, levelId, level } = req.body;

    try {
        // Find the requested level
        const mineLevel = await MineLevel.findOne({ _id: levelId });
        if (!mineLevel) {
            return res.status(404).json({ message: 'Level not found' });
        }

        let userMine = null;

        if (mineLevel.prerequisite) {
            userMine = await UserMine.findOne({
                userId,
                levelId: mineLevel.prerequisite
            });

            if (!userMine) {
                return res.status(400).json({ message: `You must purchase the required level before buying this level.` });
            }
        }

        // Calculate if the time limit is respected
        if (mineLevel.limitTime) {
            const currentTime = new Date();
            const lastPurchaseTime = userMine ? new Date(userMine.completedAt) : null;

            if (lastPurchaseTime && (currentTime - lastPurchaseTime) < mineLevel.limitTime * 60000) { // 60000 ms = 1 minute
                return res.status(400).json({ message: `You must wait ${mineLevel.limitTime} minutes before purchasing this level again.` });
            }
        }

        // Deduct user's coins (assuming you have a User model and balance check)
        const user = await User.findOne({ userId: userId });
        if (user.coins < mineLevel.price) {
            return res.status(400).json({ message: 'Insufficient coins' });
        }

        user.coins -= mineLevel.price;
        user.profits += mineLevel.profit;
        await user.save();

        // Update or create the UserMine record
        userMine = await UserMine.create({ userId, mineId, levelId, completedAt: Date.now() });

        let nextLevelNo = mineLevel.level + 1;
        console.log('levelllllll', nextLevelNo)

        // Fetch the next level correctly
        let nextLevel = await MineLevel.findOne({ mineId: mineId, level: nextLevelNo });
        let status = "active"; // Default status
        let time = null;

        console.log('next', nextLevel)

        // Process the next level based on its prerequisite and limitTime
        if (nextLevel) {
            if (nextLevel.prerequisite) {
                const prerequisiteLevel = await MineLevel.findOne({ _id: nextLevel.prerequisite }).populate('mineId');

                // Check if the prerequisite is already purchased
                const prerequisitePurchase = await UserMine.findOne({
                    userId,
                    levelId: prerequisiteLevel._id
                });

                // If prerequisite is purchased, set status to active
                if (!prerequisitePurchase) {
                    status = 'inactive';
                }
            }

            if (nextLevel && nextLevel.limitTime) {
                const lastUserMine = await UserMine.findOne({userId, mineId: nextLevel.mineId}).sort({completedAt: -1});
                const lastPurchaseTime = lastUserMine ? new Date(lastUserMine.completedAt) : null; // Ensure lastPurchaseTime is a Date object

                if (lastPurchaseTime) {
                    const limitTimeMs = nextLevel.limitTime * 60 * 1000; // Convert minutes to milliseconds
                    const expirationTime = new Date(lastPurchaseTime.getTime() + limitTimeMs);
                    const currentTime = new Date();
                    if (currentTime < expirationTime) {
                        const timeRemainingMs = expirationTime - currentTime;
                        const timeRemainingSeconds = Math.floor(timeRemainingMs / 1000); // Convert to seconds
                        time = timeRemainingSeconds; // Set time remaining in seconds
                        status = 'inactive';
                    }
                }
            }

            // Set the nextLevel details
            nextLevel = {
                ...nextLevel.toObject(),
                prerequisite: nextLevel.prerequisite
                    ? {
                        level: prerequisiteLevel.level || null,
                        profit: prerequisiteLevel.profit || null,
                        price: prerequisiteLevel.price || null,
                        mineName: prerequisiteLevel.mineId.title || null // Get the mine name from the populated mineId
                    }
                    : null
            };
        } else {
            nextLevel = {
                _id: null,
                level: 'max',
                profit: 0,
                price: 0,
                prerequisite: []
            };
            status = 'inactive'; // All levels purchased, so status is active
        }

        res.json({
            message: `Successfully purchased level ${level} of mine`,
            coins: user.coins,
            profits: user.profits,
            status: status,
            time: time,
            nextLevel
        });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



module.exports = {getMines, getUserMineLevel, purchase};
