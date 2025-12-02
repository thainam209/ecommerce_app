'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongsTo Order (một OrderItem thuộc về một Order)
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // OrderItem belongsTo Product (một OrderItem thuộc về một Product)
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });

      OrderItem.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combo'
      });
    }
  }
  
  OrderItem.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Order',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1 // Đảm bảo quantity >= 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0 // Đảm bảo price >= 0
      }
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'OrderItems',
    timestamps: true // Tự động quản lý createdAt/updatedAt
  });
  
  return OrderItem;
};