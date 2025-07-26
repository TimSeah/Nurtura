const express = require('express');
const router = express.Router(); // Create a new Express router
const Thread = require('../models/thread'); // Import the Thread model
const Comment = require('../models/comment');
console.log('threads.js route file loaded');

// --- GET All Threads ---
// Route: GET /api/threads
// This route will fetch all threads from the database.
router.get('/', async (req, res) => {
  const threads = await Thread.find().sort({ date: -1 });
  // one aggregation to get all comment‑counts at once
  const counts = await Comment.aggregate([
    { $match: { threadId: { $in: threads.map(t => t._id) } } },
    { $group: { _id: '$threadId', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

  const payload = threads.map(t => ({
    _id:     t._id,
    title:   t.title,
    content: t.content,
    author:  t.author,
    date:    t.date,
    upvotes: t.upvotes,
    vote:    req.user?.id ? (t.votes.get(req.user.id) === 1 ? 'up' : t.votes.get(req.user.id) === -1 ? 'down' : null) : null,
    replies: countMap.get(t._id.toString()) || 0
  }));
  res.json(payload);
});

// This route will create a new thread document in the database.
router.post('/', async (req, res) => {
  // Extract thread data from the request body
  const { title, content, date, upvotes } = req.body;
  const author = req.auth?.email || req.auth?.username; 

  // Create a new Thread instance using the Mongoose model
  // Mongoose will automatically validate the data against the schema.
  const newThread = new Thread({
    title,
    content,
    author,
    date: new Date(date), // Convert the date string from frontend to a Date object
    upvotes,
  });

  try {
    // Save the new thread document to the database
    const savedThread = await newThread.save();

    // Send a 201 (Created) status code and the saved thread as a JSON response
    res.status(201).json(savedThread);
  } catch (err) {
    // If an error occurs (e.g., validation error, database error),
    // log it and send a 400 (Bad Request) or 500 (Internal Server Error) response.
    console.error('Error creating thread:', err);
    res.status(400).json({ message: err.message }); // 400 for validation errors
  }
});

router.get('/:id', async (req, res) => {
  const threadId = req.params.id; // Get the thread ID from the request parameters
  try {
    // Find the thread by ID
    const thread = await Thread.findById(threadId);
    
    // If the thread is not found, send a 404 (Not Found) response
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Send the found thread as a JSON response
    res.json(thread);
  } catch (err) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error fetching thread:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- PATCH  /api/threads/:id/vote  ---
// body: { direction: "up" | "down" }
//experimenting with this
router.patch('/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body;           // expected "up" or "down"
  console.log('PATCH /api/threads/:id/vote called with', req.params.id, req.body);

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ message: 'direction must be "up" or "down"' });
  }

  try {
    const thread = await Thread.findById(id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (typeof thread.upvotes !== 'number') {
    thread.upvotes = 0;
    }
    if (direction === 'up')      thread.upvotes += 1;
    else if (direction === 'down') thread.upvotes -= 1;

    await thread.save();
    res.json({ upvotes: thread.upvotes });   // return the new total
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Thread.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Thread not found' });
    res.json({ message: 'Thread deleted successfully' });
  } catch (err) {
    console.error('Error deleting thread:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
