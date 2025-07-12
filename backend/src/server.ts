// Backend server.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as cron from 'node-cron';
import * as emailjs from '@emailjs/nodejs';
import moment from 'moment';

interface Appointment {
  id: string;
  caregiverName: string;
  caregiverEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  notes: string;
  reminderSent: boolean;
  createdAt: Date;
}

interface EmailJSConfig {
  SERVICE_ID: string | undefined;
  TEMPLATE_ID: string | undefined;
  PUBLIC_KEY: string | undefined;
  PRIVATE_KEY: string | undefined;
}

interface EmailTemplateParams extends Record<string, unknown> {
  reminder_message: string;
  to_name: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  notes: string;
  email: string;
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}));

// In-memory storage (replace with actual database)
let appointments: Appointment[] = [];

// EmailJS configuration with validation
const EMAILJS_CONFIG: EmailJSConfig = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY
};

// Validate required environment variables
const requiredEnvVars = ['EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_PRIVATE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all EmailJS configuration variables are set.');
  process.exit(1);
}

// Initialize EmailJS
if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PRIVATE_KEY) {
  emailjs.init({
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
    privateKey: EMAILJS_CONFIG.PRIVATE_KEY
  });
  console.log('EmailJS initialized successfully');
} else {
  console.error('Failed to initialize EmailJS: Missing public or private key');
  process.exit(1);
}

// API endpoint to create appointments
app.post('/api/appointments', (req: Request, res: Response) => {
  const { caregiverName, caregiverEmail, appointmentDate, appointmentTime, patientName, notes } = req.body;
  
  const appointment: Appointment = {
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
const sendReminderEmail = async (appointment: Appointment): Promise<boolean> => {
  const templateParams: EmailTemplateParams = {
    reminder_message: 'This is a reminder that your appointment is scheduled to begin in 1 hour.',
    to_name: appointment.caregiverName,
    appointment_date: appointment.appointmentDate,
    appointment_time: appointment.appointmentTime,
    patient_name: appointment.patientName,
    notes: appointment.notes,
    email: appointment.caregiverEmail
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
    
    console.log(`Reminder email sent successfully to ${appointment.caregiverEmail}:`, response);
    return true;
  } catch (error) {
    console.error(`Failed to send reminder email to ${appointment.caregiverEmail}:`, error);
    return false;
  }
};

// Cron job to check for appointments and send reminders
cron.schedule('*/5 * * * *', async (): Promise<void> => {
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
app.get('/api/appointments', (req: Request, res: Response) => {
  res.json(appointments);
});

// API endpoint to manually trigger reminder (for testing)
app.post('/api/appointments/:id/send-reminder', async (req: Request, res: Response) => {
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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Email reminder system started');
  console.log('Frontend should run on http://localhost:3000');
});
