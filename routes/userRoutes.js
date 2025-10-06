// routes/userRoutes.js
const express = require('express');
const {
  getOwnProfile,
  updateOwnProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// 🔐 Self-service (any logged-in user)
router.get('/profile', requireAuth, getOwnProfile);
router.patch('/profile', requireAuth, updateOwnProfile);

// 👮 Admin-only routes
router.get('/users', requireRole('admin'), getAllUsers);
router.get('/users/:id', requireRole('admin'), getUserById);
router.post('/users', requireRole('admin'), createUser);
router.patch('/users/:id', requireRole('admin'), updateUser);
router.delete('/users/:id', requireRole('admin'), deleteUser);

module.exports = router;