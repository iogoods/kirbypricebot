const axios = require('axios');
const logger = require('../utils/logger');
const { getCoinByFixedTicker } = require('../utils/coinData');
const { integrateAdvertisement } = require('../utils/advertisement');

module.exports = {
    name: 'price',
    description: 'Displays the current price of a cryptocurrency.',
    usage: '/price [cryptocurrency]',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            const errorMessage = "Please specify the name or ticker symbol of the cryptocurrency.\nExample: /price bitcoin or /price kirby";
            const response = integrateAdvertisement(errorMessage); // Werbung integrieren
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
            return;
        }

        const input = args[0].toLowerCase();
        logger.info(`Received /price command with input: "${input}" from chat ID: ${chatId}`);

        const fixedCoin = getCoinByFixedTicker(input);
        const coinId = fixedCoin?.id || input; 

        const coingeckoApiUrl = `${process.env.COINGECKO_API_URL}/coins/markets`;
        const kasApiUrl = `https://api.kas.fyi/token/krc20/marketData?tickers=${input.toUpperCase()}`;

        try {
            const coingeckoResponse = await fetchFromCoinGecko(coingeckoApiUrl, coinId);
            if (coingeckoResponse) {
                const response = integrateAdvertisement(coingeckoResponse);
                await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
                return;
            }

            await delay(1000);

            const kasResponse = await fetchFromKasFyi(kasApiUrl);
            if (kasResponse) {
                const response = integrateAdvertisement(kasResponse);
                await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
                return;
            }

            const notFoundMessage = `No data found for "${input}". Please try using the full name of the cryptocurrency.\nExample: /price bitcoin instead of /price btc.`;
            const response = integrateAdvertisement(notFoundMessage);
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
        } catch (error) {
            logger.error('Error fetching price data:', error);
            const errorMessage = "Oops! An error occurred while fetching the price data. Please try again later.";
            const response = integrateAdvertisement(errorMessage);
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};

// Fetch from CoinGecko
const fetchFromCoinGecko = async (apiUrl, coinId) => {
    try {
        const params = {
            vs_currency: 'usd',
            ids: coinId,
            order: 'market_cap_desc',
            per_page: 1,
            page: 1,
            sparkline: false,
            price_change_percentage: '1h,24h,7d,30d'
        };

        const response = await axios.get(apiUrl, { params });
        if (!response.data || response.data.length === 0) return null;

        const data = response.data[0];

        return `
💰 *${data.name}* - $${data.symbol.toUpperCase()}
💵 Price: $${data.current_price?.toFixed(2) || 'N/A'}
⚖ H/L: $${data.high_24h?.toFixed(2) || 'N/A'} | $${data.low_24h?.toFixed(2) || 'N/A'}
🌕 1h: ${data.price_change_percentage_1h_in_currency?.toFixed(2) || 'N/A'}%
🌕 24h: ${data.price_change_percentage_24h_in_currency?.toFixed(2) || 'N/A'}%
🌕 7d: ${data.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A'}%
☠️ 30d: ${data.price_change_percentage_30d_in_currency?.toFixed(2) || 'N/A'}%
🏆 ATH: $${data.ath?.toFixed(2) || 'N/A'} (${data.ath_change_percentage?.toFixed(2) || 'N/A'}%)
📊 24h Vol: $${(data.total_volume / 1e3)?.toFixed(2) || 'N/A'}K
💎 MCap: $${(data.market_cap / 1e6)?.toFixed(2) || 'N/A'}M
        `;
    } catch (error) {
        logger.warn('CoinGecko API error:', error.message);
        return null;
    }
};

// Fetch from Kas.fyi
const fetchFromKasFyi = async (apiUrl) => {
    try {
        const response = await axios.get(apiUrl, { headers: { accept: 'application/json' } });
        const data = response.data;

        if (!data || !data.results || data.results.length === 0) return null;

        const coinData = data.results[0];
        const name = coinData.name || coinData.ticker || "Unknown";
        const priceUsd = coinData.price?.usd?.toFixed(8) || 'N/A';

        // Scale and format Market Cap
        const marketCapValue = coinData.marketCap?.usd || 0;
        const marketCapUsd = marketCapValue
            ? `$${(marketCapValue / 1e3).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '.')}` // Convert to thousands
            : 'N/A';

        // Scale and format 24h Volume
        const volume24hValue = coinData.volume24h?.usd || 0;
        const volume24hUsd = volume24hValue
            ? `$${(volume24hValue / 1e3).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, '.')}` // Convert to thousands
            : 'N/A';

        const rank = coinData.rank || 'N/A';

        return `
🪙 *${name}* Price (via kas.fyi) 🪙

💵 *Price:* $${priceUsd}
💰 *Market Cap:* ${marketCapUsd}K
📊 *24h Volume:* ${volume24hUsd}K
🏅 *Rank:* ${rank}
        `;
    } catch (error) {
        logger.warn('kas.fyi API error:', error.message);
        return null;
    }
};


// Utility to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
