const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');

router.get('/:id', async (req, res) => {
  try {
    const comments = await Comment.find({Thread: threadId}).sort({ date: -1 }); // Sort by date
    res.json(comments);
  } catch (err) {
    console.error('Error fetching Comments:', err);
    res.status(500).json({ message: err.message });
  }
});
router.post('/', async (req, res) => {
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

module.exports = router;