// src/services/coinGeckoService.js
const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

const getTopCoins = async (limit = 10) => {
    try {
        const response = await axios.get(`${config.coingeckoApiUrl}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: limit,
                page: 1,
                sparkline: false
            }
        });
        return response.data;
    } catch (error) {
        logger.error('Fehler beim Abrufen der Top Coins: %o', error);
        throw new Error('Fehler beim Abrufen der Top Coins.');
    }
};

const getCoinPrice = async (coinId) => {
    try {
        const response = await axios.get(`${config.coingeckoApiUrl}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                ids: coinId,
                order: 'market_cap_desc',
                per_page: 1,
                page: 1,
                sparkline: false
            }
        });
        return response.data[0];
    } catch (error) {
        logger.error('Fehler beim Abrufen des Coin-Preises: %o', error);
        throw new Error('Fehler beim Abrufen des Coin-Preises.');
    }
};

// Weitere Funktionen wie getHistoricalData etc. können hier hinzugefügt werden

module.exports = {
    getTopCoins,
    getCoinPrice,
};
