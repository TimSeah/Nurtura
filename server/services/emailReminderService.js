const emailjs = require('@emailjs/nodejs');
const cron = require('node-cron');
const moment = require('moment');
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');

// EmailJS configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY
};

// Initialize EmailJS
if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PRIVATE_KEY) {
  emailjs.init({
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
    privateKey: EMAILJS_CONFIG.PRIVATE_KEY
  });
  console.log('EmailJS initialized successfully');
} else {
  console.warn('EmailJS configuration incomplete - reminders will not be sent');
}

// Function to send reminder emails
const sendReminderEmail = async (event, userEmail, userName) => {
  const templateParams = {
    reminder_message: 'This is a reminder that your appointment is scheduled to begin in 1 hour.',
    to_name: userName || 'Caregiver',
    appointment_date: moment(event.date).format('YYYY-MM-DD'),
    appointment_time: event.startTime,
    event_title: event.title,
    notes: event.remark || 'No additional notes',
    email: userEmail
  };

  try {
    if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID) {
      throw new Error('EmailJS configuration is incomplete');
    }

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
    
    console.log(`Reminder email sent successfully to ${userEmail}:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to send reminder email to ${userEmail}:`, error);
    return false;
  }
};

// Function to check for events needing reminders
const checkAndSendReminders = async () => {
  console.log('Checking for events requiring reminders...');
  
  try {
    const now = moment();
    
    // Find events that are scheduled for the next 60-65 minutes and haven't had reminders sent
    const events = await Event.find({
      reminderSent: false,
      enableReminder: true
    });

    for (const event of events) {
      // Combine date and time to create event datetime
      const eventDateTime = moment(`${moment(event.date).format('YYYY-MM-DD')} ${event.startTime}`, 'YYYY-MM-DD HH:mm');
      
      // Calculate time difference in minutes
      const timeDifference = eventDateTime.diff(now, 'minutes');
      
      // Send reminder if event is in 60 minutes (with 5-minute window for cron timing)
      if (timeDifference <= 60 && timeDifference > 55) {
        console.log(`Sending reminder for event ${event._id}: ${event.title}`);
        
        // Get user settings to find email
        const userSettings = await UserSettings.findOne({ userId: event.userId });
        
        if (userSettings && userSettings.notifications.appointmentReminders && userSettings.profile.email) {
          const emailSent = await sendReminderEmail(
            event, 
            userSettings.profile.email, 
            userSettings.profile.name
          );
          
          if (emailSent) {
            // Mark reminder as sent
            event.reminderSent = true;
            event.reminderEmail = userSettings.profile.email;
            await event.save();
            console.log(`Reminder sent for event ${event._id}`);
          }
        } else {
          console.log(`Skipping reminder for event ${event._id} - no email or reminders disabled`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking for reminders:', error);
  }
};

// Start the cron job to check for reminders every 5 minutes
const startReminderService = () => {
  console.log('Starting email reminder service...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', checkAndSendReminders);
  
  // Also check immediately when service starts (for testing)
  setTimeout(checkAndSendReminders, 5000);
};

// Manual trigger for testing
const triggerReminderForEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    const userSettings = await UserSettings.findOne({ userId: event.userId });
    if (!userSettings || !userSettings.profile.email) {
      throw new Error('User email not found');
    }
    
    const emailSent = await sendReminderEmail(
      event, 
      userSettings.profile.email, 
      userSettings.profile.name
    );
    
    if (emailSent) {
      event.reminderSent = true;
      event.reminderEmail = userSettings.profile.email;
      await event.save();
      return { success: true, message: 'Reminder sent successfully' };
    } else {
      return { success: false, message: 'Failed to send reminder' };
    }
  } catch (error) {
    console.error('Error triggering manual reminder:', error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  startReminderService,
  triggerReminderForEvent,
  checkAndSendReminders
};
