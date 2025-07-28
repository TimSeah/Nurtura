const mongoose = require('mongoose');

const careRecipientSchema = new mongoose.Schema({

  /*userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, */

  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  medicalConditions: [{
    type: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    notes: String
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  caregiverNotes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CareRecipient', careRecipientSchema);
