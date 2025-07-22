// backend/routes/journal.js

const express = require('express');
const router = express.Router(); 
const Journal = require('../models/Journal');

//import auth from @clerk/express
const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file require user
// to be authenticated
router.use(requireAuth());



router.get('/', async (req, res) => {
  try {
    // Find all journals in the database.
    const journals = await Journal.find({});
    res.json(journals);

  } catch (err) {
    console.error('Error fetching journals: ', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {

  const { userId, recipientId, title, description, date } = req.body;

  const newJournal = new Journal({
    userId,
    recipientId,
    title,
    description,
    date
  });

  try {
    const savedJournal = await newJournal.save();
    res.status(201).json(savedJournal);

  } catch (err) {
    console.error('Error creating journal: ', err);
    res.status(400).json({ message: err.message }); 

  }
});

router.get('/userId/:id/recipientId/:recipientId', async (req, res) => {

  const userId = req.params.id;
  const recipientId = req.params.recipientId;

  try {
    // Find all journals in the database.
    const journals = await Journal.find({userId: userId, recipientId: recipientId});
    res.json(journals);

  } catch (err) {
    console.error('Error fetching journals: ', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/journalId/:id', async (req, res) => {
  const journalId = req.params.id;
  try {
    // Find a specific journal by ID.
    const journal = await Journal.findById(journalId);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    res.json(journal);
  } catch (err) {
    console.error('Error fetching journal: ', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/journalId/:id', async (req, res) => {
  const journalId = req.params.id;
  try {
    const updatedJournal = await Journal.findByIdAndUpdate(
      journalId,
      req.body,
      { new: true } // Return the updated document
    );
    
    if (!updatedJournal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    res.json(updatedJournal);
  } catch (err) {
    console.error('Error updating journal: ', err);
    res.status(500).json({ message: err.message });
  }
});


router.delete('/journalId/:id', async (req, res) => {
  const journalId = req.params.id;
  try {
    const deletedJournal = await Journal.findByIdAndDelete(journalId);
    
    if (!deletedJournal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    res.json({ message: 'Journal deleted successfully' });
  } catch (err) {
    console.error('Error deleting journal: ', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;