const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    name: {
      type: String,
      default: 'Caregiver'
    },
    email: {
      type: String,
      //required: true  (removed true for now)
      default: ''
    }, 
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    emergencyContact: {
      type: String,
      default: ''
    }
  },
  notifications: {
    emailAlerts: {
      type: Boolean,
      default: true
    },
    smsAlerts: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    medicationReminders: {
      type: Boolean,
      default: true
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    healthAlerts: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    }
  },
  privacy: {
    shareDataWithFamily: {
      type: Boolean,
      default: true
    },
    shareDataWithProviders: {
      type: Boolean,
      default: true
    },
    dataRetention: {
      type: String,
      default: '2years'
    },
    allowAnalytics: {
      type: Boolean,
      default: false
    }
  },
  appearance: {
    theme: {
      type: String,
      default: 'light'
    },
    fontSize: {
      type: String,
      default: 'medium'
    },
    language: {
      type: String,
      default: 'english'
    }
  }
}, {
  timestamps: true
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;
