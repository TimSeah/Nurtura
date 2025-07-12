import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs-config';
import { ApiResponse, EmailJSResponse } from '../types/api';
import './AppointmentBooking.css';

interface Appointment {
  caregiverName: string;
  caregiverEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  notes: string;
}

interface Status {
  message: string;
  type: 'success' | 'error' | '';
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

const AppointmentBooking: React.FC = () => {
  const [appointment, setAppointment] = useState<Appointment>({
    caregiverName: '',
    caregiverEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    patientName: '',
    notes: ''
  });

  const [status, setStatus] = useState<Status>({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', type: '' });

    try {
      console.log('Submitting appointment:', appointment);

      // First, save appointment to backend
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const result: ApiResponse = await response.json();
        console.log('Appointment saved successfully:', result);

        // Send immediate confirmation email
        try {
          await sendConfirmationEmail();
          setStatus({
            message: 'Appointment booked successfully! Confirmation email sent.',
            type: 'success'
          });
        } catch (emailError: any) {
          console.error('Email sending failed:', emailError);
          setStatus({
            message: 'Appointment saved, but email failed to send. Error: ' + emailError.message,
            type: 'error'
          });
        }
        resetForm();
      } else {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      setStatus({
        message: `Failed to book appointment: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendConfirmationEmail = async (): Promise<EmailJSResponse> => {
    console.log('Attempting to send email with config:', EMAILJS_CONFIG);

    const templateParams: EmailTemplateParams = {
      reminder_message: `Your appointment has been successfully scheduled. Thank you for booking with us!`,
      to_name: appointment.caregiverName,
      appointment_date: appointment.appointmentDate,
      appointment_time: appointment.appointmentTime,
      patient_name: appointment.patientName,
      notes: appointment.notes || 'No additional notes',
      email: appointment.caregiverEmail
    };

    console.log('Email template params:', templateParams);

    try {
      const result: EmailJSResponse = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      console.log('Confirmation email sent successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to send confirmation email:', error);
      console.error('Error details:', error.text || error.message);
      throw new Error(`Email failed: ${error.text || error.message}`);
    }
  };

  // Test EmailJS configuration function
  const testEmailJS = async (): Promise<void> => {
    console.log('Testing EmailJS with current config...');

    const testParams: EmailTemplateParams = {
      reminder_message: 'This is a test appointment confirmation email.',
      to_name: 'Test User',
      appointment_date: '2025-07-10',
      appointment_time: '15:00',
      patient_name: 'Test Patient',
      notes: 'This is a test email',
      email: 'test@example.com'
    };

    try {
      const result: EmailJSResponse = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        testParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      console.log('✅ EmailJS test successful:', result);
      setStatus({
        message: 'EmailJS test successful! Check your email.',
        type: 'success'
      });
    } catch (error: any) {
      console.error('❌ EmailJS test failed:', error);
      setStatus({
        message: `EmailJS test failed: ${error.text || error.message}`,
        type: 'error'
      });
    }
  };

  const resetForm = (): void => {
    setAppointment({
      caregiverName: '',
      caregiverEmail: '',
      appointmentDate: '',
      appointmentTime: '',
      patientName: '',
      notes: ''
    });
  };

  const handleInputChange = (field: keyof Appointment, value: string): void => {
    setAppointment((prev: Appointment) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="appointment-form">
      <h2>📅 Book Caregiver Appointment</h2>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* EmailJS Test Button */}
      <div className="test-section">
        <button
          type="button"
          onClick={testEmailJS}
          className="test-button"
        >
          🧪 Test EmailJS Configuration
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Caregiver Name:</label>
          <input
            type="text"
            value={appointment.caregiverName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('caregiverName', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Caregiver Email:</label>
          <input
            type="email"
            value={appointment.caregiverEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('caregiverEmail', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Appointment Date:</label>
          <input
            type="date"
            value={appointment.appointmentDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('appointmentDate', e.target.value)}
            required
            disabled={isSubmitting}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label>Appointment Time:</label>
          <input
            type="time"
            value={appointment.appointmentTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('appointmentTime', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Patient Name:</label>
          <input
            type="text"
            value={appointment.patientName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('patientName', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional):</label>
          <textarea
            value={appointment.notes}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
            placeholder="Any special instructions or notes..."
            disabled={isSubmitting}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? '📤 Booking...' : '📅 Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentBooking;
