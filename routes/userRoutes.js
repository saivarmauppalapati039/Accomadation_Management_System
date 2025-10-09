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
router.get('/users', requireAuth,  getAllUsers);
router.get('/users/:id', requireAuth, getUserById);
router.post('/users', requireAuth, createUser);
router.patch('/users/:id', requireAuth, updateUser);
router.delete('/users/:id', requireAuth, deleteUser);

module.exports = router;