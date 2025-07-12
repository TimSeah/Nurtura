// Backend server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const emailjs = require('@emailjs/nodejs');
const moment = require('moment');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));

// In-memory storage (replace with actual database)
let appointments = [];

// EmailJS configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY
};

// Initialize EmailJS
emailjs.init({
  publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
  privateKey: EMAILJS_CONFIG.PRIVATE_KEY
});

// API endpoint to create appointments
app.post('/api/appointments', (req, res) => {
  const { caregiverName, caregiverEmail, appointmentDate, appointmentTime, patientName, notes } = req.body;
  
  const appointment = {
    id: Date.now().toString(),
    caregiverName,
    caregiverEmail,
    appointmentDate,
    appointmentTime,
    patientName,
    notes,
    reminderSent: false,
    createdAt: new Date()
  };
  
  appointments.push(appointment);
  res.status(201).json({ message: 'Appointment created successfully', appointment });
});

// Function to send reminder emails
const sendReminderEmail = async (appointment) => {
  const templateParams = {
    reminder_message: 'This is a reminder that your appointment is scheduled to begin in 1 hour.',
    to_name: appointment.caregiverName,
    appointment_date: appointment.appointmentDate,
    appointment_time: appointment.appointmentTime,
    patient_name: appointment.patientName,
    notes: appointment.notes,
    email: appointment.caregiverEmail
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
    
    console.log(`Reminder email sent successfully to ${appointment.caregiverEmail}:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to send reminder email to ${appointment.caregiverEmail}:`, error);
    return false;
  }
};

// Cron job to check for appointments and send reminders
cron.schedule('*/5 * * * *', async () => {
  console.log('Checking for appointments requiring reminders...');
  
  const now = moment();
  
  for (const appointment of appointments) {
    if (appointment.reminderSent) continue;
    
    // Combine date and time to create appointment datetime
    const appointmentDateTime = moment(`${appointment.appointmentDate} ${appointment.appointmentTime}`, 'YYYY-MM-DD HH:mm');
    
    // Calculate time difference in minutes
    const timeDifference = appointmentDateTime.diff(now, 'minutes');
    
    // Send reminder if appointment is in 60 minutes (with 5-minute window for cron timing)
    if (timeDifference <= 60 && timeDifference > 55) {
      console.log(`Sending reminder for appointment ${appointment.id}`);
      
      const emailSent = await sendReminderEmail(appointment);
      
      if (emailSent) {
        // Mark reminder as sent
        appointment.reminderSent = true;
        console.log(`Reminder sent for appointment ${appointment.id}`);
      }
    }
  }
});

// API endpoint to get all appointments (for testing)
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// API endpoint to manually trigger reminder (for testing)
app.post('/api/appointments/:id/send-reminder', async (req, res) => {
  const appointment = appointments.find(apt => apt.id === req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  
  const emailSent = await sendReminderEmail(appointment);
  
  if (emailSent) {
    appointment.reminderSent = true;
    res.json({ message: 'Reminder sent successfully' });
  } else {
    res.status(500).json({ message: 'Failed to send reminder' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Email reminder system started');
  console.log('Frontend should run on http://localhost:3000');
});
