// middleware/auth.js
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in' });
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.userId || !roles.includes(req.session.userType)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };