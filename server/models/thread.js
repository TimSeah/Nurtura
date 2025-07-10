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
    },
    upvotes: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
})

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;