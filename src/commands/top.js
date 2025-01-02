// src/commands/top.js
const coinGeckoService = require('../services/coinGeckoService');

module.exports = {
    name: 'top',
    description: 'Shows the top 10 cryptocurrencies by market capitalization.',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        try {
            const topCoins = await coinGeckoService.getTopCoins();
            let message = "📈 *Top 10 Cryptocurrencies by Market Capitalization* 📈\n\n";
            topCoins.forEach(coin => {
                message += `**${coin.market_cap_rank}. ${coin.name} (${coin.symbol.toUpperCase()})**\n`;
                message += `Price: $${coin.current_price}\n`;
                message += `Market Cap: $${coin.market_cap}\n\n`;
            });
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            await bot.sendMessage(chatId, "Sorry, there was a problem retrieving the data.");
        }
    }
};
