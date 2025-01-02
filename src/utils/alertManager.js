const fs = require('fs');
const path = require('path');
const { fetchCoinPrice } = require('./coinData');
const fixedTickers = require('./fixedTickers'); // Import the fixed tickers mapping

const ALERTS_FILE = path.join(__dirname, '../data/alerts.json');

// Utility function to load alerts from JSON file
const loadAlerts = () => {
    try {
        const data = fs.readFileSync(ALERTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('No alerts file found, creating a new one.');
            return []; // Return an empty array if file doesn't exist
        }
        console.error('Error loading alerts:', error);
        throw error;
    }
};

// Utility function to save alerts to JSON file
const saveAlerts = (alerts) => {
    try {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving alerts:', error);
        throw error;
    }
};

// Check alerts and remove triggered ones
const checkAlerts = async (bot) => {
    const alerts = loadAlerts();
    const remainingAlerts = [];

    for (const alert of alerts) {
        let { chatId, coin, condition, price } = alert;

        // Resolve the coin using fixedTickers mapping
        const resolvedCoin = fixedTickers[coin.toLowerCase()] || coin;

        try {
            const currentPrice = await fetchCoinPrice(resolvedCoin);

            if (
                (condition === 'above' && currentPrice > price) ||
                (condition === 'below' && currentPrice < price)
            ) {
                // Notify user about the triggered alert
                await bot.sendMessage(
                    chatId,
                    `🚨 Alert triggered: ${resolvedCoin.toUpperCase()} is now ${condition} ${price}. Current price: $${currentPrice.toFixed(2)}`
                );
                console.info(`Alert triggered for ${resolvedCoin}: ${condition} ${price}`);
            } else {
                // Keep alert if not triggered
                remainingAlerts.push(alert);
            }
        } catch (error) {
            console.error(`Error checking alert for ${resolvedCoin}:`, error);
            // Keep the alert in case of errors
            remainingAlerts.push(alert);
        }
    }

    // Save the remaining alerts back to the JSON file
    saveAlerts(remainingAlerts);
};

// Add a new alert
const addAlert = (alert) => {
    const alerts = loadAlerts();

    // Check for duplicate alerts (same chatId, coin, condition, and price)
    const isDuplicate = alerts.some(
        (existingAlert) =>
            existingAlert.chatId === alert.chatId &&
            existingAlert.coin === alert.coin &&
            existingAlert.condition === alert.condition &&
            existingAlert.price === alert.price
    );

    if (isDuplicate) {
        console.warn('Duplicate alert detected, not adding.');
        return false; // Return false to indicate duplicate alert
    }

    alerts.push(alert);
    saveAlerts(alerts);
    console.info(`Alert added: ${JSON.stringify(alert)}`);
    return true; // Return true to indicate success
};

// Remove all alerts for a specific chatId
const removeAlertsByChatId = (chatId) => {
    const alerts = loadAlerts();
    const updatedAlerts = alerts.filter((alert) => alert.chatId !== chatId);
    saveAlerts(updatedAlerts);
    console.info(`Removed all alerts for chat ID: ${chatId}`);
};

module.exports = {
    loadAlerts,
    saveAlerts,
    checkAlerts,
    addAlert,
    removeAlertsByChatId,
};
