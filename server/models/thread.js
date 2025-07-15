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
    date:{
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        // ref: 'User',
        required: true
    },
}, {
    timestamps: true
})

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;