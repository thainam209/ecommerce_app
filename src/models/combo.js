'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Combo extends Model {
    static associate(models) {
      // Có nhiều combo nằm trong 1 category
      Combo.belongsTo(models.Categories, {
        foreignKey: 'categoryId',
        as: 'categories'
      });
      // 1 combo có nhiều combo items
      Combo.hasMany(models.Comboitem, {
        foreignKey: 'comboId',
        as: 'cartItems'
      });
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