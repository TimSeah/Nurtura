const express = require('express');
const router = express.Router(); // Create a new Express router
const Thread = require('../models/thread'); // Import the Thread model
const Comment = require('../models/comment');
console.log('threads.js route file loaded');

// --- GET All Threads ---
// Route: GET /api/threads
// This route will fetch all threads from the database.
// working one currently


/*
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
*/

// Current Implementation Suggestion
router.get('/', async (req, res) => {
  console.log('GET /api/threads route hit');
  console.log('req.auth:', req.auth);
  
  try {
    const threads = await Thread.find().sort({ date: -1 });
    console.log(`Found ${threads.length} threads`);
    
    // Get comment counts
    const counts = await Comment.aggregate([
      { $match: { threadId: { $in: threads.map(t => t._id) } } },
      { $group: { _id: '$threadId', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

    const payload = threads.map(t => {
      let userVote = null;
      
      // Get current user's vote if authenticated
      if (req.auth?._id && t.votes && Array.isArray(t.votes)) {
        const existingVote = t.votes.find(v => 
          v.userId && v.userId.toString() === req.auth._id.toString()
        );
        userVote = existingVote ? existingVote.direction : null;
      }

      console.log(`Thread ${t.title}: User ${req.auth?._id} vote = ${userVote}`);

      return {
        _id: t._id,
        title: t.title,
        content: t.content,
        author: t.author,
        date: t.date,
        upvotes: t.upvotes,
        userVote: userVote, // This should be different for each user
        replies: countMap.get(t._id.toString()) || 0
      };
    });
    
    console.log('Sending payload to client');
    res.json(payload);
  } catch (error) {
    console.error('Error in GET /api/threads:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});




// This route will create a new thread document in the database.
router.post('/', async (req, res) => {
  // Extract thread data from the request body
  const { title, content, date, upvotes, author } = req.body;
  //const author = req.auth?.email || req.auth?.username; 

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

// WORKING ONE
/*
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
*/
//Current Implementation Suggestion
router.get('/:id', async (req, res) => {
  console.log('GET /api/threads/:id route hit');
  console.log('Thread ID:', req.params.id);
  console.log('req.auth:', req.auth);
  
  const threadId = req.params.id;
  try {
    const thread = await Thread.findById(threadId);
    
    if (!thread) {
      console.log('Thread not found');
      return res.status(404).json({ message: 'Thread not found' });
    }

    console.log('Found thread:', thread.title);
    console.log('Thread votes:', thread.votes);

    // Get current user's vote state
    let userVote = null;
    if (req.auth?._id && thread.votes && Array.isArray(thread.votes)) {
      const existingVote = thread.votes.find(v => 
        v.userId && v.userId.toString() === req.auth._id.toString()
      );
      userVote = existingVote ? existingVote.direction : null;
      console.log('Found existing vote for user:', existingVote);
    }

    console.log(`Final userVote for user ${req.auth?._id}: ${userVote}`);

    // Return thread with user's vote state
    const response = {
      _id: thread._id,
      title: thread.title,
      content: thread.content,
      author: thread.author,
      date: thread.date,
      upvotes: thread.upvotes,
      userVote: userVote, // This should be specific to the requesting user
      replies: 0 // You can calculate this if needed
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error fetching thread:', err);
    res.status(500).json({ message: err.message });
  }
});



// --- PATCH  /api/threads/:id/vote  ---
// body: { direction: "up" | "down" }
//experimenting with this
// THIS IS THE WORKING REDDIT ONE WELL SORT OFF
/*
router.patch('/:id/vote', async (req, res) => {
  const { direction } = req.body;
  const userId = req.auth?._id;

  console.log('🔥 vote route hit');
  console.log('🧠 req.auth:', req.auth);

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ message: 'Invalid vote direction' });
  }

  const thread = await Thread.findById(req.params.id);
  if (!thread) return res.status(404).json({ message: 'Thread not found' });

  const existingVote = thread.votes.find(v => v.userId.toString() === userId.toString());

  if (existingVote) {
    if (existingVote.direction === direction) {
      // No change
      return res.status(200).json({ upvotes: thread.upvotes, userVote: direction });
    }

    // Switch vote
    thread.upvotes += (direction === 'up') ? 2 : -2;
    existingVote.direction = direction;
  } else {
    // First-time vote
    thread.votes.push({ userId, direction });
    thread.upvotes += (direction === 'up') ? 1 : -1;
  }

  await thread.save();
  res.json({ upvotes: thread.upvotes, userVote: direction });
});
*/

// Current Implementation Suggestion
router.patch('/:id/vote', async (req, res) => {
  const { direction } = req.body;
  const userId = req.auth?._id;

  console.log('Vote route hit');
  console.log('Direction:', direction);
  console.log('User ID:', userId);

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ message: 'Invalid vote direction' });
  }

  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    console.log('Thread found:', thread.title);
    console.log('Current upvotes:', thread.upvotes);
    console.log('Current votes:', thread.votes);

    // Initialize votes array if it doesn't exist
    if (!Array.isArray(thread.votes)) {
      thread.votes = [];
    }

    const existingVoteIndex = thread.votes.findIndex(v => 
      v.userId && v.userId.toString() === userId.toString()
    );
    
    let userVote = null;
    let previousVoteDirection = null;

    if (existingVoteIndex !== -1) {
      previousVoteDirection = thread.votes[existingVoteIndex].direction;
      console.log('Found existing vote:', previousVoteDirection);

      if (previousVoteDirection === direction) {
        // User clicked same direction - remove vote (toggle off)
        console.log('Toggling off vote');
        thread.votes.splice(existingVoteIndex, 1);
        thread.upvotes += (direction === 'up') ? -1 : 1;
        userVote = null;
      } else {
        // User switched vote direction
        console.log('Switching vote direction');
        thread.votes[existingVoteIndex].direction = direction;
        thread.upvotes += (direction === 'up') ? 2 : -2;
        userVote = direction;
      }
    } else {
      // First-time vote
      console.log('First time vote');
      thread.votes.push({ userId, direction });
      thread.upvotes += (direction === 'up') ? 1 : -1;
      userVote = direction;
    }

    console.log('Final upvotes:', thread.upvotes);
    console.log('Final userVote:', userVote);
    console.log('Final votes array:', thread.votes);

    await thread.save();
    console.log('Thread saved successfully');

    res.json({ 
      upvotes: thread.upvotes, 
      userVote: userVote,
      success: true 
    });
  } catch (err) {
    console.error('Error voting:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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

// GET /api/threads/:id/replies/count
router.get('/:id/replies/count', async (req, res) => {
  try {
    const threadId = req.params.id;
    const count = await Comment.countDocuments({ threadId });
    res.json({ count });
  } catch (err) {
    console.error('Error counting replies:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
