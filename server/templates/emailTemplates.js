const moment = require('moment');

const emailTemplates = {
  appointmentReminder: (event, userName, serviceName = 'Nurtura Care Management') => {
    return {
      subject: `Reminder: ${event.title} in 1 hour`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .event-details { background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .event-title { color: #4CAF50; margin-bottom: 15px; font-size: 1.2em; }
            .detail-row { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${userName || 'Caregiver'},</p>
              
              <p>This is a friendly reminder that your appointment is scheduled to begin in <strong>1 hour</strong>.</p>
              
              <div class="event-details">
                <h3 class="event-title">${event.title}</h3>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${moment(event.date).format('dddd, MMMM Do, YYYY')}
                </div>
                <div class="detail-row">
                  <span class="label">🕐 Time:</span> ${event.startTime}
                </div>
                ${event.remark ? `
                <div class="detail-row">
                  <span class="label">📝 Notes:</span> ${event.remark}
                </div>
                ` : ''}
              </div>
              
              <p>Please make sure you're prepared for your appointment. If you need to reschedule or have any questions, please contact us as soon as possible.</p>
              
              <div class="footer">
                <p>Best regards,<br><strong>${serviceName}</strong></p>
                <p><small>This is an automated reminder. Please do not reply to this email.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  testReminder: (event, userName, serviceName = 'Nurtura Care Management') => {
    const template = emailTemplates.appointmentReminder(event, userName, serviceName);
    return {
      subject: `[TEST] ${template.subject}`,
      html: template.html.replace(
        '<h1>🔔 Appointment Reminder</h1>',
        '<h1>🧪 Test Reminder</h1>'
      ).replace(
        'This is a friendly reminder that your appointment is scheduled to begin in <strong>1 hour</strong>.',
        'This is a <strong>test reminder</strong> for your upcoming appointment.'
      )
    };
  }
};

module.exports = emailTemplates;
