'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      // ví dụ: Voucher.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Voucher.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discount: DataTypes.INTEGER,
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