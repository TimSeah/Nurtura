const express = require('express');
const router = express.Router();
const VitalSigns = require('../models/VitalSigns');
const CareRecipient = require('../models/CareRecipient');

// Get recent vital signs for dashboard (all recipients)
router.get('/recent/dashboard', async (req, res) => {
  try {
    const userId = req.auth._id; // Get authenticated user ID
    const limit = parseInt(req.query.limit) || 10;
    
    // Get care recipients for this user first
    const careRecipients = await CareRecipient.find({ userId }).select('_id name');
    const recipientIds = careRecipients.map(recipient => recipient._id);
    
    // Get recent vital signs for user's care recipients
    const recentVitalSigns = await VitalSigns.find({
      recipientId: { $in: recipientIds }
    })
      .sort({ dateTime: -1 })
      .limit(limit)
      .lean();
    
    // Transform the data for dashboard display
    const activities = recentVitalSigns.map(vital => {
      const recipient = careRecipients.find(r => r._id.toString() === vital.recipientId.toString());
      
      return {
        id: vital._id.toString(),
        type: 'vital',
        description: formatVitalSignDescription(vital, recipient?.name || 'Patient'),
        time: formatTimeAgo(vital.dateTime),
        priority: getPriorityFromVitalType(vital.vitalType, vital.value),
        vitalType: vital.vitalType,
        value: vital.value,
        unit: vital.unit
      };
    });
    
    res.json(activities);
  } catch (err) {
    console.error('Error fetching recent vital signs for dashboard:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper functions
function formatVitalSignDescription(vital, recipientName) {
  const vitalTypeNames = {
    'blood_pressure': 'Blood pressure',
    'heart_rate': 'Heart rate',
    'temperature': 'Temperature',
    'weight': 'Weight',
    'blood_sugar': 'Blood glucose',
    'oxygen_saturation': 'Oxygen saturation'
  };
  
  const typeName = vitalTypeNames[vital.vitalType] || vital.vitalType;
  
  return `${typeName} reading recorded: ${vital.value} ${vital.unit} for ${recipientName}`;
}

function formatTimeAgo(dateTime) {
  const now = new Date();
  const past = new Date(dateTime);
  const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}

function getPriorityFromVitalType(vitalType, value) {
  // Simple priority logic - you can enhance this based on medical ranges
  switch (vitalType) {
    case 'blood_pressure':
      // Assuming format like "120/80"
      const [systolic] = value.split('/').map(Number);
      if (systolic > 140) return 'high';
      if (systolic < 90) return 'medium';
      return 'low';
    case 'blood_sugar':
      const bloodSugar = parseInt(value);
      if (bloodSugar > 180 || bloodSugar < 70) return 'high';
      if (bloodSugar > 140) return 'medium';
      return 'low';
    case 'heart_rate':
      const heartRate = parseInt(value);
      if (heartRate > 100 || heartRate < 60) return 'medium';
      return 'low';
    default:
      return 'low';
  }
}

// Get all vital signs for a recipient
router.get('/:recipientId', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const vitalSigns = await VitalSigns.find({ recipientId })
      .sort({ dateTime: -1 });
    res.json(vitalSigns);
  } catch (err) {
    console.error('Error fetching vital signs:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get vital signs by type for a recipient
router.get('/:recipientId/:vitalType', async (req, res) => {
  try {
    const { recipientId, vitalType } = req.params;
    const vitalSigns = await VitalSigns.find({ 
      recipientId, 
      vitalType 
    }).sort({ dateTime: -1 });
    res.json(vitalSigns);
  } catch (err) {
    console.error('Error fetching vital signs by type:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add new vital signs reading
router.post('/', async (req, res) => {
  try {
    // Input validation for required fields
    if (!req.body.recipientId || typeof req.body.recipientId !== 'string' || !req.body.recipientId.trim()) {
      return res.status(400).json({ message: 'Recipient ID is required and cannot be empty' });
    }

    if (!req.body.vitalType || typeof req.body.vitalType !== 'string') {
      return res.status(400).json({ message: 'Vital type is required' });
    }

    if (req.body.value === undefined || req.body.value === null || typeof req.body.value !== 'number') {
      return res.status(400).json({ message: 'Value is required and must be a number' });
    }

    // Validate ranges for specific vital types
    const { vitalType, value } = req.body;
    if (vitalType === 'heart_rate' && (value < 0 || value > 300)) {
      return res.status(400).json({ message: 'Heart rate must be between 0 and 300' });
    }

    if (vitalType === 'temperature' && (value < 80 || value > 120)) {
      return res.status(400).json({ message: 'Temperature must be between 80 and 120' });
    }

    const vitalSigns = new VitalSigns({
      ...req.body,
      recipientId: req.body.recipientId.trim()
    });
    const savedVitalSigns = await vitalSigns.save();
    res.status(201).json(savedVitalSigns);
  } catch (err) {
    console.error('Error saving vital signs:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update vital signs reading
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVitalSigns = await VitalSigns.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    if (!updatedVitalSigns) {
      return res.status(404).json({ message: 'Vital signs not found' });
    }
    res.json(updatedVitalSigns);
  } catch (err) {
    console.error('Error updating vital signs:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete vital signs reading
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVitalSigns = await VitalSigns.findByIdAndDelete(id);
    if (!deletedVitalSigns) {
      return res.status(404).json({ message: 'Vital signs not found' });
    }
    res.json({ message: 'Vital signs deleted successfully' });
  } catch (err) {
    console.error('Error deleting vital signs:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
