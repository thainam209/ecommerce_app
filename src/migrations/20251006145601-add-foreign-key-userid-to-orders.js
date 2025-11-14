'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'FK_Orders_Users', // Tên ràng buộc, phải duy nhất
      references: {
        table: 'Users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Orders', 'FK_Orders_Users');
  }
};