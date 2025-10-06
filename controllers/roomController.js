// controllers/roomController.js
const { Room } = require('../config/db');

// GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const { status, roomType } = req.query;
    const where = {};

    if (status) where.status = status;
    if (roomType) where.roomType = roomType;

    const rooms = await Room.findAll({ where });
    res.json(rooms);
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

// POST /api/rooms (admin only)
const createRoom = async (req, res) => {
  try {
    const { number, roomType, price, status = 'available' } = req.body;
        // Validate
    if (!number || !roomType || price == null) {
      return res.status(400).json({ error: 'Number, roomType, and price are required' });
    }

    const newRoom = await Room.create({
      number,
      roomType,
      price,
      status
    });

    res.status(201).json(newRoom);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// PATCH /api/rooms/:id (admin only)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, roomType, price, status } = req.body;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await room.update({ number, roomType, price, status });
    res.json(room);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: 'Failed to update room' });
  }
};

// DELETE /api/rooms/:id (admin only)
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await room.destroy();
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};