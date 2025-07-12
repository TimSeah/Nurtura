# EmailJS Demo - Appointment Booking System

A modern full-stack appointment booking system built with **TypeScript**, **React**, and **Node.js/Express** with EmailJS integration for automated email confirmations and reminders.

## 🏗️ Project Structure

```
EmailDemo/
├── frontend/          # React frontend application (TypeScript)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentBooking.tsx
│   │   │   └── AppointmentBooking.css
│   │   ├── config/
│   │   │   └── emailjs-config.ts
│   │   ├── types/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.tsx
│   │   └── index.css
│   ├── tsconfig.json
│   └── package.json
├── backend/           # Node.js/Express backend (TypeScript)
│   ├── src/
│   │   └── server.ts
│   ├── dist/          # Compiled JavaScript output
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- EmailJS account with configured service and template

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Update `backend/.env` with your EmailJS credentials
   ```
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   EMAILJS_PUBLIC_KEY=your_public_key
   EMAILJS_PRIVATE_KEY=your_private_key
   PORT=3001
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Backend will run on http://localhost:3001

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure EmailJS:**
   - Update `frontend/src/config/emailjs-config.ts` with your EmailJS credentials

4. **Start the React app:**
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:3000

## 🛠️ Development

### TypeScript
This project is fully built with TypeScript for better type safety and developer experience:
- Frontend: React with TypeScript (`.tsx` files)
- Backend: Node.js/Express with TypeScript (`.ts` files)
- Type definitions included for EmailJS and API interfaces

### Building for Production
**Backend:**
```bash
cd backend
npm run build  # Compiles TypeScript to JavaScript in dist/
npm run start  # Runs the compiled server
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates optimized production build
```

## 📧 EmailJS Template Requirements

Your EmailJS template should include these variables:
- `{{to_name}}` - Recipient name
- `{{email}}` - Recipient email address
- `{{reminder_message}}` - Dynamic message content
- `{{appointment_date}}` - Appointment date
- `{{appointment_time}}` - Appointment time
- `{{patient_name}}` - Patient name
- `{{notes}}` - Appointment notes

## 🎯 Features

- **Appointment Booking**: Web form to schedule appointments
- **Email Confirmations**: Immediate confirmation emails via EmailJS
- **Automated Reminders**: Cron job sends reminders 1 hour before appointments
- **Test Functionality**: Built-in EmailJS configuration testing
- **Responsive Design**: Mobile-friendly interface

## 🔧 API Endpoints

- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments/:id/send-reminder` - Manually send reminder
- `GET /api/health` - Health check

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start    # React development server with hot reload
```

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## 🔒 Environment Variables

### Backend (.env)
```
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxx
PORT=3001
```

### Frontend
EmailJS config is in `src/config/emailjs-config.js`

## 🧪 Testing

1. Start both backend and frontend servers
2. Visit http://localhost:3000
3. Click "Test EmailJS Configuration" to verify setup
4. Book a test appointment to verify full workflow

## 📝 Notes

- The old `index.html` file was a standalone version for quick testing
- This new structure separates concerns properly
- Frontend communicates with backend via REST API
- EmailJS is used for both immediate confirmations and scheduled reminders
