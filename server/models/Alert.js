const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['medication', 'appointment', 'vital_alert', 'emergency', 'reminder', 'system']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
