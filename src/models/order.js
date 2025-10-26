'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongsTo User (một Order thuộc về một User)
      Order.belongsTo(models.User, {
        foreignKey: 'UserId', // Khóa ngoại trong bảng Orders
        as: 'user'
      });
      // Order hasMany OrderItems (một Order có nhiều OrderItems)
      Order.hasMany(models.OrderItem, {
        foreignKey: 'OrderId', // Khóa ngoại trong bảng OrderItems
        as: 'orderItems'
      });
    }
  }
  Order.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    status: DataTypes.STRING,
    total: DataTypes.DECIMAL(10, 2), // Giả sử total là số thập phân
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
    modelName: 'Order',
    tableName: 'Orders'
  });
  return Order;
};