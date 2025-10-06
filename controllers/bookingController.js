// controllers/bookingController.js
const { User, Room, Booking } = require('../config/db');
const { sequelize } = require('../config/db'); // for transactions

// POST /api/bookings → ONLY hostelers can book
const createBooking = async (req, res) => {
  // 🔒 Enforce: only hostelers can book
  if (req.session.userType !== 'hostelers') {
    return res.status(403).json({ error: 'Only hostelers can book rooms' });
  }

  const t = await sequelize.transaction();
  try {
    const { roomId, checkIn, checkOut } = req.body;
    const userId = req.session.userId;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    // Check room
    const room = await Room.findByPk(roomId, { transaction: t });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (room.status !== 'available') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Calculate total (nights × price)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat((room.price * nights).toFixed(2));

    // Create booking
    const booking = await Booking.create({
      userId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount,
      status: 'confirmed'
    }, { transaction: t });

    // Mark room as occupied
    await room.update({ status: 'occupied' }, { transaction: t });
    await t.commit();

    res.status(201).json(booking);
  } catch (err) {
    await t.rollback();
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// GET /api/bookings → hostelers see own, admin sees all
const getBookings = async (req, res) => {
  try {
    const where = {};
    if (req.session.userType !== 'admin') {
      // Only hostelers can reach this (visitors blocked by route middleware)
      where.userId = req.session.userId;
    }

    const bookings = await Booking.findAll({
  where,
  include: [
    { 
      model: User, 
      as: 'user', // ✅ Must match the alias in the association
      attributes: { exclude: ['password'] } 
    },
    { 
      model: Room, 
      as: 'room' // ✅ Also use alias for Room if defined
    }
  ]
});
    res.json(bookings);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// PATCH /api/bookings/:id/status → admin only
const updateBookingStatus = async (req, res) => {
  if (req.session.userType !== 'admin') {
    return res.status(403).json({ error: 'Only admin can update booking status' });
  }

  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByPk(id, { transaction: t });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If cancelling or checking out, free the room
    if (status === 'cancelled' || status === 'checked_out') {
      const room = await Room.findByPk(booking.roomId, { transaction: t });
      if (room) await room.update({ status: 'available' }, { transaction: t });
    }

    await booking.update({ status }, { transaction: t });
    await t.commit();

    res.json(booking);
  } catch (err) {
    await t.rollback();
    console.log(err)
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};