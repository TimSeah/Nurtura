const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        require: true,
    },
    date:{
        type: Date,
        required: true
    }
}, {
    timestamps: true
})