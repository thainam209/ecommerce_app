'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Combo extends Model {
    static associate(models) {
      // Kiểm tra model có tồn tại không (tránh lỗi khi load sai thứ tự)
      if (models.Voucher) {
        Combo.hasMany(models.Voucher, { 
          foreignKey: 'comboId', 
          as: 'vouchers' 
        });
      }

      if (models.Categories) {
        Combo.belongsTo(models.Categories, {
          foreignKey: 'categoryId',
          as: 'categories' // sửa as thành 'category' cho đúng 1-1
        });
      }

      if (models.Comboitem) {
        Combo.hasMany(models.Comboitem, {
          foreignKey: 'comboId',
          as: 'cartItems' // đổi tên as cho rõ ràng
        });
      }
    }
  }
  Combo.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL(10, 2),
    priceSale: DataTypes.DECIMAL(10, 2),
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Combo',
    tableName: 'Combos'
  });
  return Combo;
};