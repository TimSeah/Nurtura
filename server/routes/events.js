// backend/routes/events.js

const express = require('express');
const router = express.Router(); 
const Event = require('../models/Event');

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
  const { title, date, startTime, month, remark, userId } = req.body;

  // Create a new Event instance using the Mongoose model
  // Mongoose will automatically validate the data against the schema.
  const newEvent = new Event({
    title,
    date: new Date(date), // Convert the date string from frontend to a Date object
    startTime,
    month,
    remark,
    userId
  });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);

  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ message: err.message }); 

  }
});

router.get('/today/:id', async (req, res) => {
  try {

    const userId = req.params.id;

    const now = new Date();
    const startToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    console.log('Start of today:', startToday);
    console.log('End of today:', endToday);

    // Find all events in the database.
    const events = await Event.find({
      userId: userId,
      date : {
        $gte: startToday,
        $lte: endToday
      }
    }).sort({ date: 1, startTime: 1 }); 
    res.json(events);
  } catch (err) {
    console.error('Error fetching monthly events:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/month/:month/:id', async (req, res) => {
  try {

    const month = req.params.month;
    const userId = req.params.id;
    const today = new Date().getDate();

    // Find all events in the database.
    const events = await Event.find({month: month, userId: userId}).sort({ date: 1, startTime: 1 }); // Sort by date then start time

    // Send the found events as a JSON response
    res.json(events);
  } catch (err) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error fetching monthly events:', err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event: ', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log("Update data:", req.body);
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    console.error('Error updating event: ', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
