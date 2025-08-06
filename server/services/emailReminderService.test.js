// Mock environment variables first
process.env.GMAIL_APP_PASSWORD = 'test-password';
process.env.GMAIL_USER = 'test@gmail.com';

// Mock nodemailer before requiring the service
const mockSendMail = jest.fn();
const mockTransporter = {
  sendMail: mockSendMail,
  verify: jest.fn((callback) => callback(null, true))
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter)
}));

// Mock other dependencies
jest.mock('node-cron');
jest.mock('../models/Event');
jest.mock('../models/UserSettings');
jest.mock('../templates/emailTemplates');

const nodemailer = require('nodemailer');
const { sendReminderEmail, checkAndSendReminders } = require('./emailReminderService');
const emailTemplates = require('../templates/emailTemplates');
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');
const moment = require('moment');

describe('Email Reminder Service', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'test_password';
    process.env.EMAIL_FROM_NAME = 'Test Nurtura';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.EMAIL_FROM_NAME;
  });

  describe('sendReminderEmail', () => {
    const mockEvent = {
      _id: '123',
      title: 'Doctor Appointment',
      date: '2023-07-25T00:00:00.000Z',
      startTime: '10:30',
      remark: 'Bring insurance card'
    };

    const mockUserEmail = 'user@example.com';
    const mockUserName = 'John Doe';

    beforeEach(() => {
      emailTemplates.appointmentReminder = jest.fn().mockReturnValue({
        subject: 'Reminder: Doctor Appointment in 1 hour',
        html: '<html><body>Test reminder email</body></html>'
      });

      emailTemplates.testReminder = jest.fn().mockReturnValue({
        subject: '[TEST] Reminder: Doctor Appointment in 1 hour',
        html: '<html><body>Test reminder email</body></html>'
      });
    });

    test('sends appointment reminder email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await sendReminderEmail(mockEvent, mockUserEmail, mockUserName);

      expect(result).toBe(true);
      expect(emailTemplates.appointmentReminder).toHaveBeenCalledWith(
        mockEvent,
        mockUserName,
        'Nurtura Care Management'
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Nurtura Care Management" <test@gmail.com>',
        to: mockUserEmail,
        subject: 'Reminder: Doctor Appointment in 1 hour',
        html: '<html><body>Test reminder email</body></html>'
      });
    });

    test('sends test reminder email successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await sendReminderEmail(mockEvent, mockUserEmail, mockUserName, true);

      expect(result).toBe(true);
      expect(emailTemplates.testReminder).toHaveBeenCalledWith(
        mockEvent,
        mockUserName,
        'Nurtura Care Management'
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Nurtura Care Management" <test@gmail.com>',
        to: mockUserEmail,
        subject: '[TEST] Reminder: Doctor Appointment in 1 hour',
        html: '<html><body>Test reminder email</body></html>'
      });
    });

    test('handles email sending failure', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const result = await sendReminderEmail(mockEvent, mockUserEmail, mockUserName);

      expect(result).toBe(false);
    });

    test('handles missing transporter configuration', async () => {
      // Temporarily remove the transporter
      const originalCreateTransport = nodemailer.createTransport;
      nodemailer.createTransport = jest.fn().mockReturnValue(null);

      const result = await sendReminderEmail(mockEvent, mockUserEmail, mockUserName);

      expect(result).toBe(false);
      
      // Restore original transporter
      nodemailer.createTransport = originalCreateTransport;
    });
  });

  describe('checkAndSendReminders', () => {
    test('correctly identifies events within reminder window', async () => {
      // Create events that are actually within the reminder window (55-60 minutes from now)
      const now = moment();
      const eventInWindow = now.clone().add(58, 'minutes');
      const eventOutsideWindow = now.clone().add(90, 'minutes');
      
      const mockEvents = [
        {
          _id: '1',
          title: 'Doctor Appointment',
          date: eventInWindow.format('YYYY-MM-DD'),
          startTime: eventInWindow.format('HH:mm'),
          userId: 'user1',
          reminderSent: false,
          enableReminder: true,
          save: jest.fn().mockResolvedValue()
        },
        {
          _id: '2', 
          title: 'Dentist Appointment',
          date: eventOutsideWindow.format('YYYY-MM-DD'),
          startTime: eventOutsideWindow.format('HH:mm'),
          userId: 'user1',
          reminderSent: false,
          enableReminder: true,
          save: jest.fn().mockResolvedValue()
        }
      ];

      const mockUserSettings = {
        userId: 'user1',
        notifications: { appointmentReminders: true },
        profile: { email: 'user@example.com', name: 'John Doe' }
      };

      Event.find = jest.fn().mockResolvedValue(mockEvents);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await checkAndSendReminders();

      // Verify that the function queries for events correctly
      expect(Event.find).toHaveBeenCalledWith({
        reminderSent: false,
        enableReminder: true
      });
      
      // UserSettings should be queried for the event within the window
      expect(UserSettings.findOne).toHaveBeenCalledWith({ userId: 'user1' });
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockEvents[0].save).toHaveBeenCalled();
      expect(mockEvents[1].save).not.toHaveBeenCalled();
    });

    test('skips events with notifications disabled', async () => {
      const mockEvents = [{
        _id: '1',
        title: 'Doctor Appointment',
        date: '2023-07-25T00:00:00.000Z',
        startTime: '10:00',
        userId: 'user1',
        reminderSent: false,
        enableReminder: true,
        save: jest.fn().mockResolvedValue()
      }];

      const mockUserSettings = {
        userId: 'user1',
        notifications: { appointmentReminders: false }, // Disabled
        profile: { email: 'user@example.com', name: 'John Doe' }
      };

      Event.find = jest.fn().mockResolvedValue(mockEvents);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);

      await checkAndSendReminders();

      expect(mockEvents[0].save).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test('skips events without user email', async () => {
      const mockEvents = [{
        _id: '1',
        title: 'Doctor Appointment',
        date: '2023-07-25T00:00:00.000Z',
        startTime: '10:00',
        userId: 'user1',
        reminderSent: false,
        enableReminder: true,
        save: jest.fn().mockResolvedValue()
      }];

      const mockUserSettings = {
        userId: 'user1',
        notifications: { appointmentReminders: true },
        profile: { name: 'John Doe' } // No email
      };

      Event.find = jest.fn().mockResolvedValue(mockEvents);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);

      await checkAndSendReminders();

      expect(mockEvents[0].save).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test('handles database errors gracefully', async () => {
      Event.find = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // Should not throw, just log error
      await expect(checkAndSendReminders()).resolves.not.toThrow();
    });
  });
});
