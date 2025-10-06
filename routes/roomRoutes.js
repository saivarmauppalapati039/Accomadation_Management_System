// routes/roomRoutes.js
const express = require('express');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: all users can read
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Admin-only: write operations
router.post('/', requireRole('admin'), createRoom);
router.patch('/:id', requireRole('admin'), updateRoom);
router.delete('/:id', requireRole('admin'), deleteRoom);

module.exports = router;