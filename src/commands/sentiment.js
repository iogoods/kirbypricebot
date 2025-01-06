const axios = require('axios');
const logger = require('../utils/logger');
const { integrateAdvertisement } = require('../utils/advertisement'); // Werbung einfügen

module.exports = {
    name: 'sentiment',
    description: 'Displays the current sentiment in the cryptocurrency market.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // API endpoint for Crypto Fear and Greed Index
        const apiUrl = 'https://api.alternative.me/fng/';

        try {
            // Fetch sentiment data
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.data || data.data.length === 0) {
                const errorMessage = "Sorry, I couldn't fetch the sentiment data right now. Please try again later.";
                const responseMessage = integrateAdvertisement(errorMessage); // Werbung einfügen
                await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
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
📊 <b>Crypto Market Sentiment</b> 📊

<b>Current Index:</b> ${indexValue} (${indexText})
<b>Last Updated:</b> ${lastUpdated}

The Fear and Greed Index is a popular indicator for measuring the market sentiment. 
"Extreme Fear" can be a sign of oversold conditions, while "Extreme Greed" might indicate overbought conditions.
            `;

            // Add advertisement to the sentiment message
            const responseMessage = integrateAdvertisement(sentimentMessage); // Werbung einfügen
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
            logger.info(`/sentiment command executed successfully.`);

        } catch (error) {
            logger.error('Error fetching sentiment data:', error);
            const errorMessage = "Oops! Something went wrong while fetching the sentiment data. Please try again later.";
            const responseMessage = integrateAdvertisement(errorMessage); // Werbung einfügen
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};
