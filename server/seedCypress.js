// Comprehensive seed script for Cypress testing
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const CareRecipient = require('./models/CareRecipient');
const VitalSigns = require('./models/VitalSigns');
const Alert = require('./models/Alert');
const Event = require('./models/Event');
const Thread = require('./models/Thread');
const Comment = require('./models/Comment');
const Journal = require('./models/Journal');
const UserSettings = require('./models/UserSettings');
require('dotenv').config();

async function seedCypressData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await CareRecipient.deleteMany({});
    await VitalSigns.deleteMany({});
    await Alert.deleteMany({});
    await Event.deleteMany({});
    await Thread.deleteMany({});
    await Comment.deleteMany({});
    await Journal.deleteMany({});
    await UserSettings.deleteMany({});
    console.log('Cleared existing data');

    // Create Cypress test user
    const hashedPassword = await bcrypt.hash('Testing1234!', 10);
    const cypressUser = await User.create({
      username: 'Cypress',
      passwordHash: hashedPassword
    });
    console.log('✅ Created Cypress user:', cypressUser._id);

    // Create user settings for Cypress user
    await UserSettings.create({
      userId: cypressUser._id.toString(),
      profile: {
        name: 'Cypress Tester',
        email: 'cypress@test.com',
        phone: '555-0123',
        address: '123 Test Street, Test City',
        emergencyContact: 'Emergency Contact: 911'
      },
      notifications: {
        emailAlerts: true,
        medicationReminders: true,
        appointmentReminders: true,
        healthAlerts: true
      }
    });

    // Create sample care recipients (Patients)
    const careRecipients = await CareRecipient.insertMany([
      {
        userId: cypressUser._id,
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
        userId: cypressUser._id,
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
          },
          {
            name: 'Panadol',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            startDate: new Date('2024-01-01'),
            notes: 'Maximum 8 tablets in 24 hours'
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

    console.log('✅ Created care recipients:', careRecipients.length);

    // Create sample calendar events
    const events = await Event.insertMany([
      {
        title: 'Doctor Appointment - Dr. Smith',
        date: new Date('2025-08-15'),
        startTime: '10:00',
        month: 'August',
        remark: 'Regular checkup for Margaret',
        userId: cypressUser._id.toString(),
        enableReminder: true,
        reminderEmail: 'cypress@test.com'
      },
      {
        title: 'Medication Refill - Pharmacy',
        date: new Date('2025-08-12'),
        startTime: '14:00',
        month: 'August',
        remark: 'Pick up Metformin prescription',
        userId: cypressUser._id.toString(),
        enableReminder: true,
        reminderEmail: 'cypress@test.com'
      },
      {
        title: 'Physical Therapy Session',
        date: new Date('2025-08-20'),
        startTime: '11:30',
        month: 'August',
        remark: 'Robert\'s weekly PT session',
        userId: cypressUser._id.toString(),
        enableReminder: false
      },
      {
        title: 'Blood Test',
        date: new Date('2025-08-25'),
        startTime: '09:00',
        month: 'August',
        remark: 'Quarterly blood work for diabetes monitoring',
        userId: cypressUser._id.toString(),
        enableReminder: true,
        reminderEmail: 'cypress@test.com'
      },
      {
        title: 'Status Test Event',
        date: new Date('2025-08-10'),
        startTime: '11:00',
        month: 'August',
        remark: 'Testing reminder status',
        userId: cypressUser._id.toString(),
        enableReminder: true,
        reminderEmail: 'cypress@test.com'
      }
    ]);

    console.log('✅ Created events:', events.length);

    // Create sample vital signs/health tracking data
    const now = new Date();
    const vitalSigns = [];
    
    // Generate vital signs for the past 2 weeks
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Blood pressure readings for Margaret
      vitalSigns.push({
        recipientId: careRecipients[0]._id,
        vitalType: 'blood_pressure',
        value: `${130 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 15)}`,
        unit: 'mmHg',
        dateTime: date,
        notes: i === 0 ? 'Latest reading' : ''
      });

      // Heart rate readings
      vitalSigns.push({
        recipientId: careRecipients[0]._id,
        vitalType: 'heart_rate',
        value: (72 + Math.floor(Math.random() * 20)).toString(),
        unit: 'bpm',
        dateTime: date,
        notes: ''
      });

      // Weight readings for Robert
      if (i % 3 === 0) { // Every 3 days
        vitalSigns.push({
          recipientId: careRecipients[1]._id,
          vitalType: 'weight',
          value: (175 + Math.floor(Math.random() * 5)).toString(),
          unit: 'lbs',
          dateTime: date,
          notes: 'Weekly weigh-in'
        });
      }

      // Blood sugar readings
      if (i % 2 === 0) { // Every other day
        vitalSigns.push({
          recipientId: careRecipients[0]._id,
          vitalType: 'blood_sugar',
          value: (90 + Math.floor(Math.random() * 30)).toString(),
          unit: 'mg/dL',
          dateTime: date,
          notes: 'Morning reading'
        });
      }

      // Temperature readings
      if (i % 4 === 0) { // Every 4 days
        vitalSigns.push({
          recipientId: careRecipients[0]._id,
          vitalType: 'temperature',
          value: (97.5 + Math.random() * 2).toFixed(1),
          unit: '°F',
          dateTime: date,
          notes: ''
        });
      }
    }

    await VitalSigns.insertMany(vitalSigns);
    console.log('✅ Created vital signs:', vitalSigns.length);

    // Create sample journal entries
    const journals = await Journal.insertMany([
      {
        userId: cypressUser._id.toString(),
        recipientId: careRecipients[0]._id.toString(),
        title: 'Morning Routine Update',
        description: 'Margaret had a good morning. Took medications on time and blood pressure was stable at 135/85. She seemed more energetic today and wanted to go for a short walk.',
        date: new Date('2025-08-09')
      },
      {
        userId: cypressUser._id.toString(),
        recipientId: careRecipients[1]._id.toString(),
        title: 'Physical Therapy Progress',
        description: 'Robert completed his PT exercises well today. His joint stiffness seems to be improving with the new routine. He managed 15 minutes of walking without significant discomfort.',
        date: new Date('2025-08-08')
      },
      {
        userId: cypressUser._id.toString(),
        recipientId: careRecipients[0]._id.toString(),
        title: 'Medication Side Effects',
        description: 'Noticed Margaret feeling a bit nauseous after taking Metformin this morning. Made sure she took it with food as recommended. Will monitor for the next few days.',
        date: new Date('2025-08-07')
      },
      {
        userId: cypressUser._id.toString(),
        recipientId: careRecipients[1]._id.toString(),
        title: 'Diet and Appetite',
        description: 'Robert\'s appetite has been good this week. He\'s been eating more vegetables and seems to enjoy the new meal plan. Weight is stable.',
        date: new Date('2025-08-06')
      },
      {
        userId: cypressUser._id.toString(),
        recipientId: careRecipients[0]._id.toString(),
        title: 'Sleep Patterns',
        description: 'Margaret has been sleeping better since adjusting her evening medication schedule. She\'s getting about 7 hours of sleep consistently.',
        date: new Date('2025-08-05')
      }
    ]);

    console.log('✅ Created journals:', journals.length);

    // Create sample forum threads with specific IDs for testing
    const threads = await Thread.insertMany([
      {
        _id: new mongoose.Types.ObjectId('6898794d524574a7f2f74016'), // Fixed ID for test
        title: 'What is the maximum dosage for panadol?',
        content: 'I\'m caring for my Father who is 62yo, what is the max dosage of Panadol I can give to him in 24 hours?',
        author: 'Cypress',
        upvotes: 0,
        votes: []
      },
      {
        title: 'Managing diabetes medication schedules',
        content: 'How do you keep track of multiple medications for diabetes? My mother takes Metformin twice daily and I sometimes forget if she\'s taken her evening dose.',
        author: 'Cypress',
        upvotes: 2,
        votes: [
          { userId: cypressUser._id, direction: 'up' }
        ]
      },
      {
        title: 'Blood pressure monitoring tips',
        content: 'Looking for advice on the best times to check blood pressure and how to keep accurate records.',
        author: 'HealthyCaregiver',
        upvotes: 1,
        votes: []
      },
      {
        title: 'Dealing with arthritis pain management',
        content: 'My father has arthritis and some days are worse than others. What are some non-medication strategies that have worked for you?',
        author: 'Cypress',
        upvotes: 0,
        votes: []
      }
    ]);

    console.log('✅ Created threads:', threads.length);

    // Create sample comments for the threads
    const comments = await Comment.insertMany([
      {
        threadId: threads[0]._id,
        content: 'Generally, the maximum dose for adults is 4000mg (8 tablets of 500mg) in 24 hours, but always consult with a doctor first.',
        author: 'MedicalAdviser',
        date: new Date('2025-08-09')
      },
      {
        threadId: threads[0]._id,
        content: 'My doctor told me the same thing. It\'s important not to exceed that limit as it can cause liver damage.',
        author: 'ConcernedCaregiver',
        date: new Date('2025-08-08')
      },
      {
        threadId: threads[1]._id,
        content: 'I use a pill organizer for my dad. It has compartments for each day and time, which makes it much easier to track.',
        author: 'CaringDaughter',
        date: new Date('2025-08-08')
      },
      {
        threadId: threads[1]._id,
        content: 'Smartphone apps can be really helpful for medication reminders. I use one that sends alerts for each dose.',
        author: 'TechSavvyCaregiver',
        date: new Date('2025-08-07')
      },
      {
        threadId: threads[2]._id,
        content: 'I check my mom\'s BP twice daily - once in the morning and once in the evening. Consistency is key!',
        author: 'Cypress',
        date: new Date('2025-08-06')
      }
    ]);

    console.log('✅ Created comments:', comments.length);

    // Create sample alerts
    const alerts = await Alert.insertMany([
      {
        recipientId: careRecipients[0]._id.toString(),
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Time to take Metformin - evening dose',
        priority: 'medium',
        isRead: false,
        actionRequired: true,
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      },
      {
        recipientId: careRecipients[0]._id.toString(),
        type: 'vital_alert',
        title: 'Blood Pressure Alert',
        message: 'Recent reading was higher than normal (145/90)',
        priority: 'high',
        isRead: false,
        actionRequired: true
      },
      {
        recipientId: careRecipients[1]._id.toString(),
        type: 'appointment',
        title: 'Upcoming Appointment',
        message: 'Rheumatology appointment tomorrow at 2:00 PM',
        priority: 'medium',
        isRead: true,
        actionRequired: false,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        recipientId: careRecipients[0]._id.toString(),
        type: 'medication',
        title: 'Prescription Refill Due',
        message: 'Margaret\'s Lisinopril prescription needs to be refilled within 3 days',
        priority: 'medium',
        isRead: false,
        actionRequired: true,
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000) // 3 days from now
      },
      {
        recipientId: careRecipients[1]._id.toString(),
        type: 'reminder',
        title: 'Exercise Reminder',
        message: 'Robert\'s daily PT exercises - remember the knee stretches',
        priority: 'low',
        isRead: false,
        actionRequired: false
      }
    ]);

    console.log('✅ Created alerts:', alerts.length);

    console.log('\n🎉 Database seeded successfully with Cypress user data!');
    console.log('==========================================');
    console.log('📊 Summary:');
    console.log(`👤 Cypress User ID: ${cypressUser._id}`);
    console.log(`👥 Care Recipients: ${careRecipients.length} (${careRecipients.map(cr => cr.name).join(', ')})`);
    console.log(`📅 Calendar Events: ${events.length}`);
    console.log(`🩺 Health Readings: ${vitalSigns.length}`);
    console.log(`📝 Journal Entries: ${journals.length}`);
    console.log(`💬 Forum Threads: ${threads.length}`);
    console.log(`💭 Comments: ${comments.length}`);
    console.log(`🚨 Alerts: ${alerts.length}`);
    console.log('==========================================');
    console.log('🔑 Login Credentials: Cypress / Testing1234!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedCypressData();
}

module.exports = { seedCypressData };
