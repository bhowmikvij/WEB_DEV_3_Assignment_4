const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const appEvents = require('../events/appEvents');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken); // every notes route is protected

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid note id' });
  }
  next();
}

// POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

    const note = await Note.create({ title, content, owner: req.user.id });
    appEvents.emit('note:created', note);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes  (only my notes)
router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({ owner: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get('/:id', checkId, async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id
router.put('/:id', checkId, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const update = {};
    if (title) update.title = title;
    if (content) update.content = content;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      update,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', checkId, async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    appEvents.emit('note:deleted', note);
    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
