// src/commands/poll.js
module.exports = {
    name: 'poll',
    description: 'Create a poll for users to vote on.',
    skipGlobalAd: true, // Verhindert globale Werbung
    usage: '/poll [question]',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length === 0) {
            await bot.sendMessage(chatId, "Please provide a question for the poll. Example: /poll Will Bitcoin reach $100,000 in 2025?");
            return;
        }

        const question = args.join(' ');
        await bot.sendPoll(chatId, question, ['Yes', 'No'], { is_anonymous: true });
    }
};
