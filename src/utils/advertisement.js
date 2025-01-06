const logger = require('./logger');

// List of advertisements for the crypto token
const advertisements = [
    `🚀 <b>Introducing KIRBY!</b> A revolutionary cryptocurrency. 🌟 Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> today`,
    `💎 <b>Invest in the Future with KIRBY!</b> Secure, fast, and built for growth. 🌐 Be part of the community: <a href="https://t.me/kirbyonkas">Join now</a>`,
    `📢 <b>KIRBY: The Crypto of Tomorrow!</b> Don't miss out on this exciting journey. 🔗 <a href="https://t.me/kirbyonkas">Learn more</a>`,
    `🔥 <b>KIRBY is Here!</b> 🌍 Be part of the change and join our mission: <a href="https://t.me/kirbyonkas">Click here</a>`,
    `🌟 <b>KIRBY: A Token Like No Other!</b> 🚀 Join the <a href="https://t.me/kirbyonkas">Kirby movement</a> today`,
    `🚀 $KIRBY – the hidden gem in the #KRC20 space! Don't miss the next big thing. Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> now`,
    `🌟 $KIRBY combines innovation with community. Be part of the movement: <a href="https://t.me/kirbyonkas">Join today</a>`,
    `💎 The next memecoin with massive potential? It’s $KIRBY – solid growth and BIG #KRC20 potential. <a href="https://t.me/kirbyonkas">Join now</a>`,
    `🚀 2025 is the year of $KIRBY! Solana bridge and strong partnerships await. <a href="https://t.me/kirbyonkas">Don't miss out</a>`,
    `🌐 $KIRBY: Bridging Kaspa and Solana. Backed by strong German developers. <a href="https://t.me/kirbyonkas">Join today</a>`,
    `🔥 Why $KIRBY? Community, innovation, and real potential collide here. <a href="https://t.me/kirbyonkas">Be part of it</a>`,
    `💥 Not just a coin, but a movement: $KIRBY is taking over the market. <a href="https://t.me/kirbyonkas">Join the revolution</a>`,
    `🌟 Under 10M market cap with limitless potential – $KIRBY is the BIG #KRC20 bet you’ve been waiting for. <a href="https://t.me/kirbyonkas">Join now</a>`,
    `🚀 To the moon? Forget that! $KIRBY is heading to Mars. Join the <a href="https://t.me/kirbyonkas">Kirby Army</a> today`,
    `💎 $KIRBY isn’t just a memecoin; it’s a revolutionary blockchain foundation. <a href="https://t.me/kirbyonkas">Be part of the future</a>`,
    `🚀 <b>Maximize Your Crypto Potential with MEXC!</b> Trade hundreds of cryptocurrencies with low fees and lightning-fast transactions. <a href="https://promote.mexc.com/r/EtRW1zhu">Join now!</a>`,
    `💎 <b>Join the Revolution on MEXC!</b> Get access to exclusive trading opportunities and earn rewards. <a href="https://promote.mexc.com/r/EtRW1zhu">Sign up today!</a>`,
    `📈 <b>Ready to Trade?</b> MEXC is your gateway to effortless crypto trading. Sign up now and claim your rewards! <a href="https://promote.mexc.com/r/EtRW1zhu">Click here!</a>`,
    `🔥 <b>Why Choose MEXC?</b> 💰 Low trading fees 🌍 Global market access 🎁 Exclusive bonuses for new users! <a href="https://promote.mexc.com/r/EtRW1zhu">Start trading today!</a>`,
    `🌟 <b>Looking for the Perfect Exchange?</b> MEXC offers low fees, fast transactions, and a huge selection of tokens. <a href="https://promote.mexc.com/r/EtRW1zhu">Sign up now!</a>`,
    `🌐 <b>Your Gateway to Global Markets</b> Trade 1,000+ cryptocurrencies on one of the fastest-growing exchanges: MEXC! <a href="https://promote.mexc.com/r/EtRW1zhu">Join here!</a>`,
    `🚀 <b>Zero Fees on Spot Trading</b> Why pay more? With MEXC, you enjoy zero spot trading fees on top pairs! <a href="https://promote.mexc.com/r/EtRW1zhu">Start trading!</a>`,
    `💹 <b>Earn While You HODL</b> MEXC offers flexible staking and passive income opportunities. <a href="https://promote.mexc.com/r/EtRW1zhu">Learn more!</a>`,
    `🔥 <b>Trade Anywhere, Anytime</b> With the MEXC app, crypto trading is at your fingertips. <a href="https://promote.mexc.com/r/EtRW1zhu">Download and join today!</a>`,
    `🎁 <b>Exclusive Rewards Await You!</b> New users can claim bonuses when they sign up through this link: <a href="https://promote.mexc.com/r/EtRW1zhu">Register now!</a>`,
    `💰 <b>Ready to Level Up Your Crypto Game?</b> Trade smarter with MEXC. Sign up now! <a href="https://promote.mexc.com/r/EtRW1zhu">Join here!</a>`,
    `🌟 <b>Looking for Zero Fees and Big Rewards?</b> MEXC has you covered! <a href="https://promote.mexc.com/r/EtRW1zhu">Sign up now!</a>`,
    `🚀 <b>Don’t Just Trade. Succeed!</b> Start trading on MEXC and unlock exclusive bonuses. <a href="https://promote.mexc.com/r/EtRW1zhu">Register today!</a>`,
    `🔥 <b>HODLers, Stakers, and Traders Wanted!</b> Join MEXC now and take your portfolio to the moon! <a href="https://promote.mexc.com/r/EtRW1zhu">Sign up here!</a>`,
    `📈 <b>Crypto Made Easy.</b> MEXC is the key to next-level trading! <a href="https://promote.mexc.com/r/EtRW1zhu">Join today!</a>`,
    `🎁 <b>Limited-Time Bonus Alert!</b> Sign up on MEXC today and claim your welcome bonus. <a href="https://promote.mexc.com/r/EtRW1zhu">Register now!</a>`,
    `⏳ <b>Don’t Wait!</b> This offer won’t last forever. Sign up on MEXC now and get rewarded! <a href="https://promote.mexc.com/r/EtRW1zhu">Join today!</a>`,
    `💸 <b>Your Crypto Adventure Starts Here!</b> New users can earn exclusive rewards when they join MEXC. <a href="https://promote.mexc.com/r/EtRW1zhu">Get started!</a>`,
    
];

// Function to get a random advertisement
const getRandomAdvertisement = () => {
    const randomIndex = Math.floor(Math.random() * advertisements.length);
    return advertisements[randomIndex];
};

// Function to integrate an advertisement into a message
const integrateAdvertisement = (message) => {
    const advertisement = getRandomAdvertisement();
    return `${message}\n\n${advertisement}`;
};

// Function to send an advertisement as a separate message
const sendAdvertisement = async (bot, chatId, skipForCommands = []) => {
    const currentCommand = bot.currentCommand || '';
    if (skipForCommands.includes(currentCommand)) {
        logger.info(`Skipping advertisement for command: ${currentCommand}`);
        return;
    }

    try {
        const adMessage = getRandomAdvertisement();
        logger.info(`Sending advertisement to Chat ID ${chatId}: ${adMessage}`);
        await bot.sendMessage(chatId, adMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        logger.info(`Advertisement sent to Chat ID ${chatId}.`);
    } catch (error) {
        logger.error(`Error sending advertisement to Chat ID ${chatId}:`, error);
    }
};

module.exports = {
    sendAdvertisement,
    getRandomAdvertisement,
    integrateAdvertisement, // Export the function for integration
};
