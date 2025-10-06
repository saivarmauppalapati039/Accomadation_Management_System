'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // A booking belongs to one user (guest)
      Booking.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // A booking belongs to one room
      Booking.belongsTo(models.Room, {
        foreignKey: 'roomId',
        as: 'room'
      });

      // A booking can have one payment (or use hasMany if multiple payments allowed)
      Booking.hasOne(models.Payment, {
        foreignKey: 'bookingId',
        as: 'payment'
      });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        field: 'user_id'
      },
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        field: 'room_id'
      },
      checkIn: {
        type: DataTypes.DATEONLY, // e.g., "2024-06-20"
        allowNull: false,
        field: 'check_in'
      },
      checkOut: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'check_out'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_amount'
      },
      status: {
        type: DataTypes.ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled'),
        defaultValue: 'confirmed',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      timestamps: true,
      underscored: true,
    }
  );

  return Booking;
};