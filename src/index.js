// Load Environment Variables
require('dotenv').config();

// Import Dependencies
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const logger = require('./utils/logger');
const sequelize = require('./config/database'); // Sequelize instance (if using a database)
const { sendAdvertisement } = require('./utils/advertisement');
const Alert = require('./models/Alert');
const { atlCommand } = require('./commands/atl');
const { athCommand } = require('./commands/ath');
const { rates } = require('./commands/rates');


// Import Utilities
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

fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandsPath, file));
        commands.set(`/${command.name.toLowerCase()}`, command);
        logger.info(`Command loaded: /${command.name}`);
    }
});

// Attach commands to the bot for easy access in help.js (if needed)
bot.commands = commands;

// Message Handler
bot.on('message', async (msg) => {
    if (!msg.text) return; // Ignore non-text messages

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!text.startsWith('/')) {
        return; // Ignore messages that don't start with "/"
    }

    const [commandName, ...args] = text.split(/\s+/);

    if (commands.has(commandName.toLowerCase())) {
        const command = commands.get(commandName.toLowerCase());
        try {
            await command.execute(bot, msg, args);

            // Send advertisement with a delay after successful command execution
            await sendAdvertisement(bot, chatId);
        } catch (error) {
            logger.error(`Error executing command ${commandName}:`, error);
            await bot.sendMessage(chatId, "Sorry, an error occurred while executing the command.");
        }
    } else {
        // Handle unknown commands
        await bot.sendMessage(chatId, "Unknown command. Use /help to see the list of available commands.");
    }
});

// Unified Callback Query Handler (if using inline keyboards)
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data; // e.g., "price_bitcoin"
    const chatId = msg.chat.id;

    if (data.startsWith('price_')) {
        const coinId = data.split('price_')[1];

        // Acknowledge the callback to remove the loading state
        await bot.answerCallbackQuery(callbackQuery.id);

        // Fetch and send the price data using the /price command
        const priceCommand = commands.get('/price');
        if (priceCommand) {
            try {
                await priceCommand.execute(bot, msg, [coinId]);
            } catch (error) {
                logger.error(`Error executing price command for coin ID "${coinId}":`, error);
                await bot.sendMessage(chatId, "Sorry, an error occurred while fetching the price data.");
            }
        } else {
            logger.warn(`Price command not found when handling callback data: "${data}"`);
            await bot.sendMessage(chatId, "Sorry, the price command is not available.");
        }
    } else {
        // Handle other callback_data if necessary
        logger.warn(`Unhandled callback data: "${data}"`);
        await bot.sendMessage(chatId, "Sorry, I couldn't understand your selection.");
        await bot.answerCallbackQuery(callbackQuery.id);
    }
});

// Polling Error Handler
bot.on('polling_error', (error) => {
    logger.error('Polling error:', error);
});

bot.onText(/\/atl (.+)/, (msg, match) => {
    atlCommand(bot, msg, match);
});

bot.onText(/\/ath (.+)/, (msg, match) => {
    athCommand(bot, msg, match);
});

fs.readdirSync(commandsPath).forEach(file => {
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


// Schedule the checkAlerts task to run every minute
cron.schedule('*/5 * * * *', () => {
    logger.info('Running scheduled task: checkAlerts');
    checkAlerts(bot);
});

// Fetch and cache coin data before the bot starts handling commands (if applicable)
if (fetchAndCacheCoinData) {
    fetchAndCacheCoinData()
        .then(() => {
            logger.info('Coin data fetched and cached successfully.');
        })
        .catch(error => {
            logger.error('Failed to fetch and cache coin data:', error);
        });
}
