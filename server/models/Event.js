const mongoose = require('mongoose');

// Define the schema for your Event model
// A schema defines the structure of the documents within a MongoDB collection,
// including field names, their data types, and validation rules.
const eventSchema = new mongoose.Schema({
  // Title of the event (e.g., "Meeting", "Doctor's Appointment")
  title: {
    type: String,     // Data type is String
    required: true,   // This field is mandatory
    trim: true        // Remove whitespace from both ends of the string
  },

  date: {
    type: Date,       // Data type is Date
    required: true    // This field is mandatory
  },

  startTime: {
    type: String,     // Data type is String
    required: true    // This field is mandatory
  },
  month: {
    type: String,
    required: true
  },
  remark: {
    type: String,     // Data type is String
    default: ''       // Default to an empty string if not provided
  },
  userId: {
    type: String,
    required: true
  },
}, {

  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

eventSchema.methods.getDay = function () {
  return this.date.getDate(); // returns 1–31
};

eventSchema.methods.getMonth = function () {
  return this.date.getMonth();
};

module.exports = Event;