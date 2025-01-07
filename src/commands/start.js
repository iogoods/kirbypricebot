// src/commands/start.js
module.exports = {
    name: 'start',
    description: 'Starts the bot and displays a welcome message.',
    skipGlobalAd: true, // Verhindert globale Werbung
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'there';
        
        const welcomeMessage = `
Hello ${firstName}! 👋

Welcome to *Kirbypricebot*. I’m here to help you stay updated with the latest trends and information about cryptocurrencies.

Here’s what I can do for you:
• **/kirby** - Fetches and displays the current price of Kirby.
  - *Example:* /kirby
- **/top**: Show the top 10 cryptocurrencies by market capitalization.
- **/price or /p [Cryptocurrency]**: Display the current price of a specific cryptocurrency.
- **/chart or /c [Cryptocurrency]**: Display the current chart of a specific cryptocurrency.
- **/news**: Show the latest news from the crypto world.
- **/dex [mint_address] - Displays the price of a Solana token based on its mint address.
- **/dom - Displays the current Bitcoin Dominance and total cryptocurrency market cap.
- **/nft [collection] - Track NFT collections.
- **/poll [question] - Create a poll.
- **/sentiment - Get the current market sentiment.
- **/stock [symbol] - Get the price of a stock.
- **/ath [symbol]: Show the all-time high price of a cryptocurrency. Example: /ath bitcoin.
- **/atl [symbol]: Show the all-time low price of a cryptocurrency. Example: /atl ethereum.
- **/rates: Fetch and display the latest economic indicators, including GDP, unemployment rates, and other financial metrics.


• **Alerts
- **/setalert [coin] [above|below] [price] - Set an alert for a cryptocurrency. Example: \`/setalert bitcoin above 50000\`
- **/myalerts - View all your active alerts.


To get detailed information about each command, type **/help**.

Happy trading! 🚀
        `;

        await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    }
};
