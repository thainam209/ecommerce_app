'use strict';

module.exports = {
  up: async (queryInterface) => {
    // DÙ SQL SERVER CÓ CHẶN KIỂU GÌ CŨNG PHẢI CHẤP NHẬN CÁI NÀY
    await queryInterface.sequelize.query(`
      ALTER TABLE [ComboItems] ADD CONSTRAINT FK_ComboItems_productId
      FOREIGN KEY ([productId]) REFERENCES [Products]([id])
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE [ComboItems] DROP CONSTRAINT FK_ComboItems_productId
    `);
  },

  noTransaction: true
};