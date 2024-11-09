const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

require('dotenv').config();
process.env.TZ = "America/Montreal"

const User = require('./models/User'); // Adjust the path to your User model if needed
const { createUser } = require('./controllers/userController');

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Import routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');
const referralRoutes = require('./routes/referralRoutes');
const mineRoutes = require('./routes/mineRoutes');
const settingRoutes = require('./routes/settingRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/mines', mineRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/quiz', quizRoutes);

// Function to generate referral code
function generateReferralCode() {
    // Generate a simple referral code (for example, a random string of 8 characters)
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

const downloadImage = async (url, filePath) => {
    const response = await axios({
        url,
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
                resolve(true);
            }
        });
    });
};

// Telegram bot setup
// Bot start handler
bot.start(async (ctx) => {
    const userId = ctx.message.from.id;  // Use userId instead of chatId
    const { first_name, last_name, username } = ctx.message.from;
    const refCode = ctx.message.text.split(' ')[1];
    let avatar = null;

    try {
        let user = await User.findOne({ userId });
        // Check if the user already exists
        if (!user) {
            const userProfilePhotos = await bot.telegram.getUserProfilePhotos(userId);
            if (userProfilePhotos.total_count > 0) {
                const fileId = userProfilePhotos.photos[0][0].file_id;
                const file = await bot.telegram.getFile(fileId);
                const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

                const downloadsDir = path.resolve(__dirname, 'avatars');
                if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir);
                }
                const filePath = path.resolve(downloadsDir, `${username}-${userId}.jpg`);
                try {
                    await downloadImage(url, filePath);
                    // Save the file path to MongoDB
                    avatar = filePath;
                } catch (error) {
                    console.error('Error downloading the image:', error);
                }
            }

            // Create a new user using the createUser function
            const req = { body: { userId, chatId: ctx.message.chat.id, first_name, last_name, username, avatar, referredBy: refCode || null } };
            const res = {
                status: (code) => ({
                    json: (data) => {
                        if (code === 201) {
                            user = data;
                        } else {
                            throw new Error(data.message);
                        }
                    }
                })
            };
            await createUser(req, res);
            // Create a new user
        }

        // Send welcome message with buttons
        await ctx.replyWithPhoto(
            { url: 'https://ballcoin.app/cover.jpg' },
            {
                caption: `Hi, ${username != null ? username : first_name}. Welcome to Free Ball Coin.\nThere is a story of a person named Ebi who lost his brother in a football game and you are supposed to help him find his brother on a trip.\n.`,
                ...Markup.inlineKeyboard([
                    [{ text: '👋 Play Now', web_app: { url: `${process.env.APP_URL}` } }],
                    [Markup.button.url('💪💋 Join Our Community!', 'https://t.me/freeballcoin')]
                ])
            }
        );
    } catch (error) {
        console.log('Error creating user:', error);
        ctx.reply('An error occurred while starting the game. Please try again.');
    }
});

// Help command
bot.action('HELP', (ctx) => {
    ctx.reply('Here is how the game works:...');
});

bot.launch();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
