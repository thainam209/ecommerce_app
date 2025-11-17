'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ComboItem extends Model {
    static associate(models) {
      // 1 combo item thuộc về một combo
      ComboItem.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combos'
      });
      // 1 combo item thuộc về 1 sản phẩm
      ComboItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'products'
      });
    }
  }
  ComboItem.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    comboId: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references: {
        model: 'Combo',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    productId:{
      type: DataTypes.INTEGER,
      allowNull: false,
        references: {
        model: 'Product',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    price: DataTypes.DECIMAL(10, 2),
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'ComboItem',
    tableName: 'ComboItems'
  });
  return ComboItem;
};