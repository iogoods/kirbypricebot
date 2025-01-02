// src/services/alertService.js
const Alert = require('../models/Alert');
const coinGeckoService = require('./coinGeckoService');
const logger = require('../utils/logger');

const checkAlerts = async (bot) => {
    try {
        const alerts = await Alert.findAll();
        for (const alert of alerts) {
            const coin = await coinGeckoService.getCoinPrice(alert.crypto);
            if (!coin) continue;

            const currentPrice = coin.current_price;
            let conditionMet = false;

            if (alert.condition === 'above' && currentPrice > alert.price) {
                conditionMet = true;
            } else if (alert.condition === 'below' && currentPrice < alert.price) {
                conditionMet = true;
            }

            if (conditionMet) {
                const message = `📢 *Alert* 📢\n${coin.name} has reached your condition: ${alert.condition} $${alert.price}\nCurrent Price: $${currentPrice}`;
                await bot.sendMessage(alert.userId, message, { parse_mode: 'Markdown' });
                await alert.destroy(); // Remove the alert after it's triggered
            }
        }
    } catch (error) {
        logger.error('Error checking alerts:', error);
    }
};

module.exports = {
    checkAlerts,
};
