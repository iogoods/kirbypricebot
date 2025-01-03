// src/commands/dex.js
const axios = require('axios');
const logger = require('../utils/logger');
const { TokenListProvider } = require('@solana/spl-token-registry');
const cache = require('../utils/priceCache'); // For caching
const fixedTickers = require('../utils/fixedTickers'); // Fixed ticker mapping

module.exports = {
    name: 'dex',
    description: 'Fetches the price of a Solana token based on its mint address.',
    usage: '/dex [solana_mint_address]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(chatId, "Please provide the mint address of the Solana token.\nExample: /dex So11111111111111111111111111111111111111112");
            return;
        }

        const mintAddress = args[0].trim();
        logger.info(`Received /dex command with Mint Address: "${mintAddress}" from chat ID: ${chatId}`);

        // Validate the Mint Address
        if (!isValidSolanaAddress(mintAddress)) {
            await bot.sendMessage(chatId, `The provided mint address "${mintAddress}" is invalid. Please check and try again.`);
            logger.warn(`Invalid Mint Address provided: "${mintAddress}" by chat ID: ${chatId}`);
            return;
        }

        try {
            // Fetch token information based on the Mint Address
            const tokenInfo = await getTokenInfoByMintAddress(mintAddress);
            if (!tokenInfo) {
                await bot.sendMessage(chatId, `No token found for the mint address "${mintAddress}". Please verify the address and try again.`);
                logger.warn(`No token found for Mint Address: "${mintAddress}"`);
                return;
            }

            const { name, symbol } = tokenInfo;
            logger.info(`Token found: ${name} (${symbol}) for Mint Address: ${mintAddress}`);

            // Map symbol to CoinGecko ID
            const coinGeckoId = await getCoinGeckoId(symbol);
            if (!coinGeckoId) {
                await bot.sendMessage(chatId, `No CoinGecko data found for the token "${name}" (${symbol}).`);
                logger.warn(`No CoinGecko ID found for symbol "${symbol}"`);
                return;
            }

            // Fetch the token's price from CoinGecko
            const priceData = await getCoinGeckoPriceData(coinGeckoId);
            if (!priceData) {
                await bot.sendMessage(chatId, `No price data found for the token "${name}" (${symbol}).`);
                logger.warn(`No price data found for CoinGecko ID "${coinGeckoId}"`);
                return;
            }

            // Format and send the price data to the user
            const message = `
*${name}* (${symbol})
💰 Current Price: ${priceData.usd !== null ? `$${priceData.usd.toLocaleString()}` : 'N/A'}
📈 24h Change: ${priceData.usd_24h_change !== null ? `${priceData.usd_24h_change.toFixed(2)}%` : 'N/A'}
🕒 Last Updated: ${priceData.last_updated}
            `;

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            logger.info(`Sent price data for Token: "${name}" (${symbol}) to chat ID: ${chatId}`);

        } catch (error) {
            logger.error(`Error executing /dex command for Mint Address "${mintAddress}":`, error);
            await bot.sendMessage(chatId, "An error occurred while fetching the price data. Please try again later.");
        }
    }
};

// Helper function to validate a Solana address
const isValidSolanaAddress = (address) => {
    const regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return regex.test(address);
};

// Helper function to fetch token information based on the Mint Address
const getTokenInfoByMintAddress = async (mintAddress) => {
    try {
        const provider = new TokenListProvider();
        const tokens = await provider.resolve();
        const tokenList = tokens.filterByClusterSlug('mainnet-beta').getList();

        const token = tokenList.find(t => t.address === mintAddress);
        if (token) {
            return {
                name: token.name,
                symbol: token.symbol
            };
        }

        // If token not found in the list, return null
        return null;

    } catch (error) {
        logger.error(`Error fetching token info for Mint Address "${mintAddress}":`, error);
        return null;
    }
};

// Helper function to map token symbol to CoinGecko ID
const getCoinGeckoId = async (symbol) => {
    try {
        // Check if the mapping is cached
        const cachedMapping = cache.get('symbol_to_coingecko_id');
        let symbolToIdMap = cachedMapping;

        if (!symbolToIdMap) {
            // Fetch the CoinGecko coin list and create the mapping
            const response = await axios.get(`${process.env.COINGECKO_API_URL}/coins/list`);
            const coins = response.data;

            symbolToIdMap = {};
            coins.forEach(coin => {
                const sym = coin.symbol.toLowerCase();
                // Only add the first occurrence to avoid overwriting
                if (!symbolToIdMap[sym]) {
                    symbolToIdMap[sym] = coin.id;
                }
            });

            // Apply fixed tickers to override mappings
            Object.keys(fixedTickers).forEach(sym => {
                symbolToIdMap[sym.toLowerCase()] = fixedTickers[sym].toLowerCase();
            });

            // Cache the mapping for future use (e.g., 24 hours)
            cache.set('symbol_to_coingecko_id', symbolToIdMap, 86400); // 24 hours in seconds
            logger.info('Cached symbol to CoinGecko ID mapping.');
        }

        const lowerSymbol = symbol.toLowerCase();
        return symbolToIdMap[lowerSymbol] || null;

    } catch (error) {
        logger.error(`Error fetching CoinGecko ID for symbol "${symbol}":`, error);
        return null;
    }
};

// Helper function to fetch price data from CoinGecko
const getCoinGeckoPriceData = async (coinGeckoId) => {
    try {
        // Check if the price data is cached
        const cachedPrice = cache.get(`cg_price_${coinGeckoId}`);
        if (cachedPrice) {
            logger.info(`Serving cached CoinGecko price data for Coin ID "${coinGeckoId}"`);
            return cachedPrice;
        }

        // Fetch price data from CoinGecko
        const response = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price`, {
            params: {
                ids: coinGeckoId,
                vs_currencies: 'usd',
                include_24hr_change: 'true'
            }
        });

        const priceInfo = response.data[coinGeckoId];
        if (!priceInfo) {
            logger.warn(`No price data returned from CoinGecko for Coin ID "${coinGeckoId}"`);
            return null;
        }

        const priceData = {
            usd: priceInfo.usd || null,
            usd_24h_change: priceInfo.usd_24h_change || null,
            last_updated: new Date().toLocaleString()
        };

        // Cache the price data for 5 minutes
        cache.set(`cg_price_${coinGeckoId}`, priceData, 300); // 5 minutes in seconds
        logger.info(`Cached CoinGecko price data for Coin ID "${coinGeckoId}"`);

        return priceData;

    } catch (error) {
        logger.error(`Error fetching CoinGecko price data for Coin ID "${coinGeckoId}":`, error);
        return null;
    }
};
