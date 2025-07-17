// backend/routes/journal.js

const express = require('express');
const router = express.Router(); 
const Journal = require('../models/Journal');

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

  const { userId, title, description, date } = req.body;

  const newJournal = new Journal({
    userId,
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

router.get('/:id', async (req, res) => {

  const userId = req.params.id;

  try {
    // Find all journals in the database.
    const journals = await Journal.find({userId: userId});
    res.json(journals);

  } catch (err) {
    console.error('Error fetching journals: ', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;