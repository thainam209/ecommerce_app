'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      // một user sẽ có nhiều voucher
      Voucher.belongsTo(models.User, {
        foreignKey: 'userId', 
        as: 'user'
      });
    }
  }
  Voucher.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    discount:{
      allowNull: false,
      type: DataTypes.INTEGER
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
    modelName: 'Voucher',
    tableName: 'Vouchers'
  });
  return Voucher;
};