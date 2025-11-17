'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Combos', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'FK_Combos_Categories',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Combos', 'FK_Combos_Categories');
  }
};
