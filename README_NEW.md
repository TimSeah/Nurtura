# Nurtura - Caregiver Support Platform

Nurtura is a comprehensive web application designed to empower caregivers by providing tools to coordinate routines, track seniors' health metrics, and access community resources all in one cohesive platform.

## Features

### 🏠 Dashboard
- Overview of care recipients and their status
- Quick access to important tasks and reminders
- Recent activity feed
- Key statistics and health alerts
- Quick action buttons for common tasks

### 📅 Calendar & Scheduling
- Interactive calendar for managing appointments
- Medication reminders and schedules
- Daily care routines and tasks
- Event management with notes and details

### 🏥 Health Tracking
- Vital signs monitoring (blood pressure, heart rate, temperature, weight, blood sugar)
- Visual charts and trends for health data
- Support for multiple care recipients
- Easy data entry with timestamps and notes

### 👥 Care Circle Management
- Emergency contact organization
- Professional care team directory
- Family and friend network management
- Contact information and availability tracking
- Role-based access and communication

### 🗺️ Community Resources
- Local healthcare providers directory
- Transportation services
- Social services and support groups
- Emergency services information
- Service ratings and reviews
- Search and filter functionality

### 🔔 Alerts & Notifications
- Medication reminders
- Appointment notifications
- Health alerts and warnings
- Priority-based alert system
- Customizable notification preferences

### ⚙️ Settings
- Profile management
- Notification preferences
- Privacy and security controls
- Appearance customization
- Data sharing settings

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Styling**: CSS3 with custom design system

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nurtura
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview the production build locally

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with navigation
│   └── Layout.css       # Layout styles
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── calendar/        # Calendar functionality
│   ├── HealthTracking.tsx
│   ├── CareCircle.tsx
│   ├── Resources.tsx
│   ├── Alerts.tsx
│   └── Settings.tsx
├── App.tsx              # Main app component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Design System

Nurtura uses a consistent design system with:
- **Primary Color**: Teal (#0f766e) - representing health and trust
- **Typography**: System fonts with clear hierarchy
- **Spacing**: 8px base unit for consistent spacing
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliant design patterns

## Screenshots

The application includes:
- **Dashboard**: Clean overview with health statistics and recent activity
- **Health Tracking**: Interactive charts for vital signs monitoring
- **Care Circle**: Emergency contacts and care team management
- **Resources**: Local service directory with search and filtering
- **Calendar**: Appointment and medication scheduling
- **Alerts**: Priority-based notification system
- **Settings**: Comprehensive preference management

## License

This project is licensed under the MIT License.

---

**Nurtura** - Empowering caregivers with technology to provide better care for their loved ones.
