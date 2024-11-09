const User = require('../models/User');

const getStats = async (req, res) => {
    try {
        const totalTouches = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$coins" } } }
        ]);
        const totalPlayers = await User.countDocuments({});
        const dailyUsers = await User.countDocuments({
            updatedAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) }
        });
        const onlinePlayers = await User.countDocuments({
            lastTapUse: { $gte: new Date(new Date().setMinutes(new Date().getMinutes() - 5)) }
        });

        res.json({
            totalTouches: totalTouches[0]?.total || 0,
            totalPlayers,
            dailyUsers,
            onlinePlayers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { getStats };
