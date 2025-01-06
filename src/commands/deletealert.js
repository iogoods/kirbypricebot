const Alert = require('../models/Alert');

module.exports = {
    name: 'deletealert',
    description: 'Delete an active alert by its ID.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length !== 1) {
            return bot.sendMessage(chatId, 'Usage: /deletealert {alert_id}');
        }

        const alertId = parseInt(args[0]);

        try {
            const alert = await Alert.findByPk(alertId);

            if (!alert) {
                return bot.sendMessage(chatId, `No alert found with ID: ${alertId}`);
            }

            await alert.destroy();
            bot.sendMessage(chatId, `Alert ID ${alertId} has been deleted.`);
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, 'Failed to delete the alert. Please try again.');
        }
    },
};
