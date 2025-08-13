# Nurtura - Comprehensive Caregiver Support Platform

A comprehensive web application designed to support caregivers in managing the health and well-being of their care recipients. Built with modern web technologies and deployed on AWS with full containerization support, featuring AI-powered content moderation and automated email notifications.

## 🎯 Project Overview

**Industry Context**: Nurtura is an assistive technology solution for caregivers of seniors, developed in partnership with Lions Befrienders, a social service agency in Singapore. The platform addresses the emotional and physical burnout faced by caregivers through technology-enabled care management and community support.

**Core Mission**: Enable caregivers to efficiently manage care routines, monitor health status of seniors, and access community resources effectively through streamlined, technology-driven solutions.

## ✨ Key Features

### 🏥 Health Monitoring & Vital Signs Management
- **Real-time vital signs tracking** with support for:
  - Blood pressure (systolic/diastolic)
  - Heart rate monitoring
  - Body temperature readings  
  - Weight tracking with BMI calculation
  - Blood sugar/glucose levels
  - Oxygen saturation (SpO2) monitoring
- **Interactive health dashboard** with comprehensive data visualization
  - Trend analysis charts using Recharts library
  - Historical data tracking and comparison
  - Customizable time range views (daily, weekly, monthly)
- **Multiple care recipient management** 
  - Individual profiles with personal health data
  - Medication schedules and tracking
  - Emergency contact information
- **Health data visualization and analytics**
  - Color-coded status indicators (normal, warning, critical)
  - Exportable health reports for medical professionals
  - Automated health trend notifications
- **Smart alert system** for critical health readings
  - Configurable thresholds for each vital sign
  - Immediate notifications for emergency situations
  - Integration with care team communication

### 🤖 AI-Powered Content Moderation System
- **Real-time content filtering** using MetaHateBERT model
  - Advanced transformer-based hate speech detection
  - 70% confidence threshold for moderation decisions
  - Multi-language support for diverse communities
- **Persistent AI service architecture**
  - Dedicated Python microservice (port 8001)
  - Model preloading for sub-second response times
  - Automatic model caching and optimization
- **Graceful degradation capabilities**
  - Fallback moderation when AI service unavailable
  - Queue-based processing for high-volume content
  - Manual moderation review workflow
- **Flexible deployment options**
  - CLI interface for batch content processing
  - HTTP REST API for real-time moderation
  - Docker containerization for scalable deployment
- **Production-ready features**
  - Health check endpoints for monitoring
  - Configurable moderation thresholds
  - Comprehensive logging and audit trails

### 📧 Smart Email Notification System
- **Gmail SMTP integration** with enterprise security
  - OAuth 2.0 and App Password authentication
  - Professional HTML email templates
  - Responsive design for mobile and desktop
- **Automated appointment reminder system**
  - 1-hour advance notifications (configurable)
  - Cron job scheduling with 5-minute intervals
  - Duplicate prevention with intelligent tracking
- **Advanced email features**
  - Personalized content with recipient details
  - Customizable branding and messaging
  - Email delivery confirmation and tracking
  - Retry logic for failed deliveries
- **Test and validation tools**
  - "Send Test Reminder" functionality
  - Email template preview system
  - Delivery status monitoring dashboard

### 🐳 Complete Docker Containerization
- **Multi-service microservices architecture**
  - Frontend: nginx-served React application (port 80)
  - Backend: Node.js/Express API server (port 5000) 
  - AI Service: Python-based moderation service (port 8001)
- **Production-optimized containers**
  - Multi-stage builds for minimal image sizes
  - Alpine Linux base images for security
  - Non-root user execution for enhanced security
- **Comprehensive orchestration**
  - Docker Compose with service dependencies
  - Automated health checks and restart policies
  - Resource limits and scaling configurations
- **AWS deployment ready**
  - ECR container registry compatible
  - ECS service definitions included
  - Load balancer and auto-scaling support
- **Development and production environments**
  - Hot reload support for development
  - Environment-specific configurations
  - Simplified management scripts (docker.bat)

### 👥 Community Forum & Communication Hub
- **Interactive discussion forum** with advanced features
  - Hierarchical threading system for organized discussions
  - Real-time comment updates without page refresh
  - Rich text editor with formatting options
- **Community engagement tools**
  - Upvoting system for helpful content
  - User reputation and badge system
  - Featured discussions and announcements
- **Moderation and safety**
  - AI-powered content filtering integration
  - Community reporting and flagging system
  - Moderator tools and user management
- **User experience features**
  - Thread bookmarking and following
  - Personalized content recommendations
  - Mobile-responsive design for accessibility

### 🚨 Advanced Alert & Notification System
- **Smart alert management** with priority classification
  - Critical, High, Medium, Low priority levels
  - Color-coded visual indicators and urgency markers
- **Comprehensive alert categories**
  - **Medication alerts**: Dosage reminders and refill notifications
  - **Appointment alerts**: Healthcare visits and follow-ups
  - **Vital signs alerts**: Threshold breaches and trending concerns
  - **Emergency alerts**: Critical health situations requiring immediate attention
  - **Care reminders**: Daily care tasks and routine activities
  - **System alerts**: Platform updates and maintenance notifications
- **Advanced filtering and organization**
  - Filter by status (unread, acknowledged, resolved)
  - Sort by priority, date, or alert type
  - Bulk operations for alert management
- **Multi-channel notification delivery**
  - In-app notifications with real-time updates
  - Email notifications for critical alerts
  - SMS integration capability (configurable)

### 📝 Comprehensive Care Documentation
- **Digital care notes and journaling**
  - Rich text editor with timestamp tracking
  - Photo and document attachment support
  - Voice-to-text transcription capability
- **Medication management system**
  - Drug interaction checking
  - Dosage tracking with visual pill organizer
  - Prescription refill reminders and pharmacy integration
- **Care history and progress monitoring**
  - Timeline view of care activities
  - Progress metrics and improvement tracking
  - Care plan adherence monitoring
- **Document organization and sharing**
  - Secure file storage with access controls
  - Care team collaboration tools
  - Export capabilities for healthcare providers

### 📅 Intelligent Calendar & Appointment Management
- **Comprehensive calendar system** with multiple view modes
  - Monthly, weekly, and daily calendar views
  - Drag-and-drop appointment scheduling
  - Recurring appointment support with flexible patterns
- **Advanced appointment features**
  - Multi-participant scheduling with availability checking
  - Appointment categorization (medical, therapy, social, etc.)
  - Integration with healthcare provider systems
- **Smart scheduling assistance**
  - Conflict detection and resolution suggestions
  - Travel time calculation and buffer recommendations
  - Automated rescheduling for cancelled appointments
- **Reminder and notification integration**
  - Customizable reminder timing (15 min, 1 hour, 1 day)
  - Email and SMS notification options
  - Calendar sync with popular platforms (Google, Outlook)

### 🔐 Enterprise-Grade Security & Authentication
- **JWT-based authentication system**
  - Secure token management with refresh token rotation
  - Session timeout and automatic logout
  - Multi-device session management
- **Comprehensive user management**
  - Email verification for new registrations
  - Strong password requirements with complexity checking
  - Account lockout protection against brute force attacks
- **Role-based access control (RBAC)**
  - Caregiver, care recipient, and administrator roles
  - Granular permissions for data access and modification
  - Audit logging for security compliance
- **Data protection and privacy**
  - HIPAA-compliant data handling practices
  - Encryption at rest and in transit
  - Regular security audits and vulnerability assessments

### 🌐 External Resources & Support Network
- **Curated resource library** for caregivers
  - Healthcare provider directories
  - Emergency services and contact information
  - Educational materials and support guides
- **Community support integration**
  - Local caregiver support group listings
  - Event calendars for community activities
  - Resource sharing and recommendations
- **Professional network connectivity**
  - Healthcare provider communication tools
  - Care coordination with medical teams
  - Integration with external healthcare systems

## 🚀 Quick Start Guide

### Prerequisites & System Requirements

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** database - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local installation
- **Gmail account** with App Password enabled for email notifications
- **Git** for version control
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Python 3.12+** (if running AI moderation service locally)

### 1. Repository Setup & Dependencies

```bash
# Clone the repository
git clone https://github.com/TimSeah/Nurtura.git
cd Nurtura

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Install AI moderation service dependencies (optional)
cd automod
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration

Create environment files with proper configuration:

**Backend Environment (server/.env):**
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/nurtura
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nurtura

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_with_at_least_32_characters

# Gmail Configuration for Email Reminders
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_gmail_app_password

# Email Service Configuration
EMAIL_FROM_NAME=Nurtura Care System
EMAIL_FROM_ADDRESS=your-email@gmail.com

# AI Moderation Service (optional)
ENABLE_MODERATION=true
USE_PERSISTENT_MODERATION=true
MODERATION_SERVICE_URL=http://localhost:8001
```

**AI Moderation Environment (automod/.env):**
```env
# AI Service Configuration
API_HOST=0.0.0.0
API_PORT=8001
LOG_LEVEL=INFO

# Model Configuration
MODEL_NAME=irlab-udc/MetaHateBERT
HATE_THRESHOLD=0.7
MODEL_CACHE_DIR=./models

# Performance Settings
MODERATION_IDLE_TIMEOUT=30
MAX_TEXT_LENGTH=2048
REQUEST_TIMEOUT=10
```

### 3. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Google Account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security > App passwords**
4. Generate a new app password for "Mail"
5. Copy the **16-character password** to your `.env` file

### 4. Database Initialization

**For local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
# Or start MongoDB manually

# The application will automatically create the database and collections
```

**For MongoDB Atlas:**
1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user and whitelist your IP
3. Copy the connection string to your `.env` file

### 5. Start the Application

**Option 1: Development Mode (Recommended for development)**

1. **Start the backend server** (with auto-reload):
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server** (in a new terminal):
   ```bash
   cd .. # Go back to root directory
   npm run dev
   ```

3. **Start the AI moderation service** (in a third terminal, optional):
   ```bash
   cd automod
   python moderation_server.py
   ```

**Option 2: Production Mode**

1. **Build the frontend**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Start the backend server**:
   ```bash
   cd server
   npm start
   ```

**Option 3: Docker Containerization (Production)**

```bash
# Build and start all services
docker-compose up -d

# Or use the management script (Windows)
.\docker.bat up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 6. Access the Application

- **Frontend**: http://localhost:5173 (development) or http://localhost (production)
- **Backend API**: http://localhost:5000
- **AI Moderation Service**: http://localhost:8001 (if running)

### 7. Initial Setup & Testing

1. **Register a new user account** through the web interface
2. **Create your first care recipient** profile
3. **Add some test vital signs** data
4. **Schedule a test appointment** with email reminder
5. **Test the forum** by creating a discussion thread
6. **Check the alerts** system functionality

## 🧪 Comprehensive Testing Infrastructure

The Nurtura platform includes extensive testing across multiple layers and methodologies:

### Frontend Testing with Jest
**React component and UI logic testing:**
```bash
npm test                    # Run all Jest tests
npm run test:watch         # Run Jest in watch mode
npm run test:coverage      # Generate detailed coverage report
```

**Test Coverage Areas:**
- Authentication flows (login, registration, logout)
- Component rendering and user interactions
- Form validation and error handling
- Modal dialogs and navigation
- Dashboard data visualization

### Utility Testing with Vitest
**Service layer and utility function testing:**
```bash
npm run test:vitest        # Run Vitest tests
npm run test:vitest:watch  # Run Vitest in watch mode
```

**Test Coverage Areas:**
- API service functions and data processing
- Utility functions and helper methods
- Authentication token handling
- Data transformation and validation
- Alert processing and filtering logic

### End-to-End Testing with Cypress
**Complete user workflow testing:**
```bash
npm run cy:open            # Open Cypress test runner GUI
npm run cy:run             # Run Cypress tests headlessly
npm run cy:run:uc7         # Run specific test suite (notifications)
npm run cy:run:uc9_1       # Run care monitoring tests (journals)
npm run cy:run:uc9_2       # Run care monitoring tests (readings/medications)
```

**E2E Test Scenarios:**
- User registration and authentication workflows
- Calendar event creation and management
- Forum thread creation, commenting, and voting
- Health monitoring data entry and visualization
- Alert creation, filtering, and management
- Email reminder testing and validation

### Backend API Testing
**Server-side logic and endpoint testing:**
```bash
cd server
npm test                   # Run backend test suite
npm run test:watch         # Run backend tests in watch mode
npm run test:email         # Test email service functionality
npm run test:coverage      # Generate backend coverage report
```

**Backend Test Coverage:**
- REST API endpoints and request/response handling
- Database model validation and CRUD operations
- Authentication middleware and JWT handling
- Email service functionality and template rendering
- Alert generation and notification processing

### Security & Fuzz Testing
**Advanced security testing with property-based and fuzz testing:**
```bash
npm run fuzz               # Run all fuzz tests
npm run fuzz:api          # API endpoint fuzz testing
npm run fuzz:db           # Database fuzzing tests
npm run fuzz:moderation   # AI moderation service testing
npm run fuzz:validation   # Input validation fuzzing
npm run security:scan     # Complete security audit
```

**Security Testing Features:**
- **SQL/NoSQL injection** attack prevention testing
- **XSS (Cross-Site Scripting)** vulnerability scanning
- **Authentication bypass** attempt detection
- **Input validation** boundary testing
- **Property-based testing** for business logic invariants
- **API fuzzing** with malformed and edge-case data

### AI Moderation Testing
**Specialized testing for content moderation:**
```bash
cd server
npm run test:fuzz         # Run moderation-specific fuzz tests
```

**Moderation Test Coverage:**
- Hate speech detection accuracy and false positive rates
- Content filtering with various text inputs and edge cases
- API response time and service reliability testing
- Fallback mechanism validation when AI service unavailable

### Test Data Management
**Automated test data seeding and cleanup:**
```bash
cd server
node seedDatabase.js      # Seed test data for development
node seedCypress.js       # Seed data specifically for Cypress tests
```

## 🛠️ Technology Stack & Architecture

### Frontend Architecture
- **React 19.1.0** with TypeScript for type-safe development
- **Vite 6.3.5** for lightning-fast development and optimized production builds
- **React Router Dom 7.6.2** for client-side routing and navigation
- **Tailwind CSS 4.1.11** for modern utility-first styling
- **Lucide React 0.523.0** for consistent and customizable iconography
- **Recharts 3.0.0** for interactive data visualization and health monitoring charts
- **Context API** for global state management (AuthContext, ThemeContext)
- **Motion 12.23.12** for smooth animations and micro-interactions

### Backend Infrastructure
- **Node.js** with Express.js 5.1.0 framework for robust API development
- **MongoDB 6.17.0** with Mongoose 8.16.4 ODM for flexible data persistence
- **JWT (jsonwebtoken 9.0.2)** for secure stateless authentication
- **bcrypt 6.0.0** for industry-standard password hashing
- **cookie-parser 1.4.7** for secure session management
- **CORS 2.8.5** configured for cross-origin requests
- **Morgan 1.10.1** for comprehensive HTTP request logging
- **node-cron 4.2.1** for automated task scheduling

### AI & Machine Learning
- **Python 3.12** runtime for AI moderation service
- **PyTorch** with CPU optimization for transformer model inference
- **MetaHateBERT** pre-trained model for hate speech detection
- **Transformers library** for natural language processing
- **FastAPI/Flask** for REST API endpoints (AI service)
- **Custom model caching** for improved response times

### Database Models & Schema
- **User Management**: Users, UserSettings, Authentication tokens
- **Health Data**: VitalSigns with comprehensive medical metrics, CareRecipient profiles
- **Calendar System**: Events with recurrence patterns and reminder configurations
- **Communication**: Forum threads with nested Comments and voting system
- **Notifications**: Advanced Alert system with priority levels and categorization
- **Care Documentation**: Journal entries with rich text and file attachments
- **External Resources**: Curated links and resource categorization

### Email & Communication Services
- **Nodemailer 7.0.5** with Gmail SMTP integration
- **HTML email templating** with responsive design
- **Cron job automation** for appointment reminders
- **Email delivery tracking** and bounce handling
- **Template customization** with dynamic content injection

### DevOps & Deployment
- **Docker & Docker Compose** for containerized deployment
- **nginx** reverse proxy for production load balancing
- **Multi-stage Docker builds** for optimized container images
- **Health check endpoints** for monitoring and orchestration
- **Environment-based configuration** for development/staging/production

### Testing & Quality Assurance
- **Jest 30.0.4** for comprehensive unit testing
- **Vitest 3.2.4** for fast utility and service testing
- **Cypress 14.5.3** for end-to-end user workflow testing
- **Supertest 6.3.4** for API endpoint testing
- **Fast-check 4.2.0** for property-based fuzz testing
- **ESLint** with TypeScript support for code quality

### Security & Authentication
- **JWT-based authentication** with refresh token rotation
- **bcrypt password hashing** with configurable salt rounds
- **CORS security policies** for cross-origin request protection
- **Input validation** and sanitization at multiple layers
- **Rate limiting** and DDoS protection mechanisms
- **Security headers** and HTTPS enforcement

## 📁 Detailed Project Structure

```
Nurtura/
├── 📋 Configuration & Build Files
│   ├── package.json                    # Frontend dependencies & build scripts
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vite.config.ts                  # Vite build and development configuration
│   ├── jest.config.js                  # Jest testing configuration
│   ├── vitest.config.ts                # Vitest utility testing configuration
│   ├── cypress.config.ts               # Cypress E2E testing configuration
│   └── tailwind.config.js              # Tailwind CSS configuration
│
├── 🐳 Docker & Deployment
│   ├── docker-compose.yml              # Multi-service container orchestration
│   ├── Dockerfile.frontend             # Frontend production container
│   ├── nginx.conf                      # nginx reverse proxy configuration
│   ├── docker.bat                      # Windows container management script
│   ├── DOCKER_GUIDE.md                 # Comprehensive Docker documentation
│   ├── DOCKER_AUTOMOD_GUIDE.md         # AI moderation Docker setup
│   └── DOCKER_TESTING_GUIDE.md         # Containerized testing guide
│
├── 🎨 Frontend Application (src/)
│   ├── App.tsx                         # Main application component with routing
│   ├── main.tsx                        # React application entry point
│   ├── index.css                       # Global styles and Tailwind imports
│   │
│   ├── components/                     # Reusable UI Components
│   │   ├── Layout.tsx                  # Main application layout wrapper
│   │   ├── Modal.tsx                   # Reusable modal dialog component
│   │   ├── AlertCard.tsx               # Alert notification display cards
│   │   ├── AlertFilters.tsx            # Alert filtering and sorting interface
│   │   ├── AlertSummary.tsx            # Alert overview and statistics
│   │   ├── VitalSignsModal.tsx         # Health data input modal dialog
│   │   ├── AppointmentModal.tsx        # Appointment scheduling modal
│   │   ├── CareNoteModal.tsx           # Care documentation input modal
│   │   ├── EmptyAlertsState.tsx        # Empty state component for alerts
│   │   └── TestAPI.tsx                 # API testing and debugging component
│   │
│   ├── contexts/                       # Global State Management
│   │   └── AuthContext.tsx             # User authentication state and methods
│   │
│   ├── pages/                          # Application Pages & Routes
│   │   ├── 🔐 Authentication
│   │   │   ├── login/                  # User login page
│   │   │   └── register/               # User registration page
│   │   │
│   │   ├── 🏠 Dashboard
│   │   │   ├── Dashboard.tsx           # Main health monitoring dashboard
│   │   │   └── components/             # Dashboard-specific components
│   │   │
│   │   ├── 🏥 Health Monitoring
│   │   │   ├── HealthTracking.tsx      # Vital signs tracking interface
│   │   │   └── components/             # Health monitoring components
│   │   │
│   │   ├── 📅 Calendar Management
│   │   │   └── calendar.tsx            # Appointment and event calendar
│   │   │
│   │   ├── 👥 Community Forum
│   │   │   ├── forum.tsx               # Forum main page
│   │   │   ├── ForumTab.tsx            # Forum navigation tabs
│   │   │   ├── threadDetail.tsx        # Individual thread view
│   │   │   ├── threadPost.tsx          # Thread creation interface
│   │   │   └── comment.tsx             # Comment system component
│   │   │
│   │   ├── ⚙️ Settings
│   │   │   └── Settings.tsx            # User preferences and configuration
│   │   │
│   │   └── 📚 Resources
│   │       ├── Resources.tsx           # External resources and support
│   │       └── pictures/               # Resource images and media
│   │
│   ├── services/                       # API Communication Layer
│   │   ├── apiService.ts               # Centralized API client with authentication
│   │   └── dataService.ts              # Data processing and transformation utilities
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   └── useAlerts.ts                # Alert management and state hook
│   │
│   ├── types/                          # TypeScript Type Definitions
│   │   └── index.ts                    # Application-wide type definitions
│   │
│   └── utils/                          # Utility Functions
│       └── alertUtils.ts               # Alert processing and helper functions
│
├── 🖥️ Backend API Server (server/)
│   ├── server.js                       # Express server entry point and configuration
│   ├── package.json                    # Backend dependencies and scripts
│   ├── .env.example                    # Environment variable template
│   ├── healthcheck.js                  # Docker health check script
│   │
│   ├── models/                         # MongoDB Data Models
│   │   ├── User.js                     # User authentication and profile model
│   │   ├── UserSettings.js             # User preferences and configuration
│   │   ├── VitalSigns.js               # Health data and vital signs model
│   │   ├── CareRecipient.js            # Care recipient profile management
│   │   ├── Event.js                    # Calendar events and appointment model
│   │   ├── Alert.js                    # Notification and alert system model
│   │   ├── Journal.js                  # Care documentation and notes model
│   │   ├── thread.js                   # Forum discussion thread model
│   │   ├── Comment.js                  # Forum comment and reply model
│   │   └── ExternalResource.js         # External resource link model
│   │
│   ├── routes/                         # REST API Endpoint Definitions
│   │   ├── auth.js                     # Authentication endpoints (login, register)
│   │   ├── users.js                    # User management and profile endpoints
│   │   ├── userSettings.js             # User preferences API
│   │   ├── events.js                   # Calendar and appointment management
│   │   ├── vitalSigns.js               # Health data and vital signs API
│   │   ├── careRecipients.js           # Care recipient management API
│   │   ├── alerts.js                   # Notification and alert system API
│   │   ├── threads.js                  # Forum thread management API
│   │   ├── comment.js                  # Forum comment system API
│   │   ├── journal.js                  # Care documentation API
│   │   ├── moderation.js               # Content moderation API endpoints
│   │   ├── externalResources.js        # External resource management
│   │   └── index.js                    # Route aggregation and middleware
│   │
│   ├── middleware/                     # Express Middleware
│   │   ├── auth.js                     # JWT authentication middleware
│   │   ├── validation.js               # Request validation middleware
│   │   └── errorHandler.js             # Centralized error handling
│   │
│   ├── services/                       # Business Logic Services
│   │   ├── emailReminderService.js     # Automated email notification service
│   │   └── moderationService.js        # Content moderation service integration
│   │
│   ├── templates/                      # Email Templates
│   │   └── emailTemplates.js           # HTML email templates with styling
│   │
│   ├── utils/                          # Server Utilities
│   │   ├── database.js                 # Database connection and configuration
│   │   ├── logger.js                   # Logging configuration and utilities
│   │   └── helpers.js                  # General utility functions
│   │
│   ├── scripts/                        # Database & Maintenance Scripts
│   │   ├── seedDatabase.js             # Development data seeding
│   │   └── seedCypress.js              # Test data for E2E testing
│   │
│   └── tests/                          # Backend Testing Suites
│       ├── unit/                       # Unit tests for models and services
│       ├── integration/                # API integration tests
│       └── fuzz/                       # Security and fuzz testing
│           ├── security-fuzz.test.js   # Security vulnerability testing
│           ├── property-based-fuzz.test.js # Business logic testing
│           ├── api-fuzzer.js           # API endpoint fuzzing
│           └── FUZZ_TESTING_GUIDE.md   # Comprehensive fuzz testing guide
│
├── 🤖 AI Moderation Service (automod/)
│   ├── moderation_server.py            # Flask/FastAPI server for AI service
│   ├── moderationService.py            # Core moderation logic and model handling
│   ├── moderate_cli.py                 # Command-line interface for moderation
│   ├── config.py                       # AI service configuration management
│   ├── requirements.txt                # Python dependencies
│   ├── Dockerfile                      # AI service container configuration
│   ├── .env.example                    # AI service environment template
│   ├── manage_service.py               # Service management utilities
│   ├── production_setup.bat            # Windows production setup script
│   └── SHUTDOWN_PROCESS.md             # Service shutdown documentation
│
├── 🧪 Testing Infrastructure (tests/)
│   ├── jest/                           # React Component Unit Tests
│   │   ├── Dashboard.test.tsx          # Dashboard component testing
│   │   ├── calendar.test.tsx           # Calendar functionality testing
│   │   ├── emailReminder.test.tsx      # Email service testing
│   │   └── authentication.test.tsx     # Auth flow testing
│   │
│   └── vitest/                         # Utility & Service Tests
│       ├── Comment.test.tsx            # Comment system testing
│       ├── Forum.test.tsx              # Forum functionality testing
│       ├── threadDetail.test.tsx       # Thread management testing
│       └── apiService.test.tsx         # API service testing
│
└── 🔄 End-to-End Testing (cypress/)
    ├── e2e/                            # E2E Test Scenarios
    │   ├── uc6_inputEventsToCalendar.cy.ts          # Calendar management workflow
    │   ├── uc7_sendingNotifications.cy.ts           # Notification system testing
    │   ├── uc9_monitoringCareRecipients_editJournals.cy.ts    # Care documentation
    │   └── uc9_monitoringCareRecipients_editReadingsAndMedications.cy.ts  # Health data
    │
    ├── fixtures/                       # Test data and mock responses
    └── support/                        # Cypress configuration and utilities
        ├── commands.ts                 # Custom Cypress commands
        └── e2e.ts                      # Global E2E test configuration
```

## 📧 Email Reminder System

The Nurtura platform includes a sophisticated automated email reminder service designed for healthcare environments:

### Core Features
- **Intelligent scheduling**: Automated scanning every 5 minutes for upcoming appointments
- **Configurable timing**: Default 1-hour advance reminders with customizable intervals
- **Duplicate prevention**: Advanced tracking system with database-backed email history
- **Professional templates**: HIPAA-compliant HTML email design with responsive layout
- **Customizable branding**: Configurable service name, colors, and messaging

### Technical Implementation
**Service Architecture:**
```javascript
// emailReminderService.js - Core service implementation
const emailService = {
  checkUpcomingAppointments: () => {}, // Cron job main function
  sendReminderEmail: () => {},         // Email delivery function  
  preventDuplicates: () => {},         // Duplicate tracking logic
  generateTemplate: () => {}           // Dynamic template generation
};
```

**Email Template Features:**
- **Responsive HTML design** compatible with all major email clients
- **Dynamic content injection** with appointment details and recipient information
- **Professional medical styling** with accessibility compliance
- **Mobile optimization** for smartphone and tablet viewing
- **Customizable branding** elements and color schemes

**Configuration Options:**
```env
# Email Service Configuration
GMAIL_USER=your-healthcare-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
EMAIL_FROM_NAME=Nurtura Care System
EMAIL_FROM_ADDRESS=your-healthcare-email@gmail.com

# Reminder Timing Configuration  
REMINDER_ADVANCE_TIME=60              # Minutes before appointment
REMINDER_CHECK_INTERVAL=5             # Minutes between checks
REMINDER_RETRY_ATTEMPTS=3             # Retry failed emails
```

### Testing & Validation Tools
- **"Send Test Reminder"** button in application settings for immediate testing
- **Email delivery status logging** with detailed error reporting
- **Gmail integration validation** with connection testing
- **Template preview system** for visual email validation
- **Cron job monitoring** with execution logging in development mode

### Advanced Features
- **Retry logic** for failed email deliveries with exponential backoff
- **Bounce handling** for invalid email addresses with user notification
- **Email tracking** capabilities for delivery confirmation
- **Template versioning** for A/B testing different message formats
- **Multi-language support** for diverse caregiver communities

## 💻 Development Guide

### Available Scripts & Commands

**Frontend Development (Root Directory):**
```bash
# Development & Building
npm run dev                # Start Vite development server (http://localhost:5173)
npm run build             # Build optimized production bundle
npm run preview           # Preview production build locally
npm run lint              # Run ESLint for code quality and consistency

# Testing Commands
npm test                  # Run comprehensive test suite (Vitest + Jest)
npm run test:watch        # Run tests in watch mode with file monitoring
npm run test:vitest       # Run Vitest utility and service tests only
npm run test:jest         # Run Jest React component tests only
npm run test:coverage     # Generate detailed test coverage report

# End-to-End Testing
npm run cy:open           # Open Cypress test runner GUI for interactive testing
npm run cy:run            # Run all Cypress tests headlessly in CI mode
npm run cy:run:uc7        # Run specific test suite (notification system)
npm run cy:run:uc9_1      # Run care recipient journal editing tests
npm run cy:run:uc9_2      # Run care recipient readings and medication tests

# Security & Quality
npm run fuzz              # Run comprehensive fuzz testing suite
npm run fuzz:api          # API endpoint fuzz testing
npm run fuzz:moderation   # AI moderation service testing
npm run security:scan     # Complete security vulnerability audit
```

**Backend Development (Server Directory):**
```bash
# Server Management  
npm start                 # Start production server with PM2 process manager
npm run dev              # Start development server with nodemon auto-reload
npm run test             # Run comprehensive backend test suite
npm run test:watch       # Run backend tests in watch mode
npm run test:email       # Test email service functionality specifically
npm run test:coverage    # Generate backend test coverage report

# Database Management
node seedDatabase.js     # Populate database with development sample data
node seedCypress.js      # Seed database with E2E test data

# Security Testing
npm run test:fuzz        # Run backend-specific fuzz tests
npm run fuzz:api         # API endpoint security testing
npm run fuzz:security    # Security vulnerability testing
npm run fuzz:property    # Property-based business logic testing
```

**AI Moderation Service (automod/ Directory):**
```bash
# Service Management
python moderation_server.py           # Start AI moderation HTTP service
python moderate_cli.py "text to check" # CLI content moderation
python manage_service.py start        # Start persistent moderation service
python manage_service.py stop         # Stop persistent moderation service
python manage_service.py status       # Check service status

# Configuration & Testing
python config.py validate             # Validate service configuration
python -m pytest tests/              # Run AI service tests
```

**Docker & Container Management:**
```bash
# Quick Start Commands (Windows)
.\docker.bat build       # Build all container images
.\docker.bat up           # Start production environment
.\docker.bat dev          # Start development environment with hot reload
.\docker.bat down         # Stop all services and cleanup
.\docker.bat restart      # Restart all services
.\docker.bat status       # Check container status

# Log Management
.\docker.bat logs         # View logs from all services
.\docker.bat logs webapp  # View web application logs only  
.\docker.bat logs frontend # View frontend logs only
.\docker.bat logs ai-moderation # View AI service logs only

# Testing & Maintenance
.\docker.bat test-ai      # Test AI moderation service connectivity
.\docker.bat clean        # ⚠️ Remove all containers and cleanup volumes

# Direct Docker Compose (Cross-platform)
docker-compose up -d                    # Start all services in background
docker-compose down                     # Stop all services
docker-compose logs -f                  # Follow logs in real-time
docker-compose build --no-cache         # Force rebuild all images
docker-compose exec webapp sh           # Access webapp container shell
docker-compose exec ai-moderation bash  # Access AI service container
```

### Environment Variables Reference

| Variable | Description | Default Value | Required | Example |
|----------|-------------|---------------|----------|---------|
| **Database Configuration** |
| `MONGO_URI` | MongoDB connection string | - | ✅ | `mongodb://localhost:27017/nurtura` |
| `DB_NAME` | Database name override | `nurtura` | ❌ | `nurtura_production` |
| **Server Configuration** |
| `PORT` | Backend server port | `5000` | ✅ | `5000` |
| `NODE_ENV` | Environment mode | `development` | ✅ | `production` |
| `JWT_SECRET` | JWT token signing secret | - | ✅ | `your_super_secure_secret_key_min_32_chars` |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` | ❌ | `7d` |
| **Email Service Configuration** |
| `GMAIL_USER` | Gmail account for notifications | - | ✅ | `your-care-system@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password | - | ✅ | `abcd efgh ijkl mnop` |
| `EMAIL_FROM_NAME` | Display name in emails | `Nurtura Care System` | ✅ | `Your Care Center` |
| `EMAIL_FROM_ADDRESS` | From email address | - | ✅ | `noreply@yourcarecenter.com` |
| `REMINDER_ADVANCE_TIME` | Reminder timing (minutes) | `60` | ❌ | `120` |
| **AI Moderation Configuration** |
| `ENABLE_MODERATION` | Enable AI content filtering | `true` | ❌ | `false` |
| `USE_PERSISTENT_MODERATION` | Use persistent AI service | `true` | ❌ | `false` |
| `MODERATION_SERVICE_URL` | AI service endpoint | `http://localhost:8001` | ❌ | `http://ai-moderation:8001` |
| `HATE_THRESHOLD` | Moderation sensitivity | `0.7` | ❌ | `0.8` |
| **Security Configuration** |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` | ❌ | `https://your-domain.com` |
| `RATE_LIMIT_MAX` | API rate limit per window | `100` | ❌ | `1000` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` | ❌ | `3600000` |
| **Logging & Monitoring** |
| `LOG_LEVEL` | Application log level | `info` | ❌ | `debug` |
| `ENABLE_MORGAN_LOGGING` | HTTP request logging | `true` | ❌ | `false` |

### API Endpoints Documentation

The Nurtura backend provides comprehensive RESTful API endpoints:

**Authentication & User Management**
```bash
POST   /api/auth/register              # User registration with email verification
POST   /api/auth/login                 # User authentication with JWT token
POST   /api/auth/logout                # Session logout and token invalidation  
GET    /api/auth/verify-token          # JWT token validation
POST   /api/auth/forgot-password       # Password reset request
POST   /api/auth/reset-password        # Password reset with token

GET    /api/users/profile              # Get current user profile
PUT    /api/users/profile              # Update user profile information
GET    /api/users/settings             # Get user preferences and settings
PUT    /api/users/settings             # Update user preferences
DELETE /api/users/account              # Delete user account (with confirmation)
```

**Health Monitoring & Vital Signs**
```bash
GET    /api/vital-signs/:recipientId   # Get vital signs history for care recipient
POST   /api/vital-signs                # Add new vital signs reading
PUT    /api/vital-signs/:id            # Update existing vital signs entry
DELETE /api/vital-signs/:id            # Delete vital signs entry
GET    /api/vital-signs/:id/trends     # Get trend analysis for specific vital sign

GET    /api/care-recipients            # Get all care recipients for user
POST   /api/care-recipients            # Create new care recipient profile
PUT    /api/care-recipients/:id        # Update care recipient information  
DELETE /api/care-recipients/:id        # Remove care recipient profile
GET    /api/care-recipients/:id/summary # Get comprehensive care summary
```

**Calendar & Event Management**
```bash
GET    /api/events                     # Get user's calendar events
POST   /api/events                     # Create new calendar event
PUT    /api/events/:id                 # Update existing event
DELETE /api/events/:id                 # Delete calendar event
GET    /api/events/:id                 # Get specific event details
POST   /api/events/:id/reminder        # Send manual reminder email
```

**Community Forum & Communication**
```bash
GET    /api/threads                    # Get forum threads with pagination
POST   /api/threads                    # Create new discussion thread
GET    /api/threads/:id                # Get thread details with comments
PUT    /api/threads/:id                # Update thread (author only)
DELETE /api/threads/:id                # Delete thread (author/moderator)
POST   /api/threads/:id/vote           # Vote on thread (upvote/downvote)

GET    /api/comments/:threadId         # Get comments for specific thread
POST   /api/comments                   # Add comment to thread
PUT    /api/comments/:id               # Update comment (author only)
DELETE /api/comments/:id               # Delete comment (author/moderator)
POST   /api/comments/:id/vote          # Vote on comment
```

**Alert & Notification System**
```bash
GET    /api/alerts                     # Get alerts for current user
GET    /api/alerts/:recipientId        # Get alerts for specific care recipient
POST   /api/alerts                     # Create new alert
PUT    /api/alerts/:id/read            # Mark alert as read
PUT    /api/alerts/:id/status          # Update alert status
DELETE /api/alerts/:id                 # Delete alert
GET    /api/alerts/statistics          # Get alert statistics and summary
```

**Care Documentation & Journal**
```bash
GET    /api/journal/:recipientId       # Get journal entries for care recipient
POST   /api/journal                    # Create new journal entry
PUT    /api/journal/:id                # Update journal entry
DELETE /api/journal/:id                # Delete journal entry
GET    /api/journal/:id/attachments    # Get attached files for journal entry
POST   /api/journal/:id/attachments    # Add file attachment to journal entry
```

**AI Content Moderation**
```bash
POST   /api/moderation/check           # Check content for inappropriate material
GET    /api/moderation/status          # Get moderation service health status
POST   /api/moderation/batch           # Batch moderation for multiple items
GET    /api/moderation/stats           # Get moderation statistics
```

**External Resources & Support**
```bash
GET    /api/external-resources         # Get curated external resources
POST   /api/external-resources         # Add new resource (admin only)
PUT    /api/external-resources/:id     # Update resource (admin only)
DELETE /api/external-resources/:id     # Delete resource (admin only)
GET    /api/external-resources/categories # Get resource categories
```

**System Health & Monitoring**
```bash
GET    /api/health                     # Application health check
GET    /api/health/detailed            # Detailed system status
GET    /api/health/database            # Database connectivity check
GET    /api/health/email               # Email service connectivity check
GET    /api/health/moderation          # AI moderation service check
```

### Request/Response Examples

**Create Care Recipient Example:**
```bash
# Request
POST /api/care-recipients
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "name": "John Smith",
  "dateOfBirth": "1945-03-15",
  "relationship": "Father",
  "emergencyContact": {
    "name": "Emergency Contact Name",
    "phone": "+1-555-123-4567"
  },
  "medicalInfo": {
    "allergies": ["Penicillin", "Shellfish"],
    "medications": ["Lisinopril 10mg", "Metformin 500mg"],
    "conditions": ["Type 2 Diabetes", "Hypertension"]
  }
}

# Response
HTTP 201 Created
{
  "success": true,
  "data": {
    "_id": "64abc123def456789012345",
    "name": "John Smith",
    "dateOfBirth": "1945-03-15T00:00:00.000Z",
    "age": 78,
    "relationship": "Father",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "emergencyContact": { ... },
    "medicalInfo": { ... }
  }
}
```

**Add Vital Signs Example:**
```bash
# Request  
POST /api/vital-signs
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "careRecipientId": "64abc123def456789012345",
  "readings": {
    "bloodPressure": {
      "systolic": 128,
      "diastolic": 82
    },
    "heartRate": 72,
    "temperature": 98.6,
    "weight": 165.5,
    "bloodSugar": 110,
    "oxygenSaturation": 98
  },
  "notes": "Patient feeling well today, no complaints"
}

# Response
HTTP 201 Created
{
  "success": true,
  "data": {
    "_id": "64def789abc123456789012",
    "careRecipientId": "64abc123def456789012345", 
    "readings": { ... },
    "timestamp": "2024-01-15T14:30:00.000Z",
    "status": "normal",
    "alerts": []
  }
}
```

## 🚨 Comprehensive Troubleshooting Guide

### Authentication & Login Issues

**Problem: "Invalid credentials" error during login**
```bash
# Diagnostic Steps:
1. Verify email format is correct
2. Check password requirements (min 8 chars, special characters)
3. Ensure account is not locked due to failed attempts

# Solutions:
- Clear browser cache and cookies
- Try password reset if account exists
- Check server logs: cd server && npm run dev
- Verify database connection: GET /api/health/database
```

**Problem: JWT token expiration or validation errors**
```bash
# Check token validity:
curl -X GET http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer <your-token>"

# Solutions:
- Refresh the page to get new token
- Clear localStorage/sessionStorage
- Check JWT_SECRET environment variable matches
- Verify system clock synchronization
```

### Gmail Integration & Email Issues

**Problem: Email reminders not sending**
```bash
# Diagnostic Commands:
cd server
npm run test:email                    # Test email service functionality
node -e "require('./services/emailReminderService.js').testConnection()"

# Common Solutions:
1. **Gmail App Password Issues:**
   - Enable 2-Factor Authentication on Google Account
   - Generate new App Password (16 characters, no spaces)
   - Use App Password, not regular Gmail password

2. **Environment Variable Problems:**
   - Verify GMAIL_USER matches sending email exactly
   - Check GMAIL_APP_PASSWORD has no extra spaces
   - Confirm EMAIL_FROM_NAME and EMAIL_FROM_ADDRESS are set

3. **Gmail Security Settings:**
   - Allow "Less secure app access" if using regular password (not recommended)
   - Check for blocked sign-in attempts in Google Account
   - Verify account has sufficient sending limits
```

**Problem: Appointment reminder duplicates**
```bash
# Check duplicate prevention system:
GET /api/events/reminder-history

# Solutions:
- Clear reminder history: DELETE /api/events/reminder-history
- Restart cron service: docker-compose restart webapp
- Check database for stuck reminder records
```

### Database Connection Issues

**Problem: MongoDB connection failures**
```bash
# Test database connectivity:
GET /api/health/database              # Check connection status

# For local MongoDB:
sudo systemctl status mongod          # Linux
brew services list | grep mongodb     # macOS
net start MongoDB                     # Windows

# Common Solutions:
1. **Local MongoDB Issues:**
   - Start MongoDB service: sudo systemctl start mongod
   - Check MongoDB logs: sudo journalctl -u mongod
   - Verify port 27017 is available: netstat -tulpn | grep 27017

2. **MongoDB Atlas Issues:**
   - Check IP whitelist in Atlas dashboard
   - Verify connection string format
   - Test network connectivity: ping cluster0.xxx.mongodb.net
   - Check authentication credentials

3. **Connection String Problems:**
   - Ensure MONGO_URI includes database name
   - Check URL encoding of special characters in password
   - Verify SSL/TLS settings for cloud connections
```

### AI Moderation Service Issues

**Problem: AI moderation service not responding**
```bash
# Check AI service health:
curl http://localhost:8001/health

# Start AI service manually:
cd automod
python moderation_server.py

# Diagnostic Steps:
1. **Model Loading Issues:**
   - Check available disk space (model is ~1.5GB)
   - Monitor first-time model download progress
   - Verify internet connectivity for model download

2. **Python Environment Problems:**
   - Install dependencies: pip install -r requirements.txt
   - Check Python version: python --version (needs 3.8+)
   - Verify PyTorch installation: python -c "import torch; print(torch.__version__)"

3. **Memory Issues:**
   - Check available RAM (needs ~2GB for model)
   - Monitor container memory: docker stats
   - Increase Docker memory allocation if needed
```

**Problem: Content not being moderated**
```bash
# Test moderation manually:
curl -X POST http://localhost:8001/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "test message"}'

# Check moderation integration:
- Verify ENABLE_MODERATION=true in .env
- Check MODERATION_SERVICE_URL points to correct endpoint
- Test fallback moderation when AI service unavailable
```

### Frontend Development Issues

**Problem: Vite development server not starting**
```bash
# Common Solutions:
1. **Port Conflicts:**
   netstat -tulpn | grep 5173          # Check if port in use
   npm run dev -- --port 3001         # Use different port

2. **Node Version Issues:**
   node --version                      # Check Node.js version (needs 16+)
   nvm use 18                         # Switch to compatible version

3. **Dependency Issues:**
   rm -rf node_modules package-lock.json
   npm install                        # Clean dependency reinstall
   npm run build                      # Test build process
```

**Problem: API calls failing from frontend**
```bash
# Check network requests:
- Open browser DevTools → Network tab
- Look for CORS errors in console
- Verify API base URL configuration

# Solutions:
1. **CORS Configuration:**
   - Check CORS_ORIGIN in server/.env
   - Verify backend server is running on port 5000
   - Add frontend URL to CORS whitelist

2. **API Base URL Issues:**
   - Check apiService.ts configuration
   - Verify backend server accessibility: curl http://localhost:5000/api/health
   - Update proxy configuration in vite.config.ts
```

### Docker & Container Issues

**Problem: Docker containers not starting**
```bash
# Check container status:
docker-compose ps
docker-compose logs

# Common Solutions:
1. **Port Conflicts:**
   netstat -tulpn | grep -E ":(80|5000|8001)"  # Check occupied ports
   # Modify docker-compose.yml port mappings

2. **Image Build Issues:**
   docker-compose build --no-cache     # Force rebuild images
   docker system prune                 # Clean up unused resources
   
3. **Volume Mount Problems:**
   docker-compose down -v              # Remove volumes
   docker-compose up --build          # Rebuild and restart

4. **Memory/Resource Issues:**
   docker stats                        # Check resource usage
   # Increase Docker memory allocation in Docker Desktop
```

**Problem: AI moderation container failing**
```bash
# Check AI container logs:
docker-compose logs ai-moderation

# Common Issues:
1. **Model Download Timeout:**
   # Increase timeout in docker-compose.yml
   # Pre-download model: docker run --rm -v ai-models:/models python:3.12 pip install transformers torch

2. **Insufficient Memory:**
   # Add memory limits to docker-compose.yml:
   deploy:
     resources:
       limits:
         memory: 4G
```

### Performance & Optimization Issues

**Problem: Slow application response times**
```bash
# Performance Monitoring:
1. **Frontend Performance:**
   - Open DevTools → Performance tab
   - Check bundle size: npm run build && npm run preview
   - Analyze with Lighthouse for optimization suggestions

2. **Backend Performance:**
   - Monitor API response times in Morgan logs
   - Check database query performance
   - Profile memory usage: node --inspect server.js

3. **Database Optimization:**
   - Add database indexes for frequently queried fields
   - Monitor MongoDB performance: db.stats()
   - Check for expensive queries: db.runCommand({profiler: 2})
```

### Security & Vulnerability Issues

**Problem: Security vulnerabilities detected**
```bash
# Security Auditing:
npm audit                            # Frontend security audit
cd server && npm audit               # Backend security audit
npm run security:scan                # Complete security scan

# Fuzz Testing:
npm run fuzz                         # Run comprehensive fuzz tests
npm run fuzz:api                     # API-specific fuzz testing
npm run fuzz:security                # Security-focused fuzz testing

# Solutions:
1. **Update Dependencies:**
   npm update                        # Update to latest compatible versions
   npm audit fix                     # Auto-fix known vulnerabilities

2. **Environment Security:**
   - Rotate JWT_SECRET regularly
   - Use strong, unique passwords for database
   - Enable HTTPS in production
   - Configure proper CORS policies
```

### Testing Issues

**Problem: Tests failing after code changes**
```bash
# Test Debugging:
npm test -- --verbose                # Detailed test output
npm run test:coverage               # Check test coverage

# Fix Common Test Issues:
1. **Mock Issues:**
   - Update __mocks__ files for API changes
   - Clear Jest cache: npx jest --clearCache

2. **Async Test Problems:**
   - Use proper async/await in tests
   - Increase test timeouts for slow operations
   - Mock external API calls properly

3. **Database Test Issues:**
   - Ensure test database is clean between runs
   - Use proper test data seeding: node seedCypress.js
```

**Problem: Cypress E2E tests failing**
```bash
# Cypress Debugging:
npm run cy:open                      # Interactive debugging mode
npm run cy:run -- --record           # Record test runs for analysis

# Common Solutions:
1. **Element Selection Issues:**
   - Update selectors for UI changes
   - Use data-testid attributes for stable selection
   - Add proper wait conditions

2. **Test Environment Issues:**
   - Ensure backend server is running during E2E tests
   - Reset database to known state before tests
   - Check for network connectivity issues
```

### Log Analysis & Debugging

**Access Application Logs:**
```bash
# Frontend Logs (Browser Console)
- Open DevTools → Console tab
- Look for error messages and warnings
- Check Network tab for failed API requests

# Backend Logs
cd server
npm run dev                          # Development logs with debug info
tail -f server.log                   # Follow log file (if configured)

# Docker Container Logs
docker-compose logs -f               # Follow all service logs
docker-compose logs webapp           # Specific service logs
docker-compose logs -f ai-moderation # AI service logs only

# AI Moderation Service Logs
cd automod
tail -f moderation.log              # Follow moderation service logs
python manage_service.py status     # Check service status
```

**Enable Debug Mode:**
```bash
# Frontend Debug Mode
DEBUG=true npm run dev

# Backend Debug Mode  
NODE_ENV=development npm run dev
DEBUG=nurtura:* npm run dev          # Detailed debugging

# Database Debug Mode
mongoose.set('debug', true);         # In server.js for database queries
```

## 📄 License & Legal

This project is open source and available under the [MIT License](LICENSE).

### License Terms
- **Free for personal and commercial use**
- **Modification and distribution permitted**
- **No warranty provided**
- **Attribution required**

### Healthcare Compliance Notice
This application is designed for caregiver support and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult with qualified healthcare providers for medical decisions.

**HIPAA Compliance**: While the application implements security best practices, full HIPAA compliance requires additional configuration and infrastructure setup specific to your healthcare environment.

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started
1. **Fork the repository** and create your feature branch
2. **Set up development environment** following the Quick Start guide
3. **Run tests** to ensure everything works: `npm test && cd server && npm test`
4. **Make your changes** following our coding standards

### Development Guidelines
- **Code Style**: Follow existing TypeScript/JavaScript patterns
- **Testing**: Add tests for new features and maintain coverage above 80%
- **Documentation**: Update relevant documentation for changes
- **Commits**: Use clear, descriptive commit messages
- **Security**: Follow security best practices, especially for healthcare data

### Contribution Types
- 🐛 **Bug fixes** with test cases
- ✨ **New features** with comprehensive testing
- 📝 **Documentation improvements**
- 🔒 **Security enhancements**
- 🧪 **Test coverage improvements**
- 🎨 **UI/UX enhancements**

### Pull Request Process
1. **Create feature branch**: `git checkout -b feature/amazing-feature`
2. **Test thoroughly**: Run all test suites and ensure they pass
3. **Update documentation**: Including README updates if needed
4. **Submit pull request** with detailed description of changes
5. **Respond to review feedback** promptly and professionally

### Code of Conduct
- **Be respectful** and inclusive in all interactions
- **Focus on constructive feedback** and collaborative problem-solving
- **Respect privacy and security** especially regarding healthcare data
- **Follow open source best practices** and licensing requirements

## 📞 Support & Community

### Getting Help
- **📖 Documentation**: Check this comprehensive README and related guides
- **🐛 Issues**: Report bugs and request features via GitHub Issues
- **💬 Discussions**: Join community discussions for questions and ideas
- **📧 Email**: Contact maintainers for security-related concerns

### Support Channels
1. **GitHub Issues**: Bug reports and feature requests
2. **Documentation**: Comprehensive guides and troubleshooting
3. **Community Forum**: User discussions and support
4. **Professional Support**: Available for healthcare organizations

### Healthcare Industry Focus
This project specifically serves **caregivers of seniors** and supports organizations like **Lions Befrienders** in Singapore. We understand the unique challenges in eldercare and assistive technology.

**For Healthcare Organizations:**
- **Professional consultation** available for implementation
- **Custom feature development** for specific care requirements  
- **HIPAA compliance assistance** and security auditing
- **Staff training** and onboarding support

### Project Roadmap
- 🔄 **Enhanced AI moderation** with multi-language support
- 📱 **Mobile application** for iOS and Android
- 🏥 **EHR integration** with major healthcare systems
- 📊 **Advanced analytics** and care insights
- 🌐 **Multi-tenant architecture** for healthcare organizations
- 🔔 **Real-time notifications** with WebSocket integration

---

**Nurtura Platform** - Empowering caregivers through technology to provide better care for seniors and build stronger support communities.

*Built with ❤️ for caregivers everywhere*