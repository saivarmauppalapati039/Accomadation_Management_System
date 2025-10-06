// controllers/authController.js
const bcrypt = require('bcrypt');
const { User } = require('../config/db'); // adjust based on your model export


const signup = async (req, res) => {
  try {
    const { email, password, name, userType = 'visitors' } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    // Only allow valid user types
    const validTypes = ['visitors', 'hostelers', 'admin'];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if user already exists
    const existingUser = await User?.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password with bcrypt (salt handled automatically)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // store hashed password
      userType
    });

    // Automatically log in the user after signup (optional)
    req.session.userId = newUser.id;
    req.session.userType = newUser.userType;

    // Return success (exclude password)
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json({
      success: true,
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

    req.session.userId = user.id;
    req.session.userType = user.userType;

    res.json({
      success: true,
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
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
};

module.exports = { login, logout, signup};