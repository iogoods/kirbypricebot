const coinGeckoService = require('../services/coinGeckoService');
const { integrateAdvertisement } = require('../utils/advertisement'); // Werbung integrieren

module.exports = {
    name: 'top',
    description: 'Shows the top 10 cryptocurrencies by market capitalization.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        try {
            const topCoins = await coinGeckoService.getTopCoins();
            let message = `<b>📈 Top 10 Cryptocurrencies by Market Capitalization 📈</b>\n\n`;
            topCoins.forEach(coin => {
                message += `<b>${coin.market_cap_rank}. ${coin.name} (${coin.symbol.toUpperCase()})</b>\n`;
                message += `Price: $${coin.current_price.toLocaleString()}\n`;
                message += `Market Cap: $${coin.market_cap.toLocaleString()}\n\n`;
            });

            // Integriere Werbung (HTML)
            const finalMessage = integrateAdvertisement(message);
            await bot.sendMessage(chatId, finalMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        } catch (error) {
            const errorMessage = "Sorry, there was a problem retrieving the data.";
            const finalErrorMessage = integrateAdvertisement(`<b>${errorMessage}</b>`); // Werbung hinzufügen
            await bot.sendMessage(chatId, finalErrorMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};
