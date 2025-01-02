// src/commands/stock.js
const axios = require('axios');
const logger = require('../utils/logger');

module.exports = {
    name: 'stock',
    description: 'Fetches the current price of a stock.',
    usage: '/stock [symbol]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Check if the user provided a stock symbol
        if (args.length === 0) {
            await bot.sendMessage(chatId, "Please provide a stock symbol.\nExample: /stock AAPL");
            return;
        }

        const stockSymbol = args[0].toUpperCase();
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY; // Store your API key in .env
        const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;

        try {
            // Fetch stock data from Alpha Vantage
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data["Global Quote"]) {
                await bot.sendMessage(chatId, `No data found for stock symbol "${stockSymbol}". Please check the symbol.`);
                logger.warn(`No data found for stock symbol "${stockSymbol}".`);
                return;
            }

            // Extract the required data
            const stockData = response.data["Global Quote"];
            const symbol = stockData["01. symbol"];
            const price = stockData["05. price"];
            const changePercent = stockData["10. change percent"];
            const high = stockData["03. high"];
            const low = stockData["04. low"];
            const volume = stockData["06. volume"];

            // Format the message
            const message = `
📈 *${symbol}* Stock Price Update 📈

💰 *Price:* $${parseFloat(price).toFixed(2)}
📊 *Change (%):* ${changePercent}
⬆️ *High:* $${parseFloat(high).toFixed(2)}
⬇️ *Low:* $${parseFloat(low).toFixed(2)}
🔄 *Volume:* $${volume}

Stay updated with the stock market! 🚀
            `;

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            logger.error(`Error fetching stock data for "${stockSymbol}":`, error);
            await bot.sendMessage(chatId, "There was a problem fetching the stock data. Please try again later.");
        }
    }
};
