// backend/routes/carerecepients.js
const express = require('express');
const router = express.Router();
const Carerecepients = require('../models/Carerecepients')

router.post('/', async (req, res) => {
    const { name, remark, caregiverId } = req.body;
    const careRecepient = new Carerecepients({
        name,
        remark,
        caregiverId
    })
    try {
        const savedRecepient = await careRecepient.save(); 
        res.status(201).json(savedRecepient);

    } catch(error) {
        console.error('Error creating carerecepient: ', error);
        res.status(400).json({ message: err.message }); 
    }
})

router.get('/:id', async(req, res) => {
    const id = req.params.id;

    try {
        const recepients = await Carerecepients.find({caregiverId : id}).sort({ name : 1});
        res.json(recepients);

    } catch(error) {
        console.error('Error fetching carerecepients: ', error);
        res.status(400).json({ message: err.message }); 

    }
})

module.exports = router;