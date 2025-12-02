'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      // Categories hasMany Products (một Categories có nhiều Products)
      Categories.hasMany(models.Product, {
        foreignKey: 'categoryId',
        as: 'products'
      });
      // Categories hasMany Combos (một Categories có nhiều Combos)
      Categories.hasMany(models.Combo, {
        foreignKey: 'categoryId',
        as: 'combos'
      });
    }
  }
  Categories.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
        allowNull:false,
        type: DataTypes.STRING
    },
    description: DataTypes.TEXT,
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
    modelName: 'Categories',
    tableName: 'Categories'
  });
  return Categories;
};