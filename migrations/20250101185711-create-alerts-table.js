module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('Alerts', {
          id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
          },
          chatId: {
              type: Sequelize.BIGINT,
              allowNull: false,
          },
          coin: {
              type: Sequelize.STRING,
              allowNull: false,
          },
          condition: {
              type: Sequelize.ENUM('above', 'below'),
              allowNull: false,
          },
          price: {
              type: Sequelize.DECIMAL(18, 8),
              allowNull: false,
          },
          createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
      });
  },

  down: async (queryInterface) => {
      await queryInterface.dropTable('Alerts');
  },
};
