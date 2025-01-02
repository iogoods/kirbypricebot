module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Alerts', 'coin', {
          type: Sequelize.STRING,
          allowNull: false,
      });
  },

  down: async (queryInterface) => {
      await queryInterface.removeColumn('Alerts', 'coin');
  },
};
