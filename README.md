# Nurtura Care Management System

A comprehensive healthcare management platform that connects caregivers and care recipients through real-time monitoring, communication tools, and automated reminders. Built with modern web technologies for reliable, secure, and user-friendly care coordination.

## 🎯 Key Features

### 🏥 Health Monitoring & Vital Signs
- **Real-time vital signs tracking** (blood pressure, heart rate, temperature, weight, blood sugar, oxygen saturation)
- **Interactive health dashboard** with charts and trends analysis
- **Care recipient management** with multiple profile support
- **Health data visualization** and historical tracking
- **Alert system** for critical health readings

### 📅 Calendar & Appointment Management
- **Comprehensive calendar system** with event scheduling
- **Appointment booking and management**
- **Event categorization** with customizable remarks
- **📧 Automated email reminders** (1 hour before appointments)
- **Email reminder preferences** and configuration

### Full Docker Containerization
- **Multi-service architecture** with Docker Compose
- **nginx reverse proxy** for API routing and static file serving
- **Production-ready containers** with health checks
- **AWS deployment ready** (ECR, ECS, Load Balancer)
- **Environment-specific configurations**

### ⚡ CI/CD Pipeline
- **GitHub Actions workflows** for automated testing and deployment
- **Multi-stage testing** (lint, unit, integration, E2E, security)
- **Automated Docker builds** and ECR pushes
- **Infrastructure as Code** with automated AWS resource creation
- **Blue-green deployments** with health checks and rollback capability

### 👥 Community Forum & Communication  
- **Interactive discussion forum** with threading system
- **Real-time commenting** and thread management
- **User authentication** and profile management
- **Upvoting system** for community engagement
- **Threaded conversations** with reply chains

### 🚨 Alert & Notification System
- **Smart alert management** with priority levels
- **Multiple alert types**: medication, appointment, vital signs, emergency, reminders, system
- **Alert filtering** by status, priority, and type
- **Real-time notification delivery**

### 📝 Care Documentation
- **Digital care notes** and journal entries
- **Medication tracking** and management
- **Progress monitoring** and care history
- **Document organization** by care recipient

### 🔐 Security & Authentication
- **JWT-based authentication** with secure token management
- **User registration** with email validation
- **Protected routes** and role-based access
- **Session management** with cookie-based storage## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** database - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local installation  
- **Gmail account** with App Password enabled for email reminders
- **Git** for version control

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Nurtura

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create environment file in the server directory:

```bash
cd server
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/nurtura
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nurtura

# Server Configuration  
PORT=5000

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Gmail Configuration for Email Reminders
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Email Service Configuration
EMAIL_FROM_NAME=Nurtura Care System
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### 3. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to Security > App passwords
4. Generate a new app password for "Mail"
5. Use the 16-character password in your `.env` file

### 4. Start the Application

**Option 1: Development Mode (Recommended)**

1. Start the backend server with auto-reload:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server (in a new terminal):
   ```bash
   cd .. # Go back to root directory
   npm run dev
   ```

**Option 2: Production Mode**

1. Build and start the frontend:
   ```bash
   npm run build
   npm run preview
   ```

2. Start the backend server:
   ```bash
   cd server
   npm start
   ```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🚀 AWS Deployment

The application includes a complete CI/CD pipeline for AWS deployment:

### Prerequisites for AWS Deployment
- AWS account with appropriate permissions
- GitHub repository with Actions enabled
- AWS CLI configured locally (for initial setup)

### Setup AWS Deployment
1. **Configure GitHub Secrets**:
   ```bash
   # Add to repository secrets:
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   ```

2. **Store secrets in AWS Parameter Store**:
   ```bash
   aws ssm put-parameter --name "/nurtura/mongo-uri" --value "your-mongodb-uri" --type "SecureString"
   aws ssm put-parameter --name "/nurtura/jwt-secret" --value "your-jwt-secret" --type "SecureString"
   aws ssm put-parameter --name "/nurtura/gmail-user" --value "your-email@gmail.com" --type "SecureString"
   aws ssm put-parameter --name "/nurtura/gmail-app-password" --value "your-app-password" --type "SecureString"
   ```

3. **Create Infrastructure**:
   - Go to Actions tab in GitHub
   - Run "Create AWS Infrastructure" workflow
   - This creates ECR repositories, ECS cluster, VPC, Load Balancer, and IAM roles

4. **Deploy Application**:
   - Push to main branch triggers automatic deployment
   - Or manually run "Deploy to AWS ECS" workflow

### AWS Architecture
- **Amazon ECR**: Container registry for Docker images
- **Amazon ECS**: Container orchestration with Fargate
- **Application Load Balancer**: Traffic distribution and SSL termination
- **VPC**: Secure network with public/private subnets
- **CloudWatch**: Logging and monitoring
- **Parameter Store**: Secure configuration management

## 🧪 Testing

The application includes comprehensive testing across multiple layers:

### Unit Testing with Jest
Tests React components and UI logic:
```bash
npm test                    # Run all Jest tests
npm run test:watch         # Run Jest in watch mode
npm run test:coverage      # Generate coverage report
```

### Utility Testing with Vitest  
Tests utility functions and services:
```bash
npm run test:vitest        # Run Vitest tests
npm run test:vitest:watch  # Run Vitest in watch mode
```

### End-to-End Testing with Cypress
Tests complete user workflows:
```bash
npm run cypress:open       # Open Cypress test runner
npm run cypress:run        # Run Cypress tests headlessly
```

### Backend Testing
Server-side testing with Jest:
```bash
cd server
npm test                   # Run backend tests
```

### Test Coverage
- **Jest**: React components, authentication flows, UI interactions
- **Vitest**: Utility functions, data processing, API services
- **Cypress**: User registration, login, forum interactions, calendar management

## 🛠️ Tech Stack

### Frontend Architecture
- **React 19.1.0** with TypeScript for type-safe development
- **Vite 6.3.5** for lightning-fast development and building
- **React Router** for client-side routing and navigation
- **Lucide React** for consistent iconography
- **CSS3** with modern styling and responsive design
- **Context API** for state management (AuthContext)

### Backend Infrastructure  
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **JWT (jsonwebtoken)** for secure authentication
- **bcryptjs** for password hashing
- **cookie-parser** for session management
- **CORS** enabled for cross-origin requests

### Database Models
- **User Management**: Users, UserSettings, Authentication
- **Health Data**: VitalSigns, CareRecipient profiles
- **Calendar**: Events with reminder system
- **Communication**: Forum threads, Comments
- **Notifications**: Alert system with priority levels
- **Care Documentation**: Journal entries, Care notes

### Email & Automation
- **Nodemailer** with Gmail SMTP integration
- **Cron jobs** for automated appointment reminders
- **HTML email templates** with responsive design
- **Email tracking** to prevent duplicates

### Testing Framework
- **Jest** for React component unit testing
- **Vitest** for utility function testing  
- **Cypress** for end-to-end integration testing
- **Test coverage** across authentication, UI components, and user workflows

## 📁 Project Structure

```
Nurtura/
├── README.md
├── package.json                    # Frontend dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── cypress.config.ts               # Cypress E2E test configuration
├── jest.config.js                  # Jest testing configuration
├── vitest.config.ts                # Vitest testing configuration
│
├── src/                           # React Frontend Application
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── components/                # Reusable UI components
│   │   ├── Layout.tsx             # Main layout wrapper
│   │   ├── Modal.tsx              # Modal dialog component
│   │   ├── AlertCard.tsx          # Alert notification cards
│   │   ├── VitalSignsModal.tsx    # Health data input modal
│   │   └── AppointmentModal.tsx   # Appointment scheduling modal
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── pages/                     # Application pages/routes
│   │   ├── Login.tsx & Register.tsx    # Authentication pages
│   │   ├── dashboard/             # Health monitoring dashboard
│   │   ├── calendar/              # Appointment & event management
│   │   ├── forum/                 # Community discussion system
│   │   ├── healthMonitoring/      # Vital signs & care recipient management
│   │   ├── Alerts.tsx             # Alert management interface
│   │   ├── Settings.tsx           # User preferences
│   │   └── Resources.tsx          # Help & documentation
│   ├── services/
│   │   ├── apiService.ts          # API communication layer
│   │   └── dataService.ts         # Data processing utilities
│   ├── hooks/
│   │   └── useAlerts.ts           # Custom alert management hook
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── alertUtils.ts          # Alert processing utilities
│
├── server/                        # Node.js Backend Application
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Express server entry point
│   ├── .env                      # Environment variables (not in git)
│   ├── .env.example              # Environment template
│   ├── models/                   # MongoDB data models
│   │   ├── User.js               # User authentication model
│   │   ├── UserSettings.js       # User preferences model
│   │   ├── VitalSigns.js         # Health data model
│   │   ├── CareRecipient.js      # Care recipient profiles
│   │   ├── Event.js              # Calendar events model
│   │   ├── Alert.js              # Notification system model
│   │   ├── Journal.js            # Care documentation model
│   │   ├── thread.js             # Forum thread model
│   │   └── Comment.js            # Forum comment model
│   ├── routes/                   # API endpoint definitions
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── users.js              # User management API
│   │   ├── events.js             # Calendar management API
│   │   ├── vitalSigns.js         # Health data API
│   │   ├── careRecipients.js     # Care recipient API
│   │   ├── alerts.js             # Notification system API
│   │   ├── threads.js            # Forum thread API
│   │   ├── comment.js            # Forum comment API
│   │   └── journal.js            # Care documentation API
│   ├── services/
│   │   └── emailReminderService.js    # Automated email service
│   └── templates/
│       └── emailTemplates.js     # HTML email templates
│
├── tests/                        # Testing Suites
│   ├── jest/                     # Jest unit tests (React components)
│   │   ├── calendar.test.tsx
│   │   ├── Dashboard.test.tsx
│   │   └── emailReminder.test.tsx
│   └── vitest/                   # Vitest tests (utilities & services)
│       ├── Comment.test.tsx
│       ├── Forum.test.tsx
│       └── threadDetail.test.tsx
│
└── cypress/                      # End-to-End Testing
    ├── e2e/
    │   └── uc6_inputEventsToCalendar.cy.js
    └── support/
        ├── commands.ts
        └── e2e.ts
```

## 📧 Email Reminder System

The application includes a sophisticated automated email reminder service:

### Features
- **Automated scheduling**: Checks every 5 minutes for upcoming appointments
- **Smart timing**: Sends reminders 1 hour before scheduled appointments  
- **Duplicate prevention**: Advanced tracking system prevents multiple emails
- **Professional templates**: Responsive HTML email design
- **Customizable content**: Configurable service name and messaging

### Configuration
Email templates are located in `server/templates/emailTemplates.js` with:
- Professional HTML styling with responsive design
- Dynamic appointment details and personalized content
- Customizable branding and service information
- Error handling and delivery confirmation

### Testing & Validation
- Use the "Send Test Reminder" feature in the application
- Check server logs for email delivery status
- Verify Gmail App Password configuration
- Monitor cron job execution in development mode

## 💻 Development

### Available Scripts

**Frontend (root directory):**
```bash
npm run dev                # Start Vite development server (http://localhost:5173)
npm run build             # Build for production
npm run preview           # Preview production build
npm run lint              # Run ESLint for code quality
npm test                  # Run Jest unit tests
npm run test:watch        # Run Jest in watch mode  
npm run test:coverage     # Generate test coverage report
npm run test:vitest       # Run Vitest utility tests
npm run cypress:open      # Open Cypress E2E test runner
npm run cypress:run       # Run Cypress tests headlessly
```

**Backend (server directory):**
```bash
npm start                 # Start production server
npm run dev              # Start with nodemon (auto-reload)
npm test                 # Run Jest backend tests
npm run seed             # Seed database with sample data (if available)
```

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/nurtura` | ✅ |
| `PORT` | Server port number | `5000` | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | `your_super_secure_secret_key` | ✅ |
| `GMAIL_USER` | Gmail account for sending emails | `your-email@gmail.com` | ✅ |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 characters) | `abcd efgh ijkl mnop` | ✅ |
| `EMAIL_FROM_NAME` | Display name for emails | `Nurtura Care System` | ✅ |
| `EMAIL_FROM_ADDRESS` | From email address | `your-email@gmail.com` | ✅ |

### API Endpoints

The backend provides RESTful API endpoints for:

**Authentication & Users**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `GET /api/users/profile` - Get user profile

**Health Monitoring**
- `GET /api/vital-signs/:recipientId` - Get vital signs data
- `POST /api/vital-signs` - Add new vital signs reading
- `GET /api/care-recipients` - Get care recipients
- `POST /api/care-recipients` - Add new care recipient

**Calendar & Events**
- `GET /api/events` - Get user events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

**Forum & Communication**
- `GET /api/threads` - Get forum threads
- `POST /api/threads` - Create new thread
- `GET /api/threads/:id` - Get thread details
- `POST /api/comments` - Add comment to thread

**Alerts & Notifications**
- `GET /api/alerts/:recipientId` - Get alerts for recipient
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id/read` - Mark alert as read

## 🚨 Troubleshooting

### Common Issues & Solutions

**Authentication Issues**
```bash
# Problem: "Invalid login" error with Gmail
Solution:
1. Ensure 2-Factor Authentication is enabled on Google Account
2. Use Gmail App Password, not regular account password  
3. Check Gmail security settings allow less secure apps
4. Verify GMAIL_USER and GMAIL_APP_PASSWORD in .env file
```

**Database Connection Issues**
```bash  
# Problem: MongoDB connection errors
Solution:
1. Verify MongoDB is running: `mongod --version`
2. Check connection string format in MONGO_URI
3. Ensure database exists or create it: `use nurtura`
4. Check MongoDB Atlas IP whitelist (if using cloud)
5. Verify network connectivity and firewall settings
```

**Email Reminders Not Sending**
```bash
# Problem: Email reminders not working
Solution:  
1. Check server console logs for detailed error messages
2. Verify cron job is running (should see "Checking for upcoming appointments...")  
3. Test email configuration with "Send Test Reminder" button
4. Ensure Gmail App Password is correctly formatted (16 characters, no spaces)
5. Check appointment has reminder enabled and correct email address
```

**Frontend/Backend Connection Issues**
```bash
# Problem: API calls failing or CORS errors
Solution:
1. Verify backend server is running on correct port (default: 5000)
2. Check frontend is configured to call correct backend URL
3. Ensure CORS is properly configured in server.js
4. Verify both servers are running simultaneously in development
```

**Build/Development Issues**  
```bash
# Problem: Build failures or development server not starting
Solution:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node.js version compatibility (v16+)
4. Verify all environment variables are properly set
5. Check TypeScript compilation: `npx tsc --noEmit`
```

### Debug Mode

Enable detailed logging by setting environment variables:
```bash
# Frontend debugging
DEBUG=true npm run dev

# Backend debugging  
NODE_ENV=development npm run dev
```

### Server Logs

Monitor server activity:
```bash
cd server
npm run dev
# Watch for:
# - "Server running on port 5000"
# - "Connected to MongoDB"  
# - "Checking for upcoming appointments..."
# - Email delivery confirmations
```

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
