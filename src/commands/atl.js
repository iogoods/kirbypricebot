const axios = require('axios');
const fixedTickers = require('../utils/fixedTickers'); // Import your fixed tickers mapping
const { integrateAdvertisement } = require('../utils/advertisement'); // Werbung integrieren

module.exports = {
    name: 'atl', // Command name
    skipGlobalAd: true, // Verhindert globale Werbung
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            const errorMessage = 'Please provide a cryptocurrency name or symbol. Example: /atl bitcoin or /atl btc';
            const response = integrateAdvertisement(errorMessage);
            return bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
        }

        let query = args.join(' ').toLowerCase();

        // Check if the query is in fixed tickers and get the correct CoinGecko ID
        query = fixedTickers[query] || query;

        try {
            // Fetch data from CoinGecko
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${query}`);
            const data = response.data;

            const atlPrice = data.market_data.atl.usd;
            const atlDate = new Date(data.market_data.atl_date.usd).toLocaleDateString();
            const currentPrice = data.market_data.current_price.usd;
            const percentageFromAtl = ((currentPrice / atlPrice - 1) * 100).toFixed(2);

            const message = `
<b>${data.name} - $${data.symbol.toUpperCase()}</b>
Date of ATL: ${atlDate}
Current Price: $${currentPrice.toLocaleString()}
ATL Price: $${atlPrice.toLocaleString()}
% from ATL: ${percentageFromAtl}%
            `;

            const responseMessage = integrateAdvertisement(message);
            bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML', disable_web_page_preview: true });
        } catch (error) {
            console.error('Error fetching ATL data:', error);
            const errorMessage = 'Could not fetch ATL data. Please ensure the cryptocurrency name or symbol is correct.';
            const response = integrateAdvertisement(errorMessage);
            bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    },
};
