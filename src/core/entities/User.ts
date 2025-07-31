// Core User Entity - Domain Model
// Follows Single Responsibility Principle - only handles user data and behavior

export interface UserProperties {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthAlerts: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettings {
  shareDataWithFamily: boolean;
  shareDataWithProviders: boolean;
  dataRetention: '1year' | '2years' | '5years' | 'forever';
  allowAnalytics: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: 'english' | 'spanish' | 'french';
}

export class User {
  private constructor(private props: UserProperties) {}

  static create(props: Omit<UserProperties, 'id' | 'createdAt'>): User {
    return new User({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date()
    });
  }

  static fromPersistence(props: UserProperties): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get settings(): UserSettings | undefined {
    return this.props.settings;
  }

  updateSettings(settings: Partial<UserSettings>): void {
    this.props.settings = {
      ...this.props.settings,
      ...settings
    } as UserSettings;
  }

  updateProfile(updates: { username?: string; email?: string }): void {
    if (updates.username) {
      this.props.username = updates.username;
    }
    if (updates.email) {
      this.props.email = updates.email;
    }
  }

  toJSON(): UserProperties {
    return { ...this.props };
  }
}
