'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
       Room.hasMany(models.Booking, {
            foreignKey: 'roomId',
            as: 'bookings'
        });
    }
  }

  Room.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // ✅ Fixed!
        primaryKey: true,
      },
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // ✅ Recommended: room numbers should be unique!
      },
      roomType: {
        type: DataTypes.ENUM('single', 'double', 'triple', 'quadruple'),
        allowNull: false,
        field: 'room_type',
      },
      price: {
        type: DataTypes.DECIMAL(10, 2), // ✅ Better than DOUBLE for money!
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'under maintenance'),
        allowNull: false,
        defaultValue: 'available', // ✅ Good idea: new rooms start as "available"
        field: 'status',
      },
    },
    {
      sequelize,
      modelName: 'Room',
      tableName: 'rooms',
      timestamps: true,
      underscored: true,
    }
  );

  return Room; // ✅ Don't forget this!
};