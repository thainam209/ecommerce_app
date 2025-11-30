'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem belongsTo User (một CartItem thuộc về một User)
      CartItem.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      // CartItem belongsTo Product (một CartItem thuộc về một Product)
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });

      CartItem.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combo'
      });
    }
  }
  CartItem.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    comboId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Combo',
        key: 'id'
      },
    },
    quantity: DataTypes.INTEGER,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'CartItems'
  });
  return CartItem;
};