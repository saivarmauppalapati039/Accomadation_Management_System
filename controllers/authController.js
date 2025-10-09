// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here';

const signup = async (req, res) => {
  try {
    const { email, password, name, userType = 'visitors' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    const validTypes = ['visitors', 'hostelers', 'admin'];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      userType
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = (req, res) => {
  // JWT is stateless - just clear token on frontend
  res.json({ success: true });
};

module.exports = { login, logout, signup };