const axios = require('axios');

module.exports = {
    name: 'rates',
    async execute(bot, msg) {
        const chatId = msg.chat.id;

        try {
            const alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;
            const economicIndicators = [
                'REAL_GDP',        // Real GDP
                'UNEMPLOYMENT',    // Unemployment Rate
                'CPI',             // Consumer Price Index
                'INFLATION',       // Inflation Rate
                'RETAIL_SALES',    // Retail Sales
                'INDUSTRIAL_PRODUCTION', // Industrial Production
            ];

            let responseMessage = '📊 *Economic Indicators*\n\n';

            for (const indicator of economicIndicators) {
                const url = `https://www.alphavantage.co/query`;
                const params = {
                    function: indicator,
                    apikey: alphaVantageApiKey,
                };

                const response = await axios.get(url, { params });
                const data = response.data;

                if (data && data.data && data.data.length > 0) {
                    const latestEntry = data.data[0];
                    responseMessage += `*${indicator.replace(/_/g, ' ')}*\n`;
                    responseMessage += `Date: ${latestEntry.date}\n`;
                    responseMessage += `Value: ${latestEntry.value}\n\n`;
                } else {
                    responseMessage += `*${indicator.replace(/_/g, ' ')}*: No data available.\n\n`;
                }
            }

            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error fetching economic indicators:', error);
            await bot.sendMessage(chatId, 'Sorry, an error occurred while fetching the economic indicators.');
        }
    },
};
