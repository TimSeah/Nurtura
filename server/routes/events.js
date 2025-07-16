// backend/routes/events.js

const express = require('express');
const router = express.Router(); // Create a new Express router
const Event = require('../models/Event'); // Import your Event Mongoose model

// --- GET All Events ---
// Route: GET /api/events
// This route will fetch all events from the database.
router.get('/', async (req, res) => {
  try {
    // Find all events in the database.
    const events = await Event.find({}).sort({ date: 1, startTime: 1 }); // Sort by date then start time

    // Send the found events as a JSON response
    res.json(events);
  } catch (err) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error fetching events:', err);
    res.status(500).json({ message: err.message });
  }
});

// This route will create a new event document in the database.
router.post('/', async (req, res) => {
  // Extract event data from the request body
  const { title, date, startTime, month, remark } = req.body;

  // Create a new Event instance using the Mongoose model
  // Mongoose will automatically validate the data against the schema.
  const newEvent = new Event({
    title,
    date: new Date(date), // Convert the date string from frontend to a Date object
    startTime,
    month,
    remark
  });

  try {
    // Save the new event document to the database
    const savedEvent = await newEvent.save();

    // Send a 201 (Created) status code and the saved event as a JSON response
    res.status(201).json(savedEvent);
  } catch (err) {
    // If an error occurs (e.g., validation error, database error),
    // log it and send a 400 (Bad Request) or 500 (Internal Server Error) response.
    console.error('Error creating event:', err);
    res.status(400).json({ message: err.message }); // 400 for validation errors
  }
});

router.get('/:month', async (req, res) => {
  try {

    const { month } = req.params;

    // Find all events in the database.
    const events = await Event.find({month: month}).sort({ date: 1, startTime: 1 }); // Sort by date then start time

    // Send the found events as a JSON response
    res.json(events);
  } catch (err) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error fetching monthly events:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
