const axios = require('axios');
const logger = require('../utils/logger');
const { integrateAdvertisement } = require('../utils/advertisement');

module.exports = {
    name: 'stock',
    aliases: ['s'], // Alias für /s

    description: 'Fetches the current price of a stock.',
    usage: '/stock [symbol or full name]',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Check if the user provided a stock symbol or name
        if (args.length === 0) {
            const errorMessage = "Please provide a stock symbol or company name.\nExample: /stock AAPL or /stock Apple";
            const responseMessage = integrateAdvertisement(errorMessage); // Werbung einfügen
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
            return;
        }

        const input = args.join(' ');
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY; // Store your API key in .env
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(input)}&apikey=${apiKey}`;

        try {
            // Step 1: Search for the stock symbol if a name is provided
            const searchResponse = await axios.get(searchUrl);

            if (!searchResponse.data || !searchResponse.data.bestMatches || searchResponse.data.bestMatches.length === 0) {
                const notFoundMessage = `No stock found matching "${input}". Please check the name or symbol.`;
                const responseMessage = integrateAdvertisement(notFoundMessage); // Werbung einfügen
                await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
                logger.warn(`No stock matches found for input "${input}".`);
                return;
            }

            const bestMatch = searchResponse.data.bestMatches[0]; // Take the first match
            const stockSymbol = bestMatch["1. symbol"];
            const stockName = bestMatch["2. name"];

            // Step 2: Fetch stock data using the symbol
            const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
            const quoteResponse = await axios.get(quoteUrl);

            if (!quoteResponse.data || !quoteResponse.data["Global Quote"]) {
                const noDataMessage = `No data found for stock symbol "${stockSymbol}". Please try again later.`;
                const responseMessage = integrateAdvertisement(noDataMessage); // Werbung einfügen
                await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
                logger.warn(`No data found for stock symbol "${stockSymbol}".`);
                return;
            }

            // Extract the required data
            const stockData = quoteResponse.data["Global Quote"];
            const symbol = stockData["01. symbol"];
            const price = stockData["05. price"];
            const changePercent = stockData["10. change percent"];
            const high = stockData["03. high"];
            const low = stockData["04. low"];
            const volume = stockData["06. volume"];

            // Format the message
            const stockMessage = `
📈 <b>${stockName} (${symbol})</b> Stock Price Update 📈

💰 <b>Price:</b> $${parseFloat(price).toFixed(2)}
📊 <b>Change (%):</b> ${changePercent}
⬆️ <b>High:</b> $${parseFloat(high).toFixed(2)}
⬇️ <b>Low:</b> $${parseFloat(low).toFixed(2)}
🔄 <b>Volume:</b> $${Number(volume).toLocaleString()}

            `;

            const responseMessage = integrateAdvertisement(stockMessage); // Werbung einfügen
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });

        } catch (error) {
            logger.error(`Error fetching stock data for "${input}":`, error);
            const errorMessage = "There was a problem fetching the stock data. Please try again later.";
            const responseMessage = integrateAdvertisement(errorMessage); // Werbung einfügen
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};
