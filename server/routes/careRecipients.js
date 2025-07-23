const express = require('express');
const router = express.Router();
const CareRecipient = require('../models/CareRecipient');

//DEPRECATED, NO LONGER USING AUTH
//import auth from @clerk/express
//const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file require user
// to be authenticated
//router.use(requireAuth());


// Get all care recipients
router.get('/', async (req, res) => {
  try {
    const careRecipients = await CareRecipient.find({ isActive: true })
      .sort({ name: 1 });
    res.json(careRecipients);
  } catch (err) {
    console.error('Error fetching care recipients:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get specific care recipient
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const careRecipient = await CareRecipient.findById(id);
    if (!careRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    res.json(careRecipient);
  } catch (err) {
    console.error('Error fetching care recipient:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new care recipient
router.post('/', async (req, res) => {
  try {
    const careRecipient = new CareRecipient(req.body);
    const savedCareRecipient = await careRecipient.save();
    res.status(201).json(savedCareRecipient);
  } catch (err) {
    console.error('Error creating care recipient:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update care recipient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCareRecipient = await CareRecipient.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    if (!updatedCareRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    res.json(updatedCareRecipient);
  } catch (err) {
    console.error('Error updating care recipient:', err);
    res.status(400).json({ message: err.message });
  }
});

// Add medication to care recipient
router.post('/:id/medications', async (req, res) => {
  try {
    const { id } = req.params;
    const careRecipient = await CareRecipient.findById(id);
    if (!careRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    
    careRecipient.medications.push(req.body);
    const updatedCareRecipient = await careRecipient.save();
    res.json(updatedCareRecipient);
  } catch (err) {
    console.error('Error adding medication:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update medication
router.put('/:id/medications/:medicationId', async (req, res) => {
  try {
    const { id, medicationId } = req.params;
    const careRecipient = await CareRecipient.findById(id);
    if (!careRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    
    const medication = careRecipient.medications.id(medicationId);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    Object.assign(medication, req.body);
    const updatedCareRecipient = await careRecipient.save();
    res.json(updatedCareRecipient);
  } catch (err) {
    console.error('Error updating medication:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete medication
router.delete('/:id/medications/:medicationId', async (req, res) => {
  try {
    const { id, medicationId } = req.params;
    const careRecipient = await CareRecipient.findById(id);
    if (!careRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    
    careRecipient.medications.id(medicationId).remove();
    await careRecipient.save();
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({ message: err.message });
  }
});

// Soft delete care recipient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCareRecipient = await CareRecipient.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );
    if (!updatedCareRecipient) {
      return res.status(404).json({ message: 'Care recipient not found' });
    }
    res.json({ message: 'Care recipient deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating care recipient:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
