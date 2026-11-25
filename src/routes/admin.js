const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken, authorizeRoles('admin')); // RBAC: admins only

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    res.status(200).json(await User.find().select('-password'));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/notes
router.get('/notes', async (req, res, next) => {
  try {
    res.status(200).json(await Note.find());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
