const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: Number,
        default: 0
    },
  
}, { 
    timestamps: true
})

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);
module.exports = Thread;