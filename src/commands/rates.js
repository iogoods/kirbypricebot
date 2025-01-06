const axios = require('axios');
const { integrateAdvertisement } = require('../utils/advertisement'); // Werbung integrieren

module.exports = {
    name: 'rates',
    skipGlobalAd: true, // Verhindert globale Werbung
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

            const finalMessage = integrateAdvertisement(responseMessage); // Werbung hinzufügen
            await bot.sendMessage(chatId, finalMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
        } catch (error) {
            console.error('Error fetching economic indicators:', error);
            const errorMessage = 'Sorry, an error occurred while fetching the economic indicators.';
            const finalErrorMessage = integrateAdvertisement(errorMessage); // Werbung hinzufügen
            await bot.sendMessage(chatId, finalErrorMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
        }
    },
};
