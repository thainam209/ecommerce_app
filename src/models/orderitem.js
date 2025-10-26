'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // OrderItem belongsTo Order (một OrderItem thuộc về một Order)
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'OrderId',
        as: 'order'
      });
      // OrderItem belongsTo Product (một OrderItem thuộc về một Product)
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'ProductId',
        as: 'product'
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
    OrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10, 2),
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
    modelName: 'OrderItem',
    tableName: 'OrderItems' // Giả sử bảng tên OrderItems
  });
  return OrderItem;
};