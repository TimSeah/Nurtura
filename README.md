# Nurtura Care Management System

A comprehensive care management application with automated email reminders for appointments and events.

## 🎯 Features

- 📅 Calendar management for appointments and events
- 📧 Automated email reminders (1 hour before appointments)
- 🧪 Test reminder functionality
- ⚙️ User settings and preferences
- 🔧 Configurable email service
- 💊 Medication tracking
- 👥 Community forum and discussions

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Gmail account with App Password enabled

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Nurtura

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   # MongoDB Connection
   MONGO_URI=your_mongodb_connection_string
   
   # Server Configuration
   PORT=5000
   
   # Gmail Configuration
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   
   # Email Service Configuration
   EMAIL_FROM_NAME=Your Service Name
   EMAIL_FROM_ADDRESS=your-email@gmail.com
   ```

### 3. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to Security > App passwords
4. Generate a new app password for "Mail"
5. Use the 16-character password in your `.env` file

### 4. Start the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd .. # Go back to root directory
   npm run dev
   ```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📧 Email Reminder System

The application includes an automated email reminder service that:

- **Checks every 5 minutes** for upcoming appointments
- **Sends reminders 1 hour before** the scheduled time
- **Prevents duplicate emails** using tracking system
- **Uses professional HTML templates** with responsive design

### Email Template Configuration

Email templates are stored in `server/templates/emailTemplates.js` and include:
- Professional HTML styling
- Responsive design
- Customizable service name
- Appointment details and instructions

### Testing Email Functionality

Use the "Send Test Reminder" button in the application to verify your email configuration is working correctly.

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** with TypeScript
- **Vite 6.3.5** for fast development
- **CSS3** with modern styling
- **Responsive design** for all devices

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **Nodemailer** for email delivery
- **Gmail SMTP** integration
- **Cron jobs** for automated reminders

## 📁 Project Structure

```
Nurtura/
├── README.md
├── package.json                 # Frontend dependencies
├── src/                        # React application
│   ├── App.tsx
│   ├── components/
│   ├── config/
│   └── types/
└── server/                     # Backend application
    ├── package.json
    ├── server.js              # Entry point
    ├── .env                   # Environment variables (not in git)
    ├── .env.example           # Environment template
    ├── src/
    │   └── server.ts          # TypeScript server code
    ├── services/
    │   └── emailReminderService.js
    └── templates/
        └── emailTemplates.js
```

## � Development

### Available Scripts

**Frontend (root directory):**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend (server directory):**
```bash
npm start        # Start production server
npm run dev      # Start with nodemon (development)
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/nurtura` |
| `PORT` | Server port | `5000` |
| `GMAIL_USER` | Gmail account for sending emails | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 characters) | `abcd efgh ijkl mnop` |
| `EMAIL_FROM_NAME` | Display name for emails | `Nurtura Care System` |
| `EMAIL_FROM_ADDRESS` | From email address | `your-email@gmail.com` |

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid login" error with Gmail**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check Gmail security settings

2. **MongoDB connection issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database exists

3. **Email reminders not sending**
   - Check server logs for errors
   - Verify cron job is running
   - Test email configuration with test button

### Server Logs

Check the server console for detailed error messages and email delivery status.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review server logs for error details
- Ensure all environment variables are properly configured
