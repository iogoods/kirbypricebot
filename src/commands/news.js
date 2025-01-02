// src/commands/news.js
const newsService = require('../services/newsService');

module.exports = {
    name: 'news',
    description: 'Displays the latest news from the crypto world.',
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        try {
            const articles = await newsService.getLatestNews();
            if (articles.length === 0) {
                await bot.sendMessage(chatId, "No recent news found.");
                return;
            }

            let message = "📰 **Latest BBC News** 📰\n\n";
            articles.forEach(article => {
                message += `**${article.title}**\n`;
                message += `${article.description || ''}\n`;
                message += `[Read more](${article.url})\n\n`;
            });
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', disable_web_page_preview: true });
        } catch (error) {
            await bot.sendMessage(chatId, "Sorry, there was a problem fetching the news.");
        }
    }
};
