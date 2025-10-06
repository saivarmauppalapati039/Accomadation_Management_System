// app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// 🔌 PostgreSQL pool for sessions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

// 🛡️ Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://accomadation-management-system-frontend.onrender.com', // Vite default
  credentials: true
}));
app.use(express.json());

// 🔐 Session setup
app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET  ,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// 🧭 Routes (add new ones here as you build)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 🏠 Fallback route
app.get('/', (req, res) => {
  res.json({ message: 'Hostel Management API is running!' });
});

module.exports = app;