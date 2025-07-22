const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment');
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');
const emailTemplates = require('../templates/emailTemplates');

// Email configuration from environment variables
const EMAIL_CONFIG = {
  user: process.env.GMAIL_USER || process.env.EMAIL_FROM_ADDRESS || 'caregiverreminder@gmail.com',
  password: process.env.GMAIL_APP_PASSWORD,
  fromName: process.env.EMAIL_FROM_NAME || 'Nurtura Care Management',
  fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER || 'caregiverreminder@gmail.com'
};

// Create Nodemailer transporter
let transporter = null;

if (EMAIL_CONFIG.password && EMAIL_CONFIG.password !== 'your_gmail_app_password_here') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password
    }
  });

  // Test email configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
    } else {
      console.log(`✅ Email service ready (${EMAIL_CONFIG.fromAddress})`);
    }
  });
} else {
  console.warn('⚠️  Gmail App Password not configured. Email reminders disabled.');
  console.warn('   Please set GMAIL_APP_PASSWORD in .env file');
}

// Function to send reminder emails
const sendReminderEmail = async (event, userEmail, userName, isTest = false) => {
  if (!transporter) {
    console.error('❌ Email transporter not configured');
    return false;
  }

  try {
    const template = isTest 
      ? emailTemplates.testReminder(event, userName, EMAIL_CONFIG.fromName)
      : emailTemplates.appointmentReminder(event, userName, EMAIL_CONFIG.fromName);

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromAddress}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${userEmail}:`, error.message);
    return false;
  }
};

// Function to check for events needing reminders
const checkAndSendReminders = async () => {
  try {
    const now = moment();
    const events = await Event.find({
      reminderSent: false,
      enableReminder: true
    });

    for (const event of events) {
      const eventDateTime = moment(`${moment(event.date).format('YYYY-MM-DD')} ${event.startTime}`, 'YYYY-MM-DD HH:mm');
      const timeDifference = eventDateTime.diff(now, 'minutes');
      
      // Send reminder if event is in 55-60 minutes (5-minute window for cron timing)
      if (timeDifference <= 60 && timeDifference > 55) {
        const userSettings = await UserSettings.findOne({ userId: event.userId });
        
        if (userSettings?.notifications?.appointmentReminders && userSettings?.profile?.email) {
          const emailSent = await sendReminderEmail(
            event, 
            userSettings.profile.email, 
            userSettings.profile.name
          );
          
          if (emailSent) {
            event.reminderSent = true;
            event.reminderEmail = userSettings.profile.email;
            await event.save();
            console.log(`✅ Reminder sent for: ${event.title}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error.message);
  }
};

// Start the cron job to check for reminders every 5 minutes
const startReminderService = () => {
  console.log('🚀 Email reminder service started (checks every 5 minutes)');
  cron.schedule('*/5 * * * *', checkAndSendReminders);
  
  // Initial check after 5 seconds (for testing)
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
    if (!userSettings?.profile?.email) {
      throw new Error('User email not found');
    }
    
    const emailSent = await sendReminderEmail(
      event, 
      userSettings.profile.email, 
      userSettings.profile.name,
      true // isTest = true
    );
    
    if (emailSent) {
      return { success: true, message: 'Test reminder sent successfully' };
    } else {
      return { success: false, message: 'Failed to send test reminder' };
    }
  } catch (error) {
    console.error('❌ Error sending test reminder:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  startReminderService,
  triggerReminderForEvent,
  checkAndSendReminders,
  sendReminderEmail
};
