'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('OrderItems', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'FK_OrderItems_Orders',
      references: {
        table: 'Orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('OrderItems', 'FK_OrderItems_Orders');
  }
};