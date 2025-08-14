const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  direction: { type: String, enum: ['up', 'down'], required: true } // removed cancel inside
}, { _id: false });

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
    votes:    [voteSchema] // <-- holds { userId, direction }
  
}, { 
    timestamps: true
})

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);
module.exports = Thread;