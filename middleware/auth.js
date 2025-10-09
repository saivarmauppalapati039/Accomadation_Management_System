// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, userType }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log(req);
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };