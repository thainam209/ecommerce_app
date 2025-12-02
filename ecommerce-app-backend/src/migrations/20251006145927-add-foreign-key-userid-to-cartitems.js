'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('CartItems', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'FK_CartItems_Users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CartItems', 'FK_CartItems_Users');
  }
};