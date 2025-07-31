const express = require('express');
const router  = express.Router();
const Journal = require('../models/Journal');

// List journals for one recipient (and only this user)
router.get('/', async (req, res) => {
  const { recipientId } = req.query;                 // e.g. /api/journal?recipientId=abc
  const filter = { userId: req.auth._id };           // from JWT
  if (recipientId) filter.recipientId = recipientId;

  try {
    const journals = await Journal.find(filter).sort({ date: -1 });
    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new journal entry
router.post('/', async (req, res) => {
  const { recipientId, title, description, date } = req.body;
  try {
    const newJ = new Journal({
      userId:       req.auth._id,   // always from JWT
      recipientId, title, description, date
    });
    const saved = await newJ.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Update an entry (only if it belongs to this user)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Delete an entry (only if it belongs to this user)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth._id
    });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;