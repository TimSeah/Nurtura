// Service Interfaces - Following Interface Segregation Principle
// Each service interface has a focused responsibility

// Authentication Service Interface
export interface IAuthenticationService {
  login(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }>;
  logout(): Promise<void>;
  validateToken(token?: string): Promise<{ valid: boolean; user?: any; error?: string }>;
  getCurrentUser(): Promise<any | null>;
  register(userData: { username: string; password: string; email?: string }): Promise<{ success: boolean; user?: any; error?: string }>;
}

// Email service interface
export interface IEmailService {
  sendEventReminder(eventData: any, recipientEmail: string): Promise<boolean>;
  sendTestReminder(recipientEmail: string): Promise<boolean>;
  sendAlert(alertData: any, recipientEmail: string): Promise<boolean>;
  sendWelcomeEmail(userData: any, recipientEmail: string): Promise<boolean>;
}

// Notification service interface
export interface INotificationService {
  sendPushNotification(userId: string, message: string, data?: any): Promise<boolean>;
  sendSMSNotification(phoneNumber: string, message: string): Promise<boolean>;
  scheduleNotification(userId: string, message: string, scheduledAt: Date): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
}

// API client interface
export interface IApiClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  patch<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

// Configuration service interface
export interface IConfigurationService {
  get(key: string): string | undefined;
  getRequired(key: string): string;
  getNumber(key: string, defaultValue?: number): number;
  getBoolean(key: string, defaultValue?: boolean): boolean;
}

// Logger service interface
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
}

// Validation service interface
export interface IValidationService {
  validateEmail(email: string): boolean;
  validatePassword(password: string): { valid: boolean; errors: string[] };
  validateUsername(username: string): { valid: boolean; errors: string[] };
  validatePhoneNumber(phone: string): boolean;
  validateDate(date: string): boolean;
  isValidName(name: string): boolean;
  sanitizeInput(input: string): string;
}
