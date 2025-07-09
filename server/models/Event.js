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
  // Date of the event
  // Using the Date type will store a full JavaScript Date object,
  // which includes year, month, day, hour, minute, second, and millisecond.
  // MongoDB stores this as a BSON Date type.
  date: {
    type: Date,       // Data type is Date
    required: true    // This field is mandatory
  },
  // Start time of the event
  // We'll store this as a String (e.g., "09:00", "14:30") for simplicity,
  // matching the 'hour' field from your React frontend.
  // If you needed to perform time-based calculations or comparisons
  // that are independent of the date, you might consider a different approach
  // or storing it as part of the 'date' field itself and extracting the time.
  startTime: {
    type: String,     // Data type is String
    required: true    // This field is mandatory
  },
  // Optional remarks or notes about the event
  remark: {
    type: String,     // Data type is String
    default: ''       // Default to an empty string if not provided
  }
}, {
  // Schema options:
  // `timestamps: true` adds two fields: `createdAt` and `updatedAt`
  // Mongoose automatically manages these fields, recording when a document
  // was created and last updated. This is very useful for auditing.
  timestamps: true
});

// Create and export the Mongoose model
// The first argument 'Event' is the singular name of the collection.
// Mongoose will automatically pluralize this to 'events' for the collection name in MongoDB.
// The second argument is the schema we just defined.
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;