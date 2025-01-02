const logger = require('./logger');

// List of advertisements for the crypto token
const advertisements = [
    `🚀 <b>Introducing KIRBY!</b> A revolutionary cryptocurrency. 🌟 Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> today!`,
    `💎 <b>Invest in the Future with KIRBY!</b> Secure, fast, and built for growth. 🌐 Be part of the community: <a href="https://t.me/kirbyonkas">Join now</a>!`,
    `📢 <b>KIRBY: The Crypto of Tomorrow!</b> Don't miss out on this exciting journey. 🔗 <a href="https://t.me/kirbyonkas">Learn more</a>.`,
    `🔥 <b>KIRBY is Here!</b> 🌍 Be part of the change and join our mission: <a href="https://t.me/kirbyonkas">Click here</a>.`,
    `🌟 <b>KIRBY: A Token Like No Other!</b> 🚀 Join the <a href="https://t.me/kirbyonkas">Kirby movement</a> today!`,
    `🚀 $KIRBY – the hidden gem in the #KRC20 space! Don't miss the next big thing. Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> now!`,
    `🌟 $KIRBY combines innovation with community. Be part of the movement: <a href="https://t.me/kirbyonkas">Join today</a>!`,
    `💎 The next memecoin with massive potential? It’s $KIRBY – solid growth and BIG #KRC20 potential. <a href="https://t.me/kirbyonkas">Join now</a>.`,
    `🚀 2025 is the year of $KIRBY! Solana bridge and strong partnerships await. <a href="https://t.me/kirbyonkas">Don't miss out</a>.`,
    `🌐 $KIRBY: Bridging Kaspa and Solana. Backed by strong German developers. <a href="https://t.me/kirbyonkas">Join today</a>!`,
    `🔥 Why $KIRBY? Community, innovation, and real potential collide here. <a href="https://t.me/kirbyonkas">Be part of it</a>!`,
    `💥 Not just a coin, but a movement: $KIRBY is taking over the market. <a href="https://t.me/kirbyonkas">Join the revolution</a>!`,
    `🌟 Under 10M market cap with limitless potential – $KIRBY is the BIG #KRC20 bet you’ve been waiting for. <a href="https://t.me/kirbyonkas">Join now</a>!`,
    `🚀 To the moon? Forget that! $KIRBY is heading to Mars. Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> today!`,
    `💎 $KIRBY isn’t just a memecoin; it’s a revolutionary blockchain foundation. <a href="https://t.me/kirbyonkas">Be part of the future</a>!`

];

// Probability (e.g., 0.3 = 30%)
const AD_PROBABILITY = 0.7; // Adjust the probability as needed

// Function to decide if an advertisement should be sent
const shouldShowAd = () => Math.random() < AD_PROBABILITY;

// Function to send an advertisement
const sendAdvertisement = async (bot, chatId) => {
    if (shouldShowAd()) {
        try {
            // Randomly select an advertisement
            const randomIndex = Math.floor(Math.random() * advertisements.length);
            const adMessage = advertisements[randomIndex];

            // Log the advertisement before sending
            logger.info(`Sending advertisement to Chat ID ${chatId}: ${adMessage}`);

            // Send the advertisement with `disable_web_page_preview` to hide the link preview
            await bot.sendMessage(chatId, adMessage, {
                parse_mode: 'HTML',
                disable_web_page_preview: true // Disable link previews
            });

            logger.info(`Advertisement sent to Chat ID ${chatId}.`);
        } catch (error) {
            logger.error(`Error sending advertisement to Chat ID ${chatId}:`, error);
        }
    } else {
        logger.info(`No advertisement sent to Chat ID ${chatId} (probability check failed).`);
    }
};

module.exports = {
    sendAdvertisement
};
