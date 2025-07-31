// Clean Architecture: User Settings Hook
// Follows Dependency Inversion - depends on abstractions (use cases) not concrete implementations

import { useState, useEffect, useCallback } from 'react';
import { container } from '../../shared/DIContainer';

// Mock logger for now - will be integrated with actual logger later
const Logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data)
};

// Type definitions for user settings
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthAlerts: boolean;
  weeklyReports: boolean;
  reminderFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  shareDataWithFamily: boolean;
  shareDataWithProviders: boolean;
  shareDataWithResearchers: boolean;
  dataRetention: '1year' | '2years' | '5years' | 'forever';
  allowAnalytics: boolean;
  allowCookies: boolean;
  publicProfile: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  language: 'english' | 'spanish' | 'french' | 'german';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12hour' | '24hour';
  highContrast: boolean;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceNavigation: boolean;
  keyboardNavigation: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  accessibility: AccessibilitySettings;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
}

export interface UpdateNotificationData extends Partial<NotificationSettings> {}
export interface UpdatePrivacyData extends Partial<PrivacySettings> {}
export interface UpdateAppearanceData extends Partial<AppearanceSettings> {}
export interface UpdateAccessibilityData extends Partial<AccessibilitySettings> {}

// Custom hook for managing user settings
export function useUserSettings(userId: string) {
  // State management
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get use cases from dependency injection container
  const getUserProfileUseCase = container.get<any>('getUserProfileUseCase');
  const updateUserProfileUseCase = container.get<any>('updateUserProfileUseCase');
  const updateUserSettingsUseCase = container.get<any>('updateUserSettingsUseCase');

  // Default settings structure
  const getDefaultSettings = useCallback((): UserSettings => ({
    profile: {
      id: userId,
      name: '',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      dateOfBirth: undefined,
      profilePicture: ''
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      medicationReminders: true,
      appointmentReminders: true,
      healthAlerts: true,
      weeklyReports: false,
      reminderFrequency: 'daily'
    },
    privacy: {
      shareDataWithFamily: true,
      shareDataWithProviders: true,
      shareDataWithResearchers: false,
      dataRetention: '2years',
      allowAnalytics: false,
      allowCookies: true,
      publicProfile: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      language: 'english',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12hour',
      highContrast: false
    },
    accessibility: {
      screenReader: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      voiceNavigation: false,
      keyboardNavigation: false
    }
  }), [userId]);

  // Load user settings
  const loadUserSettings = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Loading user settings', { userId });
      
      const result = await getUserProfileUseCase.execute(userId);
      
      if (result.isSuccess && result.data) {
        // Merge fetched data with default settings structure
        const defaultSettings = getDefaultSettings();
        const mergedSettings: UserSettings = {
          ...defaultSettings,
          profile: {
            ...defaultSettings.profile,
            ...result.data
          },
          // In a real implementation, these would come from separate API calls
          notifications: result.data.notificationSettings || defaultSettings.notifications,
          privacy: result.data.privacySettings || defaultSettings.privacy,
          appearance: result.data.appearanceSettings || defaultSettings.appearance,
          accessibility: result.data.accessibilitySettings || defaultSettings.accessibility
        };
        
        setSettings(mergedSettings);
        setHasUnsavedChanges(false);
        Logger.info('User settings loaded successfully', { userId });
      } else {
        // If no profile exists, create default settings
        const defaultSettings = getDefaultSettings();
        setSettings(defaultSettings);
        Logger.info('Using default settings for new user', { userId });
      }
    } catch (err) {
      const errorMessage = 'Failed to load user settings';
      setError(errorMessage);
      Logger.error('Error loading user settings', { error: err, userId });
      
      // Fallback to default settings
      setSettings(getDefaultSettings());
    } finally {
      setIsLoading(false);
    }
  }, [userId, getUserProfileUseCase, getDefaultSettings]);

  // Update profile information
  const updateProfile = useCallback(async (updates: UpdateProfileData): Promise<boolean> => {
    if (!settings) return false;

    setError(null);

    try {
      Logger.info('Updating user profile', { userId, updates });
      
      const result = await updateUserProfileUseCase.execute(userId, updates);
      
      if (result.isSuccess && result.data) {
        setSettings(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            ...result.data
          }
        } : null);
        
        setHasUnsavedChanges(false);
        Logger.info('User profile updated successfully', { userId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update profile';
        setError(errorMessage);
        Logger.error('Failed to update user profile', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating profile';
      setError(errorMessage);
      Logger.error('Unexpected error updating user profile', { error: err, userId });
      return false;
    }
  }, [settings, userId, updateUserProfileUseCase]);

  // Update notification settings
  const updateNotifications = useCallback(async (updates: UpdateNotificationData): Promise<boolean> => {
    if (!settings) return false;

    setIsSaving(true);
    setError(null);

    try {
      Logger.info('Updating notification settings', { userId, updates });
      
      const result = await updateUserSettingsUseCase.execute(userId, {
        notificationSettings: {
          ...settings.notifications,
          ...updates
        }
      });
      
      if (result.isSuccess) {
        setSettings(prev => prev ? {
          ...prev,
          notifications: {
            ...prev.notifications,
            ...updates
          }
        } : null);
        
        setHasUnsavedChanges(false);
        Logger.info('Notification settings updated successfully', { userId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update notification settings';
        setError(errorMessage);
        Logger.error('Failed to update notification settings', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating notification settings';
      setError(errorMessage);
      Logger.error('Unexpected error updating notification settings', { error: err, userId });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId, updateUserSettingsUseCase]);

  // Update privacy settings
  const updatePrivacy = useCallback(async (updates: UpdatePrivacyData): Promise<boolean> => {
    if (!settings) return false;

    setIsSaving(true);
    setError(null);

    try {
      Logger.info('Updating privacy settings', { userId, updates });
      
      const result = await updateUserSettingsUseCase.execute(userId, {
        privacySettings: {
          ...settings.privacy,
          ...updates
        }
      });
      
      if (result.isSuccess) {
        setSettings(prev => prev ? {
          ...prev,
          privacy: {
            ...prev.privacy,
            ...updates
          }
        } : null);
        
        setHasUnsavedChanges(false);
        Logger.info('Privacy settings updated successfully', { userId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update privacy settings';
        setError(errorMessage);
        Logger.error('Failed to update privacy settings', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating privacy settings';
      setError(errorMessage);
      Logger.error('Unexpected error updating privacy settings', { error: err, userId });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId, updateUserSettingsUseCase]);

  // Update appearance settings
  const updateAppearance = useCallback(async (updates: UpdateAppearanceData): Promise<boolean> => {
    if (!settings) return false;

    setIsSaving(true);
    setError(null);

    try {
      Logger.info('Updating appearance settings', { userId, updates });
      
      const result = await updateUserSettingsUseCase.execute(userId, {
        appearanceSettings: {
          ...settings.appearance,
          ...updates
        }
      });
      
      if (result.isSuccess) {
        setSettings(prev => prev ? {
          ...prev,
          appearance: {
            ...prev.appearance,
            ...updates
          }
        } : null);
        
        setHasUnsavedChanges(false);
        
        // Apply theme changes immediately
        if (updates.theme) {
          document.documentElement.setAttribute('data-theme', updates.theme);
        }
        if (updates.fontSize) {
          document.documentElement.setAttribute('data-font-size', updates.fontSize);
        }
        
        Logger.info('Appearance settings updated successfully', { userId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update appearance settings';
        setError(errorMessage);
        Logger.error('Failed to update appearance settings', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating appearance settings';
      setError(errorMessage);
      Logger.error('Unexpected error updating appearance settings', { error: err, userId });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId, updateUserSettingsUseCase]);

  // Update accessibility settings
  const updateAccessibility = useCallback(async (updates: UpdateAccessibilityData): Promise<boolean> => {
    if (!settings) return false;

    setIsSaving(true);
    setError(null);

    try {
      Logger.info('Updating accessibility settings', { userId, updates });
      
      const result = await updateUserSettingsUseCase.execute(userId, {
        accessibilitySettings: {
          ...settings.accessibility,
          ...updates
        }
      });
      
      if (result.isSuccess) {
        setSettings(prev => prev ? {
          ...prev,
          accessibility: {
            ...prev.accessibility,
            ...updates
          }
        } : null);
        
        setHasUnsavedChanges(false);
        Logger.info('Accessibility settings updated successfully', { userId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update accessibility settings';
        setError(errorMessage);
        Logger.error('Failed to update accessibility settings', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating accessibility settings';
      setError(errorMessage);
      Logger.error('Unexpected error updating accessibility settings', { error: err, userId });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId, updateUserSettingsUseCase]);

  // Save all pending changes
  const saveAllSettings = useCallback(async (): Promise<boolean> => {
    if (!settings || !hasUnsavedChanges) return true;

    setIsSaving(true);
    setError(null);

    try {
      Logger.info('Saving all user settings', { userId });
      
      const success = await updateUserSettingsUseCase.execute(userId, {
        notificationSettings: settings.notifications,
        privacySettings: settings.privacy,
        appearanceSettings: settings.appearance,
        accessibilitySettings: settings.accessibility
      });
      
      if (success.isSuccess) {
        setHasUnsavedChanges(false);
        Logger.info('All settings saved successfully', { userId });
        return true;
      } else {
        const errorMessage = success.error || 'Failed to save settings';
        setError(errorMessage);
        Logger.error('Failed to save all settings', { error: errorMessage, userId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while saving settings';
      setError(errorMessage);
      Logger.error('Unexpected error saving all settings', { error: err, userId });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, hasUnsavedChanges, userId, updateUserSettingsUseCase]);

  // Reset settings to defaults
  const resetToDefaults = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
    Logger.info('Settings reset to defaults', { userId });
  }, [getDefaultSettings, userId]);

  // Export settings data
  const exportSettings = useCallback((): string => {
    if (!settings) return '';
    
    const exportData = {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    Logger.info('Settings exported', { userId });
    return JSON.stringify(exportData, null, 2);
  }, [settings, userId]);

  // Import settings data
  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const importedData = JSON.parse(settingsJson);
      
      // Validate imported data structure
      if (!importedData.profile || !importedData.notifications) {
        throw new Error('Invalid settings format');
      }
      
      setSettings(importedData);
      setHasUnsavedChanges(true);
      Logger.info('Settings imported successfully', { userId });
      return true;
    } catch (err) {
      const errorMessage = 'Failed to import settings: Invalid format';
      setError(errorMessage);
      Logger.error('Failed to import settings', { error: err, userId });
      return false;
    }
  }, [userId]);

  // Load settings on mount
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  // Apply theme on settings load
  useEffect(() => {
    if (settings?.appearance) {
      document.documentElement.setAttribute('data-theme', settings.appearance.theme);
      document.documentElement.setAttribute('data-font-size', settings.appearance.fontSize);
    }
  }, [settings?.appearance]);

  return {
    // Data
    settings,
    
    // State
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    
    // Actions
    loadUserSettings,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateAppearance,
    updateAccessibility,
    saveAllSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    
    // Utility functions
    setHasUnsavedChanges
  };
}
