// routes/bookingRoutes.js
const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// 🔒 Only hostelers can book
router.post('/', requireRole('hostelers'), createBooking);

// Hostelers (own) + admin (all)
router.get('/', requireAuth, getBookings);

// Admin-only status updates
router.patch('/:id/status', updateBookingStatus);

module.exports = router;