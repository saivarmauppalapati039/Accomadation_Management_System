// config/db.js (Sequelize version)
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: process.env.NODE_ENV === 'developement' ? true : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'development' ? { require: true, rejectUnauthorized: false } : false
  }
});

module.exports = sequelize;