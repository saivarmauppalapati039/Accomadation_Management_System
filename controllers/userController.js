// controllers/userController.js
const { User } = require('../config/db');

// GET /api/profile → Get own profile
const getOwnProfile = async (req, res) => {
  try {
    // ✅ Use req.user.id (from JWT)
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PATCH /api/profile → Update own profile
const updateOwnProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    // ✅ Use req.user.id
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ name, email });
    const { password, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// GET /api/users → Admin: list all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // never expose passwords
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET /api/users/:id → Admin: get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// POST /api/users → Admin: create new user (e.g., staff)
const createUser = async (req, res) => {
  try {
    const { name, email, password, userType = 'hostelers' } = req.body;

    // Only allow admin to create admin/hostelers
    const validTypes = ['hostelers', 'admin'];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type for admin creation' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      userType
    });

    const { password: _, ...safeUser } = newUser.toJSON();
    res.status(201).json(safeUser);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// PATCH /api/users/:id → Admin: update any user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, userType } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate userType if provided
    if (userType && !['visitors', 'hostelers', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    await user.update({ name, email, userType });
    const { password, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE /api/users/:id → Admin: delete any user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getOwnProfile,
  updateOwnProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};