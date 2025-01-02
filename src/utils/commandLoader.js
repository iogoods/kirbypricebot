// src/utils/commandLoader.js

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

module.exports = (bot) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    fs.readdirSync(commandsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const command = require(path.join(commandsPath, file));
            // Register command for with and without arguments
            bot.onText(new RegExp(`^/${command.name} (.+)`), (msg, match) => {
                const args = match[1].split(' ');
                command.execute(bot, msg, args);
            });

            bot.onText(new RegExp(`^/${command.name}$`), (msg, match) => {
                const args = [];
                command.execute(bot, msg, args);
            });

            logger.info(`Loaded command: /${command.name}`);
        }
    });
};
