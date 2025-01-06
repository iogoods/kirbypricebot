// Load Environment Variables
require('dotenv').config();

// Import Dependencies
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const logger = require('./utils/logger');
const sequelize = require('./config/database'); // Sequelize instance (if using a database)
const { sendAdvertisement, getRandomAdvertisement } = require('./utils/advertisement');
const { checkAlerts } = require('./utils/alertManager');
const { fetchAndCacheCoinData } = require('./utils/coinData');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Connect and sync database
sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
        return sequelize.sync(); // Sync models
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

// Load Commands
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach((file) => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        if (command.name && command.execute) {
            commands.set(`/${command.name.toLowerCase()}`, command);
            logger.info(`Command loaded: /${command.name}`);
        } else {
            logger.warn(`Command file "${file}" is not properly configured.`);
        }
    }
});

// Attach commands to the bot
bot.commands = commands;

// Message Handler
bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!text.startsWith('/')) {
        return;
    }

    const [commandName, ...args] = text.split(/\s+/);

    if (commands.has(commandName.toLowerCase())) {
        const command = commands.get(commandName.toLowerCase());
        try {
            bot.currentCommand = commandName.toLowerCase();
            await command.execute(bot, msg, args);

            // Werbung nur senden, wenn sie nicht bereits integriert wurde
            if (!command.skipGlobalAd) {
                await sendAdvertisement(bot, chatId);
            }
        } catch (error) {
            logger.error(`Error executing command ${commandName}:`, error);
            await bot.sendMessage(chatId, "Sorry, an error occurred while executing the command.");
        }
    } else {
        await bot.sendMessage(chatId, "Unknown command. Use /help to see the list of available commands.");
    }
});


// Unified Callback Query Handler
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = msg.chat.id;

    if (data.startsWith('price_')) {
        const coinId = data.split('price_')[1];
        const priceCommand = commands.get('/price');

        if (priceCommand) {
            try {
                await priceCommand.execute(bot, msg, [coinId]);
            } catch (error) {
                logger.error(`Error executing price command for coin ID "${coinId}":`, error);
                await bot.sendMessage(chatId, "Sorry, an error occurred while fetching the price data.");
            }
        }
    } else {
        await bot.answerCallbackQuery(callbackQuery.id);
        await bot.sendMessage(chatId, "Sorry, I couldn't understand your selection.");
    }
});

// Polling Error Handler
bot.on('polling_error', (error) => {
    logger.error('Polling error:', error);
});

// Schedule the checkAlerts task
cron.schedule('*/5 * * * *', () => {
    logger.info('Running scheduled task: checkAlerts');
    checkAlerts(bot);
});

// Pre-fetch coin data
if (fetchAndCacheCoinData) {
    fetchAndCacheCoinData()
        .then(() => {
            logger.info('Coin data fetched and cached successfully.');
        })
        .catch((error) => {
            logger.error('Failed to fetch and cache coin data:', error);
        });
};

// Export bot for external use if needed
module.exports = bot;
