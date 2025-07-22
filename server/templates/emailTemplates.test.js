const emailTemplates = require('./emailTemplates');
const moment = require('moment');

describe('Email Templates', () => {
  const mockEvent = {
    title: 'Doctor Appointment',
    date: '2023-07-25T00:00:00.000Z',
    startTime: '10:30',
    remark: 'Bring insurance card and medical history'
  };

  const mockUserName = 'John Doe';
  const mockServiceName = 'Test Care Management';

  beforeEach(() => {
    // Mock moment to have consistent date formatting
    jest.spyOn(moment.prototype, 'format').mockImplementation(function(format) {
      if (format === 'dddd, MMMM Do, YYYY') {
        return 'Tuesday, July 25th, 2023';
      }
      return this.constructor.prototype.format.call(this, format);
    });
  });

  afterEach(() => {
    moment.prototype.format.mockRestore();
  });

  describe('appointmentReminder', () => {
    test('generates correct appointment reminder template', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.subject).toBe('Reminder: Doctor Appointment in 1 hour');
      expect(template.html).toContain('🔔 Appointment Reminder');
      expect(template.html).toContain('Dear John Doe,');
      expect(template.html).toContain('Doctor Appointment');
      expect(template.html).toContain('Tuesday, July 25th, 2023');
      expect(template.html).toContain('10:30');
      expect(template.html).toContain('Bring insurance card and medical history');
      expect(template.html).toContain('Test Care Management');
    });

    test('handles missing user name', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, null, mockServiceName);

      expect(template.html).toContain('Dear Caregiver,');
    });

    test('handles missing event remark', () => {
      const eventWithoutRemark = {
        ...mockEvent,
        remark: null
      };

      const template = emailTemplates.appointmentReminder(eventWithoutRemark, mockUserName, mockServiceName);

      expect(template.html).not.toContain('📝 Notes:');
    });

    test('uses default service name when not provided', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName);

      expect(template.html).toContain('Nurtura Care Management');
    });

    test('includes proper HTML structure', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName, mockServiceName);

      // Check for proper HTML structure
      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('<html>');
      expect(template.html).toContain('<head>');
      expect(template.html).toContain('<body>');
      expect(template.html).toContain('</html>');
      
      // Check for CSS classes
      expect(template.html).toContain('class="container"');
      expect(template.html).toContain('class="header"');
      expect(template.html).toContain('class="content"');
      expect(template.html).toContain('class="event-details"');
      expect(template.html).toContain('class="footer"');
    });

    test('includes responsive meta tags', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.html).toContain('<meta charset="utf-8">');
      expect(template.html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    });
  });

  describe('testReminder', () => {
    test('generates correct test reminder template', () => {
      const template = emailTemplates.testReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.subject).toBe('[TEST] Reminder: Doctor Appointment in 1 hour');
      expect(template.html).toContain('🧪 Test Reminder');
      expect(template.html).toContain('This is a <strong>test reminder</strong>');
      expect(template.html).not.toContain('🔔 Appointment Reminder');
      expect(template.html).not.toContain('in <strong>1 hour</strong>');
    });

    test('preserves all other content from appointment reminder', () => {
      const template = emailTemplates.testReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.html).toContain('Dear John Doe,');
      expect(template.html).toContain('Doctor Appointment');
      expect(template.html).toContain('Tuesday, July 25th, 2023');
      expect(template.html).toContain('10:30');
      expect(template.html).toContain('Bring insurance card and medical history');
      expect(template.html).toContain('Test Care Management');
    });

    test('maintains HTML structure and styling', () => {
      const template = emailTemplates.testReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.html).toContain('class="container"');
      expect(template.html).toContain('class="header"');
      expect(template.html).toContain('class="content"');
      expect(template.html).toContain('class="event-details"');
    });
  });

  describe('template styling', () => {
    test('includes proper CSS styles', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName, mockServiceName);

      // Check for key CSS properties
      expect(template.html).toContain('font-family: Arial, sans-serif');
      expect(template.html).toContain('background-color: #4CAF50');
      expect(template.html).toContain('max-width: 600px');
      expect(template.html).toContain('border-radius:');
    });

    test('includes accessibility and mobile-friendly styles', () => {
      const template = emailTemplates.appointmentReminder(mockEvent, mockUserName, mockServiceName);

      expect(template.html).toContain('line-height: 1.6');
      expect(template.html).toContain('text-align: center');
    });
  });

  describe('edge cases', () => {
    test('handles empty event object', () => {
      const emptyEvent = {
        title: '',
        date: '',
        startTime: '',
        remark: ''
      };

      const template = emailTemplates.appointmentReminder(emptyEvent, mockUserName, mockServiceName);

      expect(template.subject).toBe('Reminder:  in 1 hour');
      expect(template.html).toContain('Dear John Doe,');
    });

    test('handles special characters in event data', () => {
      const specialEvent = {
        title: 'Dr. Smith\'s & Johnson "Special" Appointment',
        date: '2023-07-25T00:00:00.000Z',
        startTime: '10:30',
        remark: 'Bring <documents> & "insurance" info'
      };

      const template = emailTemplates.appointmentReminder(specialEvent, mockUserName, mockServiceName);

      expect(template.html).toContain('Dr. Smith\'s & Johnson "Special" Appointment');
      expect(template.html).toContain('Bring <documents> & "insurance" info');
    });

    test('handles very long event titles and remarks', () => {
      const longEvent = {
        title: 'Very Long Appointment Title That Might Cause Issues With Email Formatting And Layout',
        date: '2023-07-25T00:00:00.000Z',
        startTime: '10:30',
        remark: 'This is a very long remark that contains a lot of information about the appointment including special instructions, preparation requirements, and other important details that the patient needs to know before arriving.'
      };

      const template = emailTemplates.appointmentReminder(longEvent, mockUserName, mockServiceName);

      expect(template.html).toContain(longEvent.title);
      expect(template.html).toContain(longEvent.remark);
    });
  });
});
