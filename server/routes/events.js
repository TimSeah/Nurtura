// backend/routes/events.js

const express = require('express');
const router = express.Router(); 
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');

// Import the email reminder service
const { sendReminderEmail } = require('../services/emailReminderService');

router.get('/', async (req, res) => {
  try {
    //const events = await Event.find({}).sort({ date: 1, startTime: 1 });
    const userId = req.auth._id;
    const events = await Event.find({ userId }).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error(' Error fetching events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get today's events for dashboard
/*
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    //const events = await Event.find({
    //  date: {
    //    $gte: startOfDay,
    //    $lt: endOfDay
    //  }
    // }).sort({ startTime: 1 });
    const userId = req.auth._id;
    const events = await Event.find({
    userId,
    date: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ startTime: 1 });
    
    res.json(events);
  } catch (err) {
    console.error(' Error fetching today\'s events:', err.message);
    res.status(500).json({ message: err.message });
  }
});
*/

router.post('/', async (req, res) => {
  
  const { title, date, startTime, month, remark, enableReminder, reminderEmail } = req.body;
  const userId = req.auth._id;

  const newEvent = new Event({
    title,
    date: new Date(date),
    startTime,
    month,
    remark,
    userId, //This comes from the JWT
    enableReminder: enableReminder || false,
    reminderSent: false, // Always start as false for new events
    reminderEmail: reminderEmail || ''
  });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);

  } catch (err) {
    console.error('❌ Error creating event:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    //const userId = req.params.id;
    const userId = req.auth._id;
    const { start, end } = getSingaporeDayRange();
    const events = await Event.find({ 
      userId,
      date: { $gte: start, $lte: end } 
    }).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching today events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/month/:month', async (req, res) => {
  try {
    const month = req.params.month;
    //const userId = req.params.id;
    const userId = req.auth._id;

    const events = await Event.find({month: month, userId: userId}).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching monthly events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    //await Event.findByIdAndDelete(req.params.id);
    await Event.findOneAndDelete({ _id: req.params.id, userId: req.auth._id });
    res.status(204).send();
  } catch (err) {
    console.error('❌ Error deleting event:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    //const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth._id },
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating event:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Test reminder endpoint
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const eventId = req.params.id;
    //const event = await Event.findById(eventId);
    const event = await Event.findOne({
      _id:   eventId,
      userId: req.auth._id
    });
    
    if (!event) {
       return res.status(404).json({ message: 'Event not found or access denied' });
    }

    const userSettings = await UserSettings.findOne({ userId: event.userId });
    if (!userSettings?.profile?.email) {
      return res.status(400).json({ message: 'No email found in user settings' });
    }

    const emailSent = await sendReminderEmail(
      event, 
      userSettings.profile.email, 
      userSettings.profile.name,
      true // isTest = true
    );
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Test reminder sent successfully',
        email: userSettings.profile.email 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send test reminder' 
      });
    }
  } catch (err) {
    console.error('❌ Test reminder error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending test reminder: ' + err.message 
    });
  }
});

function getSingaporeDayRange() {
  const offset = 28800000; // UTC+8
  const now = new Date();
  const singaporeTime = new Date(now.getTime() + offset);
  
  const start = new Date(Date.UTC(
    singaporeTime.getUTCFullYear(),
    singaporeTime.getUTCMonth(),
    singaporeTime.getUTCDate()
  ));
  start.setTime(start.getTime() - offset);
  
  const end = new Date(start.getTime() + 86400000 - 1); // +24hrs -1ms
  
  return { start, end };
}

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
