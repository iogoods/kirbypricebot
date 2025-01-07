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


// Index.js: Registrierung von Befehlen mit Aliases
commands.forEach(command => {
    bot.commands.set(`/${command.name}`, command);
    if (command.aliases) {
        command.aliases.forEach(alias => {
            bot.commands.set(`/${alias}`, command);
        });
    }
});


// Message Handler
bot.on('message', async (msg) => {
    if (!msg.text) return; // Nur Textnachrichten verarbeiten

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Nur Befehle verarbeiten
    if (!text.startsWith('/')) return;

    // Befehl und Argumente extrahieren
    const [commandNameRaw, ...args] = text.split(/\s+/);
    const [commandName] = commandNameRaw.split('@');

    const command = commands.get(commandName.toLowerCase());
    if (command) {
        try {
            await command.execute(bot, msg, args);
        } catch (error) {
            logger.error(`Error executing command ${commandName}:`, error);
            await bot.sendMessage(chatId, "Sorry, an error occurred while executing the command.");
        }
    } else {
        // Unbekannte Befehle ignorieren, ohne Fehlermeldung zu senden
        logger.warn(`Unknown command received: ${commandName}`);
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




bot.onText(/\/chart (\S+)\s+(\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const symbol = match[1];    // erstes Argument nach /chart
    const timeframe = match[2]; // zweites Argument nach /chart
    
    try {
      // Screenshot erstellen (als Buffer)
      const screenshotBuffer = await generateChartScreenshot(symbol, timeframe);
  
      // Screenshot über Telegram senden
      await bot.sendPhoto(chatId, screenshotBuffer, {
        caption: `Chart für ${symbol} (${timeframe})`
      });
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, `Fehler beim Erstellen des Charts für ${symbol} (${timeframe})`);
    }
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
