const { loadAlerts } = require('../utils/alertManager');

module.exports = {
    name: 'myalerts',
    description: 'View your current alerts.',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        try {
            const alerts = loadAlerts().filter((alert) => alert.chatId === chatId);

            if (alerts.length === 0) {
                await bot.sendMessage(chatId, 'You have no active alerts.');
                return;
            }

            let message = '📋 Your alerts:\n';
            alerts.forEach((alert, index) => {
                message += `${index + 1}. ${alert.coin} ${alert.condition} ${alert.price}\n`;
            });

            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error fetching user alerts:', error);
            await bot.sendMessage(chatId, '❌ Failed to fetch alerts. Please try again.');
        }
    },
};
