// routes/bookingRoutes.js
const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// 🔒 Only hostelers can book
router.post('/',  createBooking);

// Hostelers (own) + admin (all)
router.get('/', getBookings);

// Admin-only status updates
router.patch('/:id/status', updateBookingStatus);

module.exports = router;