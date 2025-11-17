'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ComboItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      comboId: {
        type: Sequelize.INTEGER,
      },
      productId:{
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ComboItems');
  }
};
