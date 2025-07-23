const request = require('supertest');
const express = require('express');
const eventsRouter = require('./events');
const Event = require('../models/Event');
const UserSettings = require('../models/UserSettings');
const { sendReminderEmail } = require('../services/emailReminderService');

// Mock dependencies
jest.mock('../models/Event');
jest.mock('../models/UserSettings');
jest.mock('../services/emailReminderService');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/events', eventsRouter);

describe('Events API - Email Reminder Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /:id/send-reminder', () => {
    const mockEvent = {
      _id: '650a1b2c3d4e5f6789012345',
      title: 'Doctor Appointment',
      date: '2023-07-25T00:00:00.000Z',
      startTime: '10:30',
      remark: 'Bring insurance card',
      userId: 'user123'
    };

    const mockUserSettings = {
      userId: 'user123',
      profile: {
        email: 'john.doe@example.com',
        name: 'John Doe'
      },
      notifications: {
        appointmentReminders: true
      }
    };

    test('sends test reminder successfully', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);
      sendReminderEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Test reminder sent successfully',
        email: 'john.doe@example.com'
      });

      expect(Event.findById).toHaveBeenCalledWith('650a1b2c3d4e5f6789012345');
      expect(UserSettings.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(sendReminderEmail).toHaveBeenCalledWith(
        mockEvent,
        'john.doe@example.com',
        'John Doe',
        true // isTest = true
      );
    });

    test('returns 404 when event not found', async () => {
      Event.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Event not found'
      });

      expect(sendReminderEmail).not.toHaveBeenCalled();
    });

    test('returns 400 when user has no email', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue({
        userId: 'user123',
        profile: {
          name: 'John Doe'
          // No email
        }
      });

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(400);

      expect(response.body).toEqual({
        message: 'No email found in user settings'
      });

      expect(sendReminderEmail).not.toHaveBeenCalled();
    });

    test('returns 400 when user settings not found', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(400);

      expect(response.body).toEqual({
        message: 'No email found in user settings'
      });

      expect(sendReminderEmail).not.toHaveBeenCalled();
    });

    test('returns 500 when email sending fails', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);
      sendReminderEmail.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to send test reminder'
      });
    });

    test('handles database errors', async () => {
      Event.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Error sending test reminder: Database connection failed'
      });
    });

    test('handles email service errors', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);
      sendReminderEmail.mockRejectedValue(new Error('SMTP configuration error'));

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Error sending test reminder');
    });

    test('handles invalid event ID format', async () => {
      const response = await request(app)
        .post('/api/events/invalid-id/send-reminder')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('works with minimal user settings', async () => {
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue({
        userId: 'user123',
        profile: {
          email: 'minimal@example.com'
          // No name provided
        }
      });
      sendReminderEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(sendReminderEmail).toHaveBeenCalledWith(
        mockEvent,
        'minimal@example.com',
        undefined, // name is undefined
        true
      );
    });

    test('sends reminder with all event data', async () => {
      const fullMockEvent = {
        ...mockEvent,
        location: 'Main Street Clinic',
        duration: '60',
        type: 'medical'
      };

      Event.findById = jest.fn().mockResolvedValue(fullMockEvent);
      UserSettings.findOne = jest.fn().mockResolvedValue(mockUserSettings);
      sendReminderEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/events/650a1b2c3d4e5f6789012345/send-reminder')
        .expect(200);

      expect(sendReminderEmail).toHaveBeenCalledWith(
        fullMockEvent,
        'john.doe@example.com',
        'John Doe',
        true
      );
    });
  });
});
