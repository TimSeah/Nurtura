const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable mergeParams to access threadId from parent route
const Thread = require('../models/thread');
const Comment = require('../models/Comment');
const moderator = require('../middleware/moderationMiddleware'); // Import moderation middleware

router.get('/', async (req, res) => {
const threadId = req.params.threadId;
  try {
    const comments = await Comment.find({threadId}).sort({ date: -1 }); // Sort by date
    res.json(comments);
  } catch (err) {
    console.error('Error fetching Comments:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', moderator.moderationMiddleware(), async (req, res) => {
  const {threadId, content, author, date} = req.body;
  const newComment = new Comment({
    threadId,
    content,
    author,
    date: new Date(date)
  });

  try {
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting Comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;