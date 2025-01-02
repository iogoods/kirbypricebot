const axios = require('axios');

const API_KEY = '372341d0bf4348848a5c731428e4108d';
const BASE_URL = 'https://newsapi.org/v2/top-headlines';

const getLatestNews = async () => {
    try {
        // Adjusted to fetch from general crypto-related news if BBC has no content
        const response = await axios.get(BASE_URL, {
            params: {
                sources: 'bbc-news',
                apiKey: API_KEY,
                pageSize: 5, // Limit to 5 articles for testing
            }
        });

        if (response.data && response.data.articles) {
            return response.data.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
            }));
        }

        return []; // Return an empty array if no articles are found
    } catch (error) {
        console.error("Error fetching news articles:", error.message);
        return [];
    }
};

module.exports = {
    getLatestNews,
};
