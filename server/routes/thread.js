const express = require('express');
const router = express.Router(); // Create a new Express router
const Thread = require('../models/thread'); // Import your Thread Mongoose model

// --- GET All Threads ---
// Route: GET /api/threads
// This route will fetch all threads from the database.
router.get('/', async (req, res) => {
  try {
    // Find all threads in the database.
    const threads = await Thread.find({}).sort({ date: -1 }); // Sort by date

    // Send the found threads as a JSON response
    res.json(threads);
  } catch (err) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error fetching threads:', err);
    res.status(500).json({ message: err.message });
  }
});

// This route will create a new thread document in the database.
router.post('/', async (req, res) => {
  // Extract thread data from the request body
  const { title, content, date, upvotes, author} = req.body;

  // Create a new Thread instance using the Mongoose model
  // Mongoose will automatically validate the data against the schema.
  const newThread = new Thread({
    title,
    content,
    date: new Date(date), // Convert the date string from frontend to a Date object
    upvotes,
    author
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

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
