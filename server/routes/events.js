// backend/routes/events.js

const express = require('express');
const router = express.Router(); 
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');

// Import the email reminder service
const { sendReminderEmail } = require('../services/emailReminderService');

//DEPRECATED, NO LONGER USING AUTH
//import auth from @clerk/express
//const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file require user
// to be authenticated
//router.use(requireAuth());



router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get today's events for dashboard
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const events = await Event.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ startTime: 1 });
    
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching today\'s events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, date, startTime, month, remark, userId, enableReminder, reminderEmail } = req.body;

  const newEvent = new Event({
    title,
    date: new Date(date),
    startTime,
    month,
    remark,
    userId,
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

router.get('/today/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const now = new Date();
    const startToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const events = await Event.find({
      userId: userId,
      date : {
        $gte: startToday,
        $lte: endToday
      }
    }).sort({ date: 1, startTime: 1 }); 
    
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching today events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/month/:month/:id', async (req, res) => {
  try {
    const month = req.params.month;
    const userId = req.params.id;

    const events = await Event.find({month: month, userId: userId}).sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching monthly events:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('❌ Error deleting event:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
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

// Export the router so it can be used by the main Express app (server.js)
module.exports = router;
