// Shared types for the Nurtura application

export interface CareRecipient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  emergencyContact?: string;
  primaryCaregiver?: string;
  profileImage?: string;
}

export interface VitalSignsData {
  id?: string;
  recipientId: string;
  vitalType: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar' | 'oxygen_saturation';
  value: string;
  unit: string;
  notes?: string;
  dateTime: string;
  recordedBy?: string;
}

export interface AppointmentData {
  id?: string;
  recipientId: string;
  title: string;
  type: 'medical' | 'dental' | 'vision' | 'specialist' | 'therapy' | 'lab' | 'imaging' | 'other';
  provider: string;
  location: string;
  dateTime: string;
  duration: string;
  notes?: string;
  reminder: boolean;
  reminderTime: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

export interface CareNoteData {
  id?: string;
  recipientId: string;
  category: 'general' | 'medical' | 'behavioral' | 'medication' | 'diet' | 'activity' | 'communication' | 'safety';
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  dateTime: string;
  isPrivate: boolean;
  authorId?: string;
  authorName?: string;
}

export interface Alert {
  id: string;
  type: 'medication' | 'appointment' | 'health' | 'emergency' | 'reminder';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  recipient?: string;
  recipientId?: string;
  dueDateTime?: string;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  relationship: 'Professional' | 'Family' | 'Community';
  phone: string;
  email: string;
  address?: string;
  availability: string[];
  specialties?: string[];
  emergencyContact: boolean;
  profileImage?: string;
}

export interface Resource {
  id: string;
  name: string;
  category: 'medical' | 'transportation' | 'social' | 'emergency' | 'recreation' | 'support';
  description: string;
  address: string;
  phone: string;
  website?: string;
  hours: string;
  rating: number;
  distance: string;
  services: string[];
  verified?: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
}

export interface RecentActivity {
  id: string;
  type: 'medication' | 'appointment' | 'vital' | 'care' | 'note';
  description: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
  recipientId?: string;
  recipientName?: string;
}

export interface Task {
  id: string;
  task: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  recipientId?: string;
  recipientName?: string;
  category: 'medication' | 'appointment' | 'care' | 'reminder' | 'other';
  completed: boolean;
  dueDateTime: string;
}

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    pushNotifications: boolean;
    medicationReminders: boolean;
    appointmentReminders: boolean;
    healthAlerts: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    shareDataWithFamily: boolean;
    shareDataWithProviders: boolean;
    dataRetention: '1year' | '2years' | '5years' | 'forever';
    allowAnalytics: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    language: 'english' | 'spanish' | 'french';
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
  isSubmitting: boolean;
}
