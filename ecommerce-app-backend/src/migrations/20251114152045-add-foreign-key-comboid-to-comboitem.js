'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('ComboItems', {
      fields: ['comboId'],
      type: 'foreign key',
      name: 'FK_ComboItems_Combos',
      references: {
        table: 'Combos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('ComboItems', 'FK_ComboItems_Combos');
  }
};
