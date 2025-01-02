// src/commands/help.js
module.exports = {
    name: 'help',
    description: 'Displays a list of all available commands and their descriptions.',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const helpMessage = `
📚 *Kirbypricebot - Help* 📚

Here is a list of all available commands:

• **/kirby** - Fetches and displays the current price of Kirby.
  - *Example:* /kirby

• **/start** - Starts the bot and displays the welcome message.

• **/top** - Shows the top 10 cryptocurrencies by market capitalization.

• **/price [Cryptocurrency]** - Displays the current price of a specific cryptocurrency.
  - *Example:* /price bitcoin

• **/news** - Shows the latest news from the crypto world.
  - *Example:* /news

• **/dex [mint_address] - Displays the price of a Solana token based on its mint address.

• **/dom - Displays the current Bitcoin Dominance and total cryptocurrency market cap.

• **/nft [collection] - Track NFT collections.

• **/poll [question] - Create a poll.

• **/sentiment - Get the current market sentiment.

• **/stock [symbol] - Get the price of a stock.

• **/ath [symbol]: Show the all-time high price of a cryptocurrency. Example: /ath bitcoin.

• **/atl [symbol]: Show the all-time low price of a cryptocurrency. Example: /atl ethereum.

• **/rates: Fetch and display the latest economic indicators, including GDP, unemployment rates, and other financial metrics.


• **Alerts
• **/setalert [coin] [above|below] [price] - Set an alert for a cryptocurrency. Example: \`/setalert bitcoin above 50000\`
• **/myalerts - View all your active alerts.


If you have any questions or need support, feel free to reach out!
        `;

        await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }
};
