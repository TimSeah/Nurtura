const mongoose = require('mongoose');

const commmentSchema = new mongoose.Schema({
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commmentSchema);

module.exports = Comment;