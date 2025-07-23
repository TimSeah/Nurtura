const express = require('express');
const router = express.Router();
const VitalSigns = require('../models/VitalSigns');


//DEPRECATED, NO LONGER USING AUTH
//import auth from @clerk/express
//const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file require user
// to be authenticated
//router.use(requireAuth());



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
    const vitalSigns = new VitalSigns(req.body);
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
