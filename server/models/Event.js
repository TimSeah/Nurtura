const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,     
    required: true,   
    trim: true        
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
  enableReminder: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderEmail: {
    type: String,
    default: ''
  }
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