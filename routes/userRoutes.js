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
router.get('/users',  getAllUsers);
router.get('/users/:id',  getUserById);
router.post('/users',  createUser);
router.patch('/users/:id',  updateUser);
router.delete('/users/:id',  deleteUser);

module.exports = router;