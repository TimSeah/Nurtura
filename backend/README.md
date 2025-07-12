# Nurtura - Appointment Reminder System

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your EmailJS credentials in the `.env` file:
   - Go to [EmailJS](https://www.emailjs.com/) and create an account
   - Create a service and template
   - Get your Service ID, Template ID, Public Key, and Private Key
   - Update the `.env` file with your actual values

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

## Environment Variables

The following environment variables are required:

- `EMAILJS_SERVICE_ID` - Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID` - Your EmailJS template ID  
- `EMAILJS_PUBLIC_KEY` - Your EmailJS public key
- `EMAILJS_PRIVATE_KEY` - Your EmailJS private key
- `PORT` - Backend server port (default: 3002)

## Security Notes

- Never commit the `.env` file to version control
- Keep your EmailJS keys secure and don't share them publicly
- The `.env` file is already included in `.gitignore`
