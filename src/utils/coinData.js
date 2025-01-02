const axios = require('axios');
const logger = require('./logger');
const fixedTickers = require('./fixedTickers'); // Import of fixed tickers mapping
require('dotenv').config();

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

let coinsList = []; // Array of all coins
let symbolMap = {}; // Map from symbol to array of coins

// Fetch and cache coin data
const fetchAndCacheCoinData = async () => {
    try {
        logger.info('Fetching coin data from CoinGecko...');
        const response = await axios.get(`${COINGECKO_API_URL}/coins/list`);
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response structure from CoinGecko');
        }

        coinsList = response.data;

        // Build the symbolMap
        symbolMap = {};
        coinsList.forEach(coin => {
            const symbol = coin.symbol.toLowerCase();
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = [];
            }
            symbolMap[symbol].push(coin);
        });

        logger.info(`Successfully fetched and cached ${coinsList.length} coins from CoinGecko.`);

        // Validate fixed tickers
        Object.keys(fixedTickers).forEach(symbol => {
            const coinId = fixedTickers[symbol];
            const matchingCoins = symbolMap[symbol] || [];
            const exists = matchingCoins.some(coin => coin.id === coinId);

            if (exists) {
                logger.info(`Fixed ticker '${symbol.toUpperCase()}' correctly maps to '${coinId}'.`);
            } else {
                logger.warn(`Fixed ticker '${symbol.toUpperCase()}' does not map to any CoinGecko ID.`);
            }
        });

    } catch (error) {
        logger.error('Error fetching CoinGecko coin data:', error);
        coinsList = []; // Reset to ensure no stale data
        symbolMap = {};
    }
};

// Fetch coin price
const fetchCoinPrice = async (coinId) => {
    try {
        logger.info(`Fetching price for coin ID: ${coinId}`);
        const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
            params: {
                ids: coinId,
                vs_currencies: 'usd'
            }
        });

        if (response.data && response.data[coinId] && response.data[coinId].usd !== undefined) {
            logger.info(`Price fetched for ${coinId}: $${response.data[coinId].usd}`);
            return response.data[coinId].usd;
        }

        throw new Error(`Price data for ${coinId} not found`);
    } catch (error) {
        logger.error(`Error fetching price for ${coinId}:`, error.message);
        throw error;
    }
};

// Get coins by symbol
const getCoinsBySymbol = (symbol) => {
    return symbolMap[symbol.toLowerCase()] || [];
};

// Get coin by name (case-insensitive exact match)
const getCoinByName = (name) => {
    if (!coinsList || coinsList.length === 0) {
        logger.warn('Coins list is empty, unable to search by name.');
        return null;
    }
    return coinsList.find(coin => coin.name.toLowerCase() === name.toLowerCase()) || null;
};

// Get coin by fixed ticker mapping
const getCoinByFixedTicker = (symbol) => {
    const fixedCoinId = fixedTickers[symbol.toLowerCase()];
    if (!fixedCoinId) {
        return null;
    }

    if (!coinsList || coinsList.length === 0) {
        logger.warn('Coins list is empty, unable to resolve fixed tickers.');
        return null;
    }

    return coinsList.find(coin => coin.id === fixedCoinId) || null;
};

module.exports = {
    fetchAndCacheCoinData,
    fetchCoinPrice,
    getCoinsBySymbol,
    getCoinByName,
    getCoinByFixedTicker
};
