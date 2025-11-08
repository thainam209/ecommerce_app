'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Product hasMany OrderItems (một Product có nhiều OrderItems)
      Product.hasMany(models.OrderItem, {
        foreignKey: 'ProductId',
        as: 'orderItems'
      });
      // Product hasMany CartItems (một Product có nhiều CartItems)
      Product.hasMany(models.CartItem, {
        foreignKey: 'ProductId',
        as: 'cartItems'
      });
    }
  }
  Product.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL(10, 2),
    stock: DataTypes.INTEGER,
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
    modelName: 'Product',
    tableName: 'Products'
  });
  return Product;
};