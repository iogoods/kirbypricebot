const axios = require('axios');
const logger = require('../utils/logger');
const { getCoinByFixedTicker } = require('../utils/coinData');

module.exports = {
    name: 'price',
    description: 'Displays the current price of a cryptocurrency.',
    usage: '/price [cryptocurrency]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(chatId, "Please specify the name or ticker symbol of the cryptocurrency.\nExample: /price bitcoin or /price kirby");
            return;
        }

        const input = args[0].toUpperCase();
        logger.info(`Received /price command with input: "${input}" from chat ID: ${chatId}`);

        const fixedCoin = getCoinByFixedTicker(input.toLowerCase());
        const coinId = fixedCoin?.id || input.toLowerCase();

        // First, try fetching data from CoinGecko
        const coingeckoApiUrl = `${process.env.COINGECKO_API_URL}/coins/markets`;
        const kasApiUrl = `https://api.kas.fyi/token/krc20/marketData?tickers=${input}`;

        try {
            const coingeckoResponse = await fetchFromCoinGecko(coingeckoApiUrl, coinId);
            if (coingeckoResponse) {
                await bot.sendMessage(chatId, coingeckoResponse, { parse_mode: 'Markdown' });
                return;
            }

            // Introduce a short delay before checking kas.fyi
            await delay(1000);

            const kasResponse = await fetchFromKasFyi(kasApiUrl);
            if (kasResponse) {
                await bot.sendMessage(chatId, kasResponse, { parse_mode: 'Markdown' });
                return;
            }

            // If both fail, send an error message
            await bot.sendMessage(chatId, `No data found for "${input}". Please check the cryptocurrency name or ticker symbol.`);
            logger.warn(`No data found for input "${input}" on both CoinGecko and kas.fyi.`);
        } catch (error) {
            logger.error('Error fetching price data:', error);
            await bot.sendMessage(chatId, "Oops! An error occurred while fetching the price data. Please try again later.");
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

        const name = data.name;
        const symbol = data.symbol.toUpperCase();
        const currentPriceUsd = data.current_price?.toFixed(2) || 'N/A';
        const high24h = data.high_24h?.toFixed(2) || 'N/A';
        const low24h = data.low_24h?.toFixed(2) || 'N/A';
        const ath = data.ath?.toFixed(2) || 'N/A';
        const athChange = data.ath_change_percentage?.toFixed(2) || 'N/A';
        const priceChange1h = data.price_change_percentage_1h_in_currency?.toFixed(2) || 'N/A';
        const priceChange24h = data.price_change_percentage_24h_in_currency?.toFixed(2) || 'N/A';
        const priceChange7d = data.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A';
        const priceChange30d = data.price_change_percentage_30d_in_currency?.toFixed(2) || 'N/A';
        const volume24h = (data.total_volume / 1e3)?.toFixed(2) + 'K' || 'N/A';
        const marketCap = (data.market_cap / 1e6)?.toFixed(2) + 'M' || 'N/A';

        return `
💰 *${name}* - $${symbol}
💵 Price: $${currentPriceUsd}
⚖ H/L: $${high24h} | $${low24h}
🌕 1h: ${priceChange1h}%
🌕 24h: ${priceChange24h}%
🌕 7d: ${priceChange7d}%
☠️ 30d: ${priceChange30d}%
🏆 ATH: $${ath} (${athChange}%)
📊 24h Vol: $${volume24h}
💎 MCap: $${marketCap}

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
        const name = coinData.name || coinData.ticker || "Unknown"; // Fallback to ticker if name is missing
        const priceUsd = coinData.price?.usd?.toFixed(8) || 'N/A';
        const marketCapUsd = coinData.marketCap?.usd ? `$${Number(coinData.marketCap.usd).toLocaleString()}` : 'N/A'; // Format with thousands separators
        const volume24hUsd = coinData.volume24h?.usd ? `$${Number(coinData.volume24h.usd).toLocaleString()}` : 'N/A';
        const rank = coinData.rank || 'N/A'; // Corrected variable reference

        return `
🪙 *${name}* Price (via kas.fyi) 🪙

💵 *Price:* $${priceUsd}
💰 *Market Cap:* ${marketCapUsd}
📊 *24h Volume:* ${volume24hUsd}
🏅 *Rank:* ${rank}

        `;
    } catch (error) {
        logger.warn('kas.fyi API error:', error.message);
        return null;
    }
};


// Utility to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
