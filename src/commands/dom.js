// src/commands/dom.js
const axios = require('axios');
const logger = require('../utils/logger');
const cache = require('../utils/priceCache'); // For caching

module.exports = {
    name: 'dom',
    description: 'Displays the current Bitcoin Dominance and total cryptocurrency market cap.',
    usage: '/dom',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        try {
            // Check if the data is cached
            const cachedData = cache.get('bitcoin_dominance');
            if (cachedData) {
                logger.info('Serving cached Bitcoin Dominance data.');
                await sendDominanceMessage(bot, chatId, cachedData);
                return;
            }

            // Fetch data from CoinGecko API
            const apiUrl = 'https://api.coingecko.com/api/v3/global';
            logger.info(`Fetching Bitcoin Dominance data from: ${apiUrl}`);

            const response = await axios.get(apiUrl);
            const data = response.data.data;

            // Extract required data
            const btcDominance = data.market_cap_percentage.btc;
            const totalMarketCapUSD = data.total_market_cap.usd;
            const updatedAt = new Date(data.updated_at * 1000).toLocaleString();

            const dominanceData = {
                btcDominance,
                totalMarketCapUSD,
                updatedAt
            };

            // Cache the data for 5 minutes (300 seconds)
            cache.set('bitcoin_dominance', dominanceData, 300);
            logger.info('Cached Bitcoin Dominance data.');

            // Send the message to the user
            await sendDominanceMessage(bot, chatId, dominanceData);

        } catch (error) {
            logger.error(`Error fetching Bitcoin Dominance data: ${error.message}`);
            await bot.sendMessage(chatId, "An error occurred while fetching the Bitcoin Dominance data. Please try again later.");
        }
    }
};

// Helper function to format and send the message
const sendDominanceMessage = async (bot, chatId, data) => {
    const { btcDominance, totalMarketCapUSD, updatedAt } = data;

    const message = `
*Bitcoin Dominance*
💰 *BTC Dominance:* ${btcDominance.toFixed(2)}%
📈 *Total Cryptocurrency Market Cap:* $${formatNumber(totalMarketCapUSD)}
🕒 *Last Updated:* ${updatedAt}
    `;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};

// Helper function to format large numbers with commas
const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};
