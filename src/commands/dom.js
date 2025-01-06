const axios = require('axios');
const logger = require('../utils/logger');
const { integrateAdvertisement } = require('../utils/advertisement');
const cache = require('../utils/priceCache');

module.exports = {
    name: 'dom',
    description: 'Displays the current Bitcoin Dominance and total cryptocurrency market cap.',
    usage: '/dom',
    skipGlobalAd: true, // Werbung bereits integriert
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        try {
            // Check cached data
            const cachedData = cache.get('bitcoin_dominance');
            if (cachedData) {
                logger.info('Serving cached Bitcoin Dominance data.');
                const response = integrateAdvertisement(formatDominanceMessage(cachedData));
                await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
                return;
            }

            // Fetch data from CoinGecko
            const apiUrl = 'https://api.coingecko.com/api/v3/global';
            logger.info(`Fetching Bitcoin Dominance data from: ${apiUrl}`);
            const response = await axios.get(apiUrl);
            const data = response.data.data;

            // Parse data
            const btcDominance = data.market_cap_percentage.btc;
            const totalMarketCapUSD = data.total_market_cap.usd;
            const updatedAt = new Date().toLocaleString(); // Use current time

            const dominanceData = { btcDominance, totalMarketCapUSD, updatedAt };
            cache.set('bitcoin_dominance', dominanceData, 300); // Cache for 5 minutes
            logger.info('Cached Bitcoin Dominance data.');

            // Format and send message
            const message = integrateAdvertisement(formatDominanceMessage(dominanceData));
            await bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        } catch (error) {
            logger.error(`Error fetching Bitcoin Dominance data: ${error.message}`);
            const errorMessage = integrateAdvertisement("<b>An error occurred while fetching the Bitcoin Dominance data. Please try again later.</b>");
            await bot.sendMessage(chatId, errorMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};

// Helper function to format the dominance message
const formatDominanceMessage = (data) => {
    const { btcDominance, totalMarketCapUSD, updatedAt } = data;
    return `
<b>🌐 Bitcoin Dominance Overview</b>
💰 <b>BTC Dominance:</b> ${btcDominance.toFixed(2)}%
📈 <b>Total Market Cap:</b> ${formatLargeNumber(totalMarketCapUSD)}
🕒 <b>Last Updated:</b> ${updatedAt}
    `.trim();
};

// Helper function to format large numbers compactly
const formatLargeNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`; // Trillions
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`; // Billions
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`; // Millions
    return `$${num.toLocaleString()}`; // Default with commas
};
