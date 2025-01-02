const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define(
    'Alert',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        chatId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        coin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        condition: {
            type: DataTypes.ENUM('above', 'below'),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false,
        },
    },
    {
        tableName: 'Alerts',
        timestamps: true,
    }
);

module.exports = Alert;
