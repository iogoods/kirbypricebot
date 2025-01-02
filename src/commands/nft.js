const axios = require('axios');
const logger = require('../utils/logger');

module.exports = {
    name: 'nft',
    description: 'Fetches NFT market data for a specific collection.',
    usage: '/nft [collection_slug]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(
                chatId,
                "Please provide the slug of an NFT collection. Example: /nft cryptopunks"
            );
            return;
        }

        const collectionSlug = args.join('-').toLowerCase(); // Format slug
        const apiUrl = `https://api.opensea.io/api/v2/collections/${collectionSlug}`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    accept: 'application/json',
                    'X-API-KEY': process.env.OPENSEA_API_KEY, // Use environment variable for security
                },
            });

            const collectionData = response.data;

            // Validate the response structure
            if (!collectionData || !collectionData.name) {
                logger.error(`Unexpected API response format:`, response.data);
                await bot.sendMessage(
                    chatId,
                    "No data found for the specified collection. Please check the slug and try again."
                );
                return;
            }

            const name = collectionData.name || 'N/A';
            const description = collectionData.description || 'No description available.';
            const totalSupply = collectionData.total_supply || 'N/A';
            const openseaUrl = collectionData.opensea_url || 'N/A';
            const twitter = collectionData.twitter_username
                ? `https://twitter.com/${collectionData.twitter_username}`
                : 'Not available';
            const discord = collectionData.discord_url || 'Not available';

            const message = `
🎨 *NFT Collection: ${name}*
📖 Description: ${description}
📦 Total Supply: ${totalSupply}
🌐 OpenSea URL: [Link](${openseaUrl})
🐦 Twitter: ${twitter}
💬 Discord: ${discord}

Powered by OpenSea API.
            `;

            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
        } catch (error) {
            logger.error(`Error fetching NFT data for collection "${collectionSlug}":`, error);
            await bot.sendMessage(
                chatId,
                "There was an issue retrieving NFT data. Please try again later."
            );
        }
    },
};
