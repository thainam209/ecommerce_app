'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('OrderItems', {
      fields: ['ProductId'],
      type: 'foreign key',
      name: 'FK_OrderItems_Products',
      references: {
        table: 'Products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('OrderItems', 'FK_OrderItems_Products');
  }
};