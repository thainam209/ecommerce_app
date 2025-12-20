const { Sequelize } = require('sequelize');
require('dotenv').config({ debug: true }); // Bật debug logging

console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD); // Cẩn thận khi log mật khẩu ra console
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    port: process.env.DB_PORT,
    dialectOptions: {
      options: {
        server: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        encrypt: true,
        trustServerCertificate: true
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Kiểm tra kết nối
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection to SQL Server has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();

module.exports = sequelize;