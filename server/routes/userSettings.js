const express = require('express');
const router = express.Router();
const UserSettings = require('../models/UserSettings');

// Get user settings
router.get('/', async (req, res) => {
  try {
    //const { userId } = req.params;
    const userId = req.auth._id;
    
    let settings = await UserSettings.findOne({ userId });
    
    // If settings don't exist, create default settings
    /*
    if (!settings) {
      settings = new UserSettings({
        userId,
        profile: {
          name: 'Caregiver',
          email: 'caregiverreminder@gmail.com',
          phone: '(555) 123-4567',
          address: '123 Main Street, Springfield, IL 62701',
          emergencyContact: 'Emergency Contact - (555) 987-6543'
        }
      });
      await settings.save();
    }
      */

    if (!settings) {
      settings = await UserSettings.create({
        userId,
        profile: {
          name: req.auth.username,           // default from JWT
          email: '',                         // you can leave blank or pull from JWT
          /* … */
        },
        /* … */
        // need await settings.save()  ??
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user settings
router.put('/', async (req, res) => {
  try {
    const userId = req.auth._id;
    
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
