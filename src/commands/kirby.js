const axios = require('axios');
const { integrateAdvertisement } = require('../utils/advertisement'); // Werbung einfügen

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

            // Format the Kirby price details message
            const kirbyMessage = `
<b>🪙 KIRBY Price 🪙</b>

💵 <b>Current Price:</b> $${priceUsd}
💰 <b>Market Cap:</b> ${marketCapUsd}K
📊 <b>24h Volume:</b> ${volume24hUsd}K
🏅 <b>Rank:</b> ${rank}
            `;

            // Add advertisement to the message
            const finalMessage = integrateAdvertisement(kirbyMessage);
            await bot.sendMessage(chatId, finalMessage, { parse_mode: 'HTML', disable_web_page_preview: true });

        } catch (error) {
            console.error('Error fetching Kirby data:', error);
            const errorMessage = "Oops! Something went wrong while fetching the Kirby data. Please try again later.";
            const finalErrorMessage = integrateAdvertisement(errorMessage);
            await bot.sendMessage(chatId, finalErrorMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};
