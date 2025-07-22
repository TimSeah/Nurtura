const express = require('express');
const router = express.Router();
const UserSettings = require('../models/UserSettings');

// Get user settings
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let settings = await UserSettings.findOne({ userId });
    
    // If settings don't exist, create default settings
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
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user settings
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
