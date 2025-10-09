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
router.post('/', createRoom);
router.patch('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;