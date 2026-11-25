const express = require('express');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/:room/history  (protected) - last 50 messages
router.get('/:room/history', verifyToken, async (req, res, next) => {
  try {
    const messages = await Message.find({ room: req.params.room }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(messages.reverse());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
