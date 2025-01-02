const { Sequelize } = require('sequelize');
const config = require('../config/config.json');
const environment = process.env.NODE_ENV || 'development';

const dbConfig = config[environment];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
});

module.exports = sequelize;
