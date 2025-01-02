// src/commands/sentiment.js
const axios = require('axios');
const logger = require('../utils/logger'); // Ensure you have a logger utility

module.exports = {
    name: 'sentiment',
    description: 'Displays the current sentiment in the cryptocurrency market.',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // API endpoint for Crypto Fear and Greed Index
        const apiUrl = 'https://api.alternative.me/fng/';

        try {
            // Fetch sentiment data
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.data || data.data.length === 0) {
                await bot.sendMessage(chatId, "Sorry, I couldn't fetch the sentiment data right now. Please try again later.");
                logger.warn('No sentiment data found in API response.');
                return;
            }

            // Parse the sentiment data
            const sentiment = data.data[0];
            const indexValue = sentiment.value || 'N/A';
            const indexText = sentiment.value_classification || 'N/A';
            const lastUpdated = sentiment.timestamp ? new Date(sentiment.timestamp * 1000).toLocaleString() : 'N/A';

            // Create a response message
            const sentimentMessage = `
📊 *Crypto Market Sentiment* 📊

- *Current Index:* ${indexValue} (${indexText})
- *Last Updated:* ${lastUpdated}

The Fear and Greed Index is a popular indicator for measuring the market sentiment. 
"Extreme Fear" can be a sign of oversold conditions, while "Extreme Greed" might indicate overbought conditions.
            `;

            await bot.sendMessage(chatId, sentimentMessage, { parse_mode: 'Markdown' });
            logger.info(`/sentiment command executed successfully.`);

        } catch (error) {
            logger.error('Error fetching sentiment data:', error);
            await bot.sendMessage(chatId, "Oops! Something went wrong while fetching the sentiment data. Please try again later.");
        }
    }
};
