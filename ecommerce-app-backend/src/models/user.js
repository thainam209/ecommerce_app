'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User hasMany Orders (một User có nhiều Orders)
      User.hasMany(models.Order, {
        foreignKey: 'userId', // Khóa ngoại trong bảng Orders
        as: 'orders' // Alias để sử dụng trong include
      });
      // User hasMany CartItems (một User có nhiều CartItems)
      User.hasMany(models.CartItem, {
        foreignKey: 'userId', // Khóa ngoại trong bảng CartItems
        as: 'cartItems'
      });
    }
  }
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING
    },
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
    modelName: 'User',
    tableName: 'Users' // Nếu bảng tên Users (số nhiều)
  });
  return User;
};