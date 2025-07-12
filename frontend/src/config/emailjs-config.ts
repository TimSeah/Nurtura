// Frontend EmailJS Configuration
interface EmailJSConfig {
  SERVICE_ID: string;
  TEMPLATE_ID: string;
  PUBLIC_KEY: string;
}

// Validate environment variables
const validateEnvVar = (varName: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

export const EMAILJS_CONFIG: EmailJSConfig = {
  SERVICE_ID: validateEnvVar('REACT_APP_EMAILJS_SERVICE_ID', process.env.REACT_APP_EMAILJS_SERVICE_ID),
  TEMPLATE_ID: validateEnvVar('REACT_APP_EMAILJS_TEMPLATE_ID', process.env.REACT_APP_EMAILJS_TEMPLATE_ID),
  PUBLIC_KEY: validateEnvVar('REACT_APP_EMAILJS_PUBLIC_KEY', process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
};
