// src/utils/coinMapper.js
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('./logger');

const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

const fetchCoinList = async () => {
    const cacheKey = 'coinList';
    let coinList = cache.get(cacheKey);

    if (!coinList) {
        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
            coinList = response.data;
            cache.set(cacheKey, coinList);
            logger.info('Fetched and cached CoinGecko coin list.');
        } catch (error) {
            logger.error('Error fetching CoinGecko coin list:', error);
            throw new Error('Failed to fetch coin list from CoinGecko.');
        }
    } else {
        logger.info('Retrieved CoinGecko coin list from cache.');
    }

    return coinList;
};

const getCoinId = async (ticker) => {
    const coinList = await fetchCoinList();
    const coin = coinList.find(c => c.symbol.toLowerCase() === ticker.toLowerCase());

    if (coin) {
        return coin.id;
    } else {
        return null;
    }
};

module.exports = {
    getCoinId
};
