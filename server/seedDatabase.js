// Seed script to populate the database with sample data
const mongoose = require('mongoose');
const CareRecipient = require('./models/CareRecipient');
const VitalSigns = require('./models/VitalSigns');
const Alert = require('./models/Alert');
require('dotenv').config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await CareRecipient.deleteMany({});
    await VitalSigns.deleteMany({});
    await Alert.deleteMany({});
    console.log('Cleared existing data');

    // Create sample care recipients
    const careRecipients = await CareRecipient.insertMany([
      {
        name: 'Margaret Thompson',
        dateOfBirth: new Date('1935-03-15'),
        relationship: 'Mother',
        medicalConditions: ['Diabetes', 'Hypertension'],
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            startDate: new Date('2023-01-01'),
            notes: 'Take with meals'
          },
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: new Date('2023-01-01'),
            notes: 'Monitor blood pressure'
          }
        ],
        emergencyContacts: [
          {
            name: 'Dr. Smith',
            relationship: 'Primary Care Physician',
            phone: '555-0123',
            email: 'dr.smith@healthcare.com'
          }
        ],
        caregiverNotes: 'Requires assistance with medication reminders'
      },
      {
        name: 'Robert Johnson',
        dateOfBirth: new Date('1940-08-22'),
        relationship: 'Father',
        medicalConditions: ['Arthritis', 'High Cholesterol'],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '200mg',
            frequency: 'As needed',
            startDate: new Date('2023-06-01'),
            notes: 'For joint pain'
          }
        ],
        emergencyContacts: [
          {
            name: 'Dr. Williams',
            relationship: 'Rheumatologist',
            phone: '555-0456',
            email: 'dr.williams@healthcare.com'
          }
        ],
        caregiverNotes: 'Independent but needs help with heavy lifting'
      }
    ]);

    console.log('Created care recipients:', careRecipients.length);

    // Create sample vital signs
    const now = new Date();
    const vitalSigns = [];
    
    // Generate some sample data for the past week
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      vitalSigns.push(
        {
          recipientId: careRecipients[0]._id,
          vitalType: 'blood_pressure',
          value: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
          unit: 'mmHg',
          dateTime: date,
          notes: 'Morning reading'
        },
        {
          recipientId: careRecipients[0]._id,
          vitalType: 'blood_sugar',
          value: (90 + Math.floor(Math.random() * 30)).toString(),
          unit: 'mg/dL',
          dateTime: date,
          notes: 'Fasting glucose'
        },
        {
          recipientId: careRecipients[1]._id,
          vitalType: 'weight',
          value: (180 + Math.floor(Math.random() * 5)).toString(),
          unit: 'lbs',
          dateTime: date,
          notes: 'Weekly weigh-in'
        }
      );
    }

    await VitalSigns.insertMany(vitalSigns);
    console.log('Created vital signs:', vitalSigns.length);

    // Create sample alerts
    const alerts = await Alert.insertMany([
      {
        recipientId: careRecipients[0]._id,
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Time to take Metformin - evening dose',
        priority: 'medium',
        isRead: false,
        actionRequired: true,
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      },
      {
        recipientId: careRecipients[0]._id,
        type: 'vital_alert',
        title: 'Blood Pressure Alert',
        message: 'Recent reading was higher than normal (145/90)',
        priority: 'high',
        isRead: false,
        actionRequired: true
      },
      {
        recipientId: careRecipients[1]._id,
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Rheumatology appointment tomorrow at 2:00 PM',
        priority: 'medium',
        isRead: true,
        actionRequired: false,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        recipientId: careRecipients[0]._id,
        type: 'system',
        title: 'Welcome to Nurtura',
        message: 'Your care management system is now set up and ready to use',
        priority: 'low',
        isRead: true,
        actionRequired: false
      }
    ]);

    console.log('Created alerts:', alerts.length);
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
