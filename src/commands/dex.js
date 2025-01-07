const axios = require("axios");

module.exports = {
    name: 'dex',
    description: 'Fetches the price of a Solana token from Raydium pools.',
    usage: '/dex [solana_mint_address]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(
                chatId,
                "Please provide the mint address of the token.\nExample: /dex So11111111111111111111111111111111111111112"
            );
            return;
        }

        const mintAddress = args[0].trim();

        try {
            const price = await fetchTokenPriceFromRaydium(mintAddress);

            if (price === null) {
                await bot.sendMessage(chatId, "Token not found in Raydium pools.");
                return;
            }

            const message = `💰 Price for Token (${mintAddress}): $${price.toFixed(
                8
            )}`;
            await bot.sendMessage(chatId, message);
        } catch (error) {
            console.error("Error executing /dex command:", error);
            await bot.sendMessage(chatId, "An error occurred while fetching the token price.");
        }
    },
};

// Helper function to fetch token price from Raydium
async function fetchTokenPriceFromRaydium(mintAddress) {
    const raydiumPoolsUrl = "https://api.raydium.io/v2/main/pairs";

    try {
        // Fetch all Raydium pools
        const response = await axios.get(raydiumPoolsUrl);
        const pools = response.data;

        // Find the pool that matches the mint address
        const pool = pools.find(
            (pool) =>
                pool.baseMint === mintAddress || pool.quoteMint === mintAddress
        );

        if (!pool) {
            console.log("Token not found in Raydium pools.");
            return null;
        }

        // Calculate price based on token position in the pool
        const price =
            pool.baseMint === mintAddress
                ? parseFloat(pool.price)
                : 1 / parseFloat(pool.price);

        console.log(`Token Price for ${mintAddress}: $${price.toFixed(8)}`);
        return price;
    } catch (error) {
        console.error("Error fetching token price from Raydium:", error);
        return null;
    }
}
