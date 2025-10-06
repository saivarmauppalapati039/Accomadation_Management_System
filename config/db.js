// config/db.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  logging: false,
});

// Load models
const UserModel = require('../models/user');
const RoomModel = require('../models/room');
const BookingModel = require('../models/booking');
const PaymentModel = require('../models/payment');
// ... add others as needed

const User = UserModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes);
const Booking = BookingModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);

const models = { User, Room, Booking, Payment };
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});


module.exports = {
  sequelize,
  User,
  Room,
  Booking,
  Payment
  // ...
};