const mongoose = require('mongoose');

const vitalSignsSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareRecipient',
    required: true
  },
  vitalType: {
    type: String,
    required: true,
    enum: ['blood_pressure', 'heart_rate', 'temperature', 'weight', 'blood_sugar', 'oxygen_saturation']
  },
  value: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VitalSigns', vitalSignsSchema);
