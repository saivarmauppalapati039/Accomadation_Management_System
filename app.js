// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 🛡️ CORS: Allow frontend origin
const FRONTEND_URL = 'https://accomadation-management-system-frontend.onrender.com';

app.use(cors({
  origin: FRONTEND_URL || process.env.FRONTEND_URL,
  credentials: true // Not needed for JWT
}));

app.use(express.json());

// 🧭 Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Hostel Management API is running!' });
});

module.exports = app;