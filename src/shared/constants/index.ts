// Application Constants
// Centralized constants following DRY principle

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    BY_EMAIL: (email: string) => `/users/email/${email}`,
    SETTINGS: (id: string) => `/users/${id}/settings`,
  },
  
  // Event endpoints
  EVENTS: {
    BASE: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    BY_USER: (userId: string) => `/events/user/${userId}`,
    TODAY: (userId: string) => `/events/user/${userId}/today`,
    UPCOMING: (userId: string) => `/events/user/${userId}/upcoming`,
    PENDING_REMINDERS: '/events/pending-reminders',
    DATE_RANGE: (userId: string) => `/events/user/${userId}/range`,
    REMINDER_SENT: (id: string) => `/events/${id}/reminder-sent`,
  },
  
  // Vital Signs endpoints
  VITAL_SIGNS: {
    BASE: '/vital-signs',
    BY_ID: (id: string) => `/vital-signs/${id}`,
    BY_RECIPIENT: (recipientId: string) => `/vital-signs/${recipientId}`,
    BY_RECIPIENT_AND_TYPE: (recipientId: string, type: string) => `/vital-signs/${recipientId}/${type}`,
    RECENT: '/vital-signs/recent/dashboard',
  },
  
  // Care Recipients endpoints
  CARE_RECIPIENTS: {
    BASE: '/care-recipients',
    BY_ID: (id: string) => `/care-recipients/${id}`,
    BY_USER: (userId: string) => `/care-recipients/user/${userId}`,
    ACTIVE: (userId: string) => `/care-recipients/user/${userId}/active`,
  },
  
  // Alerts endpoints
  ALERTS: {
    BASE: '/alerts',
    BY_ID: (id: string) => `/alerts/${id}`,
    BY_RECIPIENT: (recipientId: string) => `/alerts/${recipientId}`,
    MARK_READ: (id: string) => `/alerts/${id}/read`,
    MARK_ALL_READ: (recipientId: string) => `/alerts/${recipientId}/read-all`,
    RESOLVE: (id: string) => `/alerts/${id}/resolve`,
  },
  
  // Forum endpoints
  FORUM: {
    THREADS: '/threads',
    THREAD_BY_ID: (id: string) => `/threads/${id}`,
    COMMENTS: '/comments',
    COMMENT_BY_ID: (id: string) => `/comments/${id}`,
  }
} as const;

export const APP_CONFIG = {
  DEFAULT_API_BASE_URL: 'http://localhost:5000/api',
  DEFAULT_PAGINATION_LIMIT: 10,
  DEFAULT_REMINDER_ADVANCE_MINUTES: 60,
  MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SESSION_TIMEOUT_MINUTES: 120,
} as const;

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_LETTER: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^\+?[\d\s\-\(\)]{10,}$/,
  }
} as const;

export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: '#0f766e',
    SECONDARY: '#06b6d4',
    SUCCESS: '#059669',
    WARNING: '#d97706',
    ERROR: '#dc2626',
    INFO: '#2563eb',
  },
  SIZES: {
    SMALL: 'small',
    MEDIUM: 'medium', 
    LARGE: 'large',
    EXTRA_LARGE: 'extra-large',
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  }
} as const;

export const ALERT_TYPES = {
  MEDICATION: 'medication',
  APPOINTMENT: 'appointment',
  VITAL_SIGNS: 'vital_signs',
  EMERGENCY: 'emergency',
  REMINDER: 'reminder',
  SYSTEM: 'system',
} as const;

export const ALERT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const EVENT_TYPES = {
  APPOINTMENT: 'appointment',
  MEDICATION: 'medication',
  THERAPY: 'therapy',
  PERSONAL: 'personal',
  SOCIAL: 'social',
  EMERGENCY: 'emergency',
} as const;

export const EVENT_STATUSES = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
} as const;

export const VITAL_SIGN_TYPES = {
  BLOOD_PRESSURE: 'blood_pressure',
  HEART_RATE: 'heart_rate',
  TEMPERATURE: 'temperature',
  WEIGHT: 'weight',
  BLOOD_SUGAR: 'blood_sugar',
  OXYGEN_SATURATION: 'oxygen_saturation',
} as const;
