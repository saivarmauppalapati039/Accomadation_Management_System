// test-full-db.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// 1️⃣ Create Sequelize instance FIRST
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // set to true to see SQL
  ssl: process.env.NODE_ENV === 'production' ? true : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
});

// 2️⃣ Load models MANUALLY (each model is a function)
const UserModel = require('./models/user');
const RoomModel = require('./models/room');
const BookingModel = require('./models/booking');
const PaymentModel = require('./models/payment');

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes);
const Booking = BookingModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);

// 3️⃣ Set up associations
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// 4️⃣ Test function
async function testFullDB() {
  try {
    // Connect
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL!');

    // Sync tables (creates them)
    await sequelize.sync({ alter: true }); // ⚠️ dev only
    console.log('✅ Tables synced!');

    // Create test data
    const user = await User.create({
      name: 'Test Guest',
      email: 'guest@test.com',
      userType: 'guest'
    });

    const room = await Room.create({
      number: 'T101',
      roomType: 'single',
      price: 99.99,
      status: 'available'
    });

    const booking = await Booking.create({
      userId: user.id,
      roomId: room.id,
      checkIn: '2024-08-01',
      checkOut: '2024-08-03',
      totalAmount: 199.98,
      status: 'confirmed'
    });

    const payment = await Payment.create({
      bookingId: booking.id,
      amount: 199.98,
      paymentMethod: 'cash',
      status: 'completed'
    });

    // Fetch with associations
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'user' },
        { model: Room, as: 'room' },
        { model: Payment, as: 'payment' }
      ]
    });

    console.log('\n📋 Full Booking Loaded:');
    console.log(`Guest: ${fullBooking.user.name}`);
    console.log(`Room: ${fullBooking.room.number} (${fullBooking.room.roomType})`);
    console.log(`Paid: $${fullBooking.payment.amount} via ${fullBooking.payment.paymentMethod}`);

    // Close
    await sequelize.close();
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testFullDB();