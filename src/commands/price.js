const axios = require('axios');
const logger = require('../utils/logger');
const { getCoinByFixedTicker } = require('../utils/coinData');
const { integrateAdvertisement } = require('../utils/advertisement');

/**
 * /price [cryptocurrency]
 *  or /p [cryptocurrency]
 *  
 * Example usage:
 *   /price bitcoin
 *   /p kirby
 */
module.exports = {
    name: 'price',
    aliases: ['p'],
    description: 'Displays the current price of a cryptocurrency.',
    usage: '/price [cryptocurrency]',
    skipGlobalAd: true,
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            const errorMessage = `
Please specify the name or ticker symbol of the cryptocurrency.
Example: /price bitcoin or /price kirby
            `;
            const response = integrateAdvertisement(errorMessage);
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
            return;
        }

        const input = args[0].toLowerCase();
        logger.info(`Received /price command with input: "${input}" from chat ID: ${chatId}`);

        // Attempt to map known tickers; e.g. "btc" -> { id: 'bitcoin' }
        const fixedCoin = getCoinByFixedTicker(input);
        const coinId = fixedCoin?.id || input;

        // 1) CoinGecko URL
        const coingeckoApiUrl = `${process.env.COINGECKO_API_URL}/coins/markets`;

        // 2) kas.fyi URL
        const kasApiUrl = `https://api.kas.fyi/token/krc20/marketData?tickers=${input.toUpperCase()}`;

        try {
            // ----- 1) Check CoinGecko -----
            const coingeckoResponse = await fetchFromCoinGecko(coingeckoApiUrl, coinId);
            if (coingeckoResponse) {
                const response = integrateAdvertisement(coingeckoResponse);
                await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
                return;
            }

            // ----- 2) Check kas.fyi -----
            // Wait 1 second before hitting the second API
            await delay(1000);
            const kasResponse = await fetchFromKasFyi(kasApiUrl);
            if (kasResponse) {
                const response = integrateAdvertisement(kasResponse);
                await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
                return;
            }

            // ----- 3) If both are null -> No data found -----
            const notFoundMessage = `
No data found for "${input}".
Please try using the full name of the cryptocurrency.
Example: /price bitcoin instead of /price btc.
            `;
            const response = integrateAdvertisement(notFoundMessage);
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });

        } catch (error) {
            logger.error('Error fetching price data:', error);
            const errorMessage = `
Oops! An error occurred while fetching the price data. Please try again later.
            `;
            const response = integrateAdvertisement(errorMessage);
            await bot.sendMessage(chatId, response, { parse_mode: 'HTML', disable_web_page_preview: true });
        }
    }
};

/**
 * Fetch data from CoinGecko
 * @param {string} apiUrl - The CoinGecko markets endpoint
 * @param {string} coinId - The coin ID (e.g. 'bitcoin', 'ethereum')
 * @returns {string|null} A formatted message string or null if not found/invalid
 */
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
        if (!response.data || response.data.length === 0) {
            // No match from CoinGecko
            return null;
        }

        const data = response.data[0];

        // Format 24h volume
        const volume24h = data.total_volume
            ? formatNumber(data.total_volume)
            : 'N/A';

        // Format market cap
        const marketCap = data.market_cap
            ? formatNumber(data.market_cap)
            : 'N/A';

        return `
💰 *${data.name}* - $${data.symbol.toUpperCase()}
💵 Price: $${data.current_price?.toFixed(2) || 'N/A'}
⚖ H/L: $${data.high_24h?.toFixed(2) || 'N/A'} | $${data.low_24h?.toFixed(2) || 'N/A'}
🌕 1h: ${data.price_change_percentage_1h_in_currency?.toFixed(2) || 'N/A'}%
🌕 24h: ${data.price_change_percentage_24h_in_currency?.toFixed(2) || 'N/A'}%
🌕 7d: ${data.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A'}%
☠️ 30d: ${data.price_change_percentage_30d_in_currency?.toFixed(2) || 'N/A'}%
🏆 ATH: $${data.ath?.toFixed(2) || 'N/A'} (${data.ath_change_percentage?.toFixed(2) || 'N/A'}%)
📊 24h Vol: $${volume24h}
💎 MCap: $${marketCap}
        `;
    } catch (error) {
        logger.warn('CoinGecko API error:', error.message);
        return null;
    }
};

/**
 * Fetch data from kas.fyi
 * @param {string} apiUrl - The kas.fyi API endpoint with the ticker param
 * @returns {string|null} A formatted message string or null if not found/invalid
 */
const fetchFromKasFyi = async (apiUrl) => {
    try {
        const response = await axios.get(apiUrl, { headers: { accept: 'application/json' } });
        if (!response.data || !response.data.results || response.data.results.length === 0) {
            // No match from kas.fyi
            return null;
        }

        const coinData = response.data.results[0];

        // 1) Check if coinData is valid at all (has a ticker)
        if (!coinData || !coinData.ticker) {
            return null;
        }

        // 2) Check if there's a valid numeric price
        if (
            !coinData.price ||
            typeof coinData.price.usd !== 'number' ||
            Number.isNaN(coinData.price.usd)
        ) {
            // Treat non-numeric or missing 'usd' price as no valid data
            return null;
        }

        const name = coinData.name || coinData.ticker || 'Unknown';
        const priceUsd = coinData.price.usd.toFixed(8);

        // Format market cap
        const marketCapValue = coinData.marketCap?.usd || 0;
        const marketCapUsd = marketCapValue
            ? formatNumber(marketCapValue)
            : 'N/A';

        // Format 24h volume
        const volume24hValue = coinData.volume24h?.usd || 0;
        const volume24hUsd = volume24hValue
            ? formatNumber(volume24hValue)
            : 'N/A';

        const rank = coinData.rank || 'N/A';

        return `
🪙 *${name}* Price (via kas.fyi) 🪙

💵 *Price:* $${priceUsd}
💰 *Market Cap:* $${marketCapUsd}
📊 *24h Volume:* $${volume24hUsd}
🏅 *Rank:* ${rank}
        `;
    } catch (error) {
        logger.warn('kas.fyi API error:', error.message);
        return null;
    }
};

/**
 * Utility function: simple delay
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility function for short-scale formatting (K, M, B, T).
 * Example:
 *   1,234 => "1.23K"
 *   1,234,567 => "1.23M"
 *   9,123,456,789 => "9.12B"
 *   1.23456789e13 => "12.35T"
 *
 * @param {number} value
 * @returns {string} - e.g. "12.34K" or "1.23M"
 */
function formatNumber(value) {
    if (!value || isNaN(value)) return '0'; // fallback

    const absValue = Math.abs(value);

    if (absValue >= 1e12) {
        return (value / 1e12).toFixed(2) + 'T';
    } else if (absValue >= 1e9) {
        return (value / 1e9).toFixed(2) + 'B';
    } else if (absValue >= 1e6) {
        return (value / 1e6).toFixed(2) + 'M';
    } else if (absValue >= 1e3) {
        return (value / 1e3).toFixed(2) + 'K';
    } else {
        // For smaller values, just show two decimals
        return value.toFixed(2);
    }
}
