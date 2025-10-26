'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('CartItems', {
      fields: ['ProductId'],
      type: 'foreign key',
      name: 'FK_CartItems_Products',
      references: {
        table: 'Products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CartItems', 'FK_CartItems_Products');
  }
};