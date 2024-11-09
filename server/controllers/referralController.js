const User = require('../models/User');

const getReferredUsers = async (req, res) => {
    try {
        const referralCode = req.params.referralCode;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const referredUserCount = await User.countDocuments({ referredBy: referralCode });
        const referredUsers = await User.find({ referredBy: referralCode }, 'userId first_name last_name coins level')
            .skip(skip)
            .limit(limit);

        res.json({
            count: referredUserCount,
            users: referredUsers
        });
    } catch (error) {
        console.error('Error fetching referred users:', error);
        res.status(500).send('Server Error');
    }
};

module.exports = { getReferredUsers };
