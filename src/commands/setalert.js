// src/commands/setalert.js
const { addAlert } = require('../utils/alertManager');

module.exports = {
    name: 'setalert',
    description: 'Set an alert for a cryptocurrency price.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length < 3) {
            await bot.sendMessage(chatId, 'Usage: /setalert <coin> <above|below> <price>');
            return;
        }

        const [coin, condition, price] = args;

        if (!['above', 'below'].includes(condition)) {
            await bot.sendMessage(chatId, 'Condition must be either "above" or "below".');
            return;
        }

        const alert = {
            chatId,
            coin,
            condition,
            price: parseFloat(price),
        };

        try {
            addAlert(alert);
            await bot.sendMessage(chatId, `✅ Alert set: ${coin} ${condition} ${price}`);
        } catch (error) {
            console.error('Error setting alert:', error);
            await bot.sendMessage(chatId, '❌ Failed to set alert. Please try again.');
        }
    },
};
