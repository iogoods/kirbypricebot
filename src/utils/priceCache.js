// src/utils/priceCache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache für 5 Minuten

module.exports = cache;
