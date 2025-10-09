// routes/roomRoutes.js
const express = require('express');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: all users can read
router.get('/', requireAuth, getRooms);
router.get('/:id', requireAuth, getRoomById);

// Admin-only: write operations
router.post('/', requireAuth, createRoom);
router.patch('/:id', requireAuth, updateRoom);
router.delete('/:id', requireAuth, deleteRoom);

module.exports = router;