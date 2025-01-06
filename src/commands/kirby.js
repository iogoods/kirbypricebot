const axios = require('axios');

module.exports = {
    name: 'kirby',
    description: 'Fetches and displays the current price of Kirby.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const priceApiUrl = 'https://api.kas.fyi/token/krc20/marketData?tickers=KIRBY';

        try {
            // Fetch Kirby price data using the provided API endpoint
            const response = await axios.get(priceApiUrl, {
                headers: { 'accept': 'application/json' }
            });

            const priceData = response.data;

            // Ensure the response contains the expected data
            if (!priceData || !priceData.results || priceData.results.length === 0) {
                await bot.sendMessage(chatId, "Sorry, I couldn't retrieve the Kirby data.");
                return;
            }

            // Parse the price data for Kirby
            const kirbyData = priceData.results[0];
            const priceUsd = kirbyData.price?.usd?.toFixed(8) || 'N/A';

            // Format Market Cap and 24h Volume
            const marketCapValue = kirbyData.marketCap?.usd || 0;
            const marketCapUsd = marketCapValue
                ? `$${(marketCapValue / 1e3).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '.')}`
                : 'N/A';

            const volume24hValue = kirbyData.volume24h?.usd || 0;
            const volume24hUsd = volume24hValue
                ? `$${(volume24hValue / 1e3).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '.')}`
                : 'N/A';

            const rank = kirbyData.rank || 'N/A';

            // Send the Kirby price details as a message
            const message = `
🪙 *KIRBY* Price 🪙

💵 *Current Price:* $${priceUsd}
💰 *Market Cap:* ${marketCapUsd}K
📊 *24h Volume:* ${volume24hUsd}K
🏅 *Rank:* ${rank}
            `;

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error fetching Kirby data:', error);
            await bot.sendMessage(chatId, "Oops! Something went wrong while fetching the Kirby data. Please try again later.");
        }
    }
};
