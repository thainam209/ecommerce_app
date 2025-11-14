'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order belongsTo User (một Order thuộc về một User)
      Order.belongsTo(models.User, {
        foreignKey: 'userId', // Khóa ngoại trong bảng Orders
        as: 'user'
      });
      
      // Order hasMany OrderItems (một Order có nhiều OrderItems)
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId', // Khóa ngoại trong bảng OrderItems
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'userId',
      references: {
        model: 'User',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status'
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total',
      get() {
        const value = this.getDataValue('total');
        return value == null ? null : Number(value);
      },
      set(value) {
        if (value != null) {
          this.setDataValue('total', Number(value));
        }
      }
    },
    // shippingAddress: {
    //   type: DataTypes.TEXT,
    //   allowNull: true
    // },
    // paymentMethod: {
    //   type: DataTypes.STRING,
    //   allowNull: true
    // },
    // notes: {
    //   type: DataTypes.TEXT,
    //   allowNull: true
    // },
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
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true // Tự động quản lý createdAt/updatedAt
  });
  
  return Order;
};