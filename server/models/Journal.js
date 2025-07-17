const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true, 
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        required: true
    }
})

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;