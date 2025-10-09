// controllers/bookingController.js
const { User, Room, Booking } = require('../config/db');
const { sequelize } = require('../config/db'); // for transactions

// POST /api/bookings → ONLY hostelers can book
const createBooking = async (req, res) => {
  if (req.user.userType !== 'hostelers') {
    return res.status(403).json({ error: 'Only hostelers can book rooms' });
  }

  const t = await sequelize.transaction();
  try {
    const { roomId, checkIn, checkOut } = req.body;
    // ✅ Use req.user.id (not req.user.userId)
    const userId = req.user.id;

    // ... rest of the function (no other changes needed)
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
    if (req.user.userType !== 'admin') {
      // ✅ Use req.user.id
      where.userId = req.user.id;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: { exclude: ['password'] } 
        },
        { 
          model: Room, 
          as: 'room'
        }
      ]
    });
    res.json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// PATCH /api/bookings/:id/status → admin only
const updateBookingStatus = async (req, res) => {
  if (req.user.userType !== 'admin') {
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