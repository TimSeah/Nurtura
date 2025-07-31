// Clean Architecture: Advanced Settings Page
// Professional settings interface with clean architecture integration

import React, { useState, useContext, useCallback } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save, 
  Download, 
  Upload, 
  RotateCcw,
  Eye,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useUserSettings } from '../hooks/useUserSettings';
import './AdvancedSettings.css';

interface SettingsTabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ label, icon, isActive, onClick }) => (
  <button
    className={`settings-tab ${isActive ? 'active' : ''}`}
    onClick={onClick}
    aria-selected={isActive}
    role="tab"
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  id, 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false 
}) => (
  <div className="toggle-switch-container">
    <div className="toggle-switch-content">
      <label htmlFor={id} className="toggle-switch-label">
        {label}
      </label>
      {description && (
        <p className="toggle-switch-description">{description}</p>
      )}
    </div>
    <div className="toggle-switch-wrapper">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="toggle-switch-input"
      />
      <label htmlFor={id} className="toggle-switch-slider">
        <span className="toggle-switch-button" />
      </label>
    </div>
  </div>
);

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  id, 
  label, 
  value, 
  options, 
  onChange, 
  disabled = false 
}) => (
  <div className="select-field">
    <label htmlFor={id} className="select-field-label">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="select-field-input"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface TextFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  required = false
}) => (
  <div className="text-field">
    <label htmlFor={id} className="text-field-label">
      {label}
      {required && <span className="required-indicator">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className="text-field-input"
    />
  </div>
);

const AdvancedSettings: React.FC = () => {
  const { user } = useContext(AuthContext);
  const userId = user?.username || 'mock-user-id';
  
  const {
    settings,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateAppearance,
    updateAccessibility,
    saveAllSettings,
    resetToDefaults,
    exportSettings,
    importSettings
  } = useUserSettings(userId);

  const [activeTab, setActiveTab] = useState('profile');
  const [importData, setImportData] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Handle profile updates with optimistic UI
  const handleProfileUpdate = useCallback(async (field: string, value: string) => {
    if (!settings) return;
    
    const success = await updateProfile({ [field]: value });
    if (success) {
      setSaveMessage('Profile updated successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings, updateProfile]);

  // Handle notification updates
  const handleNotificationUpdate = useCallback(async (field: string, value: boolean | string) => {
    if (!settings) return;
    
    const success = await updateNotifications({ [field]: value });
    if (success) {
      setSaveMessage('Notification settings updated');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings, updateNotifications]);

  // Handle privacy updates
  const handlePrivacyUpdate = useCallback(async (field: string, value: boolean | string) => {
    if (!settings) return;
    
    const success = await updatePrivacy({ [field]: value });
    if (success) {
      setSaveMessage('Privacy settings updated');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings, updatePrivacy]);

  // Handle appearance updates
  const handleAppearanceUpdate = useCallback(async (field: string, value: string | boolean) => {
    if (!settings) return;
    
    const success = await updateAppearance({ [field]: value });
    if (success) {
      setSaveMessage('Appearance settings updated');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings, updateAppearance]);

  // Handle accessibility updates
  const handleAccessibilityUpdate = useCallback(async (field: string, value: boolean) => {
    if (!settings) return;
    
    const success = await updateAccessibility({ [field]: value });
    if (success) {
      setSaveMessage('Accessibility settings updated');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [settings, updateAccessibility]);

  // Handle export
  const handleExport = useCallback(() => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nurtura-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSaveMessage('Settings exported successfully');
    setTimeout(() => setSaveMessage(null), 3000);
  }, [exportSettings]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!importData.trim()) return;
    
    const success = importSettings(importData);
    if (success) {
      setShowImportDialog(false);
      setImportData('');
      setSaveMessage('Settings imported successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [importData, importSettings]);

  // Handle save all
  const handleSaveAll = useCallback(async () => {
    const success = await saveAllSettings();
    if (success) {
      setSaveMessage('All settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [saveAllSettings]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults();
      setSaveMessage('Settings reset to defaults');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [resetToDefaults]);

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner" />
        <p>Loading your settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-error">
        <AlertTriangle size={48} />
        <h2>Unable to Load Settings</h2>
        <p>There was a problem loading your settings. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Refresh Page
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Eye size={20} /> }
  ];

  return (
    <div className="advanced-settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="settings-actions">
          {hasUnsavedChanges && (
            <button 
              onClick={handleSaveAll}
              disabled={isSaving}
              className="save-all-button"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save All'}
            </button>
          )}
          <button onClick={handleExport} className="export-button">
            <Download size={18} />
            Export
          </button>
          <button onClick={() => setShowImportDialog(true)} className="import-button">
            <Upload size={18} />
            Import
          </button>
          <button onClick={handleReset} className="reset-button">
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="settings-error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {saveMessage && (
        <div className="settings-success-banner">
          <Check size={20} />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="settings-content">
        <nav className="settings-nav" role="tablist">
          {tabs.map((tab) => (
            <SettingsTab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>

        <main className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <div className="settings-grid">
                <TextField
                  id="name"
                  label="Full Name"
                  value={settings.profile.name}
                  onChange={(value) => handleProfileUpdate('name', value)}
                  required
                />
                <TextField
                  id="email"
                  label="Email Address"
                  type="email"
                  value={settings.profile.email}
                  onChange={(value) => handleProfileUpdate('email', value)}
                  required
                />
                <TextField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={settings.profile.phone || ''}
                  onChange={(value) => handleProfileUpdate('phone', value)}
                />
                <TextField
                  id="address"
                  label="Address"
                  value={settings.profile.address || ''}
                  onChange={(value) => handleProfileUpdate('address', value)}
                />
                <TextField
                  id="emergencyContact"
                  label="Emergency Contact"
                  value={settings.profile.emergencyContact || ''}
                  onChange={(value) => handleProfileUpdate('emergencyContact', value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <div className="settings-toggles">
                <ToggleSwitch
                  id="emailAlerts"
                  label="Email Alerts"
                  description="Receive important notifications via email"
                  checked={settings.notifications.emailAlerts}
                  onChange={(value) => handleNotificationUpdate('emailAlerts', value)}
                />
                <ToggleSwitch
                  id="smsAlerts"
                  label="SMS Alerts"
                  description="Receive urgent notifications via text message"
                  checked={settings.notifications.smsAlerts}
                  onChange={(value) => handleNotificationUpdate('smsAlerts', value)}
                />
                <ToggleSwitch
                  id="pushNotifications"
                  label="Push Notifications"
                  description="Receive notifications in your browser"
                  checked={settings.notifications.pushNotifications}
                  onChange={(value) => handleNotificationUpdate('pushNotifications', value)}
                />
                <ToggleSwitch
                  id="medicationReminders"
                  label="Medication Reminders"
                  description="Get reminders for medication schedules"
                  checked={settings.notifications.medicationReminders}
                  onChange={(value) => handleNotificationUpdate('medicationReminders', value)}
                />
                <ToggleSwitch
                  id="appointmentReminders"
                  label="Appointment Reminders"
                  description="Get reminders for upcoming appointments"
                  checked={settings.notifications.appointmentReminders}
                  onChange={(value) => handleNotificationUpdate('appointmentReminders', value)}
                />
                <ToggleSwitch
                  id="healthAlerts"
                  label="Health Alerts"
                  description="Receive alerts for abnormal health readings"
                  checked={settings.notifications.healthAlerts}
                  onChange={(value) => handleNotificationUpdate('healthAlerts', value)}
                />
                <ToggleSwitch
                  id="weeklyReports"
                  label="Weekly Reports"
                  description="Receive weekly health summaries"
                  checked={settings.notifications.weeklyReports}
                  onChange={(value) => handleNotificationUpdate('weeklyReports', value)}
                />
              </div>
              <div className="settings-select-section">
                <SelectField
                  id="reminderFrequency"
                  label="Reminder Frequency"
                  value={settings.notifications.reminderFrequency}
                  options={[
                    { value: 'immediate', label: 'Immediate' },
                    { value: 'daily', label: 'Daily Summary' },
                    { value: 'weekly', label: 'Weekly Summary' }
                  ]}
                  onChange={(value) => handleNotificationUpdate('reminderFrequency', value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Data</h2>
              <div className="settings-toggles">
                <ToggleSwitch
                  id="shareDataWithFamily"
                  label="Share Data with Family"
                  description="Allow family members to view your health information"
                  checked={settings.privacy.shareDataWithFamily}
                  onChange={(value) => handlePrivacyUpdate('shareDataWithFamily', value)}
                />
                <ToggleSwitch
                  id="shareDataWithProviders"
                  label="Share Data with Healthcare Providers"
                  description="Allow healthcare providers to access your data"
                  checked={settings.privacy.shareDataWithProviders}
                  onChange={(value) => handlePrivacyUpdate('shareDataWithProviders', value)}
                />
                <ToggleSwitch
                  id="shareDataWithResearchers"
                  label="Share Data for Research"
                  description="Contribute anonymized data to medical research"
                  checked={settings.privacy.shareDataWithResearchers}
                  onChange={(value) => handlePrivacyUpdate('shareDataWithResearchers', value)}
                />
                <ToggleSwitch
                  id="allowAnalytics"
                  label="Analytics"
                  description="Help improve the app by sharing usage data"
                  checked={settings.privacy.allowAnalytics}
                  onChange={(value) => handlePrivacyUpdate('allowAnalytics', value)}
                />
                <ToggleSwitch
                  id="allowCookies"
                  label="Cookies"
                  description="Allow cookies for improved functionality"
                  checked={settings.privacy.allowCookies}
                  onChange={(value) => handlePrivacyUpdate('allowCookies', value)}
                />
                <ToggleSwitch
                  id="publicProfile"
                  label="Public Profile"
                  description="Make your profile visible to other users"
                  checked={settings.privacy.publicProfile}
                  onChange={(value) => handlePrivacyUpdate('publicProfile', value)}
                />
              </div>
              <div className="settings-select-section">
                <SelectField
                  id="dataRetention"
                  label="Data Retention"
                  value={settings.privacy.dataRetention}
                  options={[
                    { value: '1year', label: '1 Year' },
                    { value: '2years', label: '2 Years' },
                    { value: '5years', label: '5 Years' },
                    { value: 'forever', label: 'Forever' }
                  ]}
                  onChange={(value) => handlePrivacyUpdate('dataRetention', value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance & Display</h2>
              <div className="settings-select-section">
                <SelectField
                  id="theme"
                  label="Theme"
                  value={settings.appearance.theme}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto (System)' }
                  ]}
                  onChange={(value) => handleAppearanceUpdate('theme', value)}
                />
                <SelectField
                  id="fontSize"
                  label="Font Size"
                  value={settings.appearance.fontSize}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                    { value: 'extra-large', label: 'Extra Large' }
                  ]}
                  onChange={(value) => handleAppearanceUpdate('fontSize', value)}
                />
                <SelectField
                  id="language"
                  label="Language"
                  value={settings.appearance.language}
                  options={[
                    { value: 'english', label: 'English' },
                    { value: 'spanish', label: 'Español' },
                    { value: 'french', label: 'Français' },
                    { value: 'german', label: 'Deutsch' }
                  ]}
                  onChange={(value) => handleAppearanceUpdate('language', value)}
                />
                <SelectField
                  id="dateFormat"
                  label="Date Format"
                  value={settings.appearance.dateFormat}
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                  ]}
                  onChange={(value) => handleAppearanceUpdate('dateFormat', value)}
                />
                <SelectField
                  id="timeFormat"
                  label="Time Format"
                  value={settings.appearance.timeFormat}
                  options={[
                    { value: '12hour', label: '12 Hour' },
                    { value: '24hour', label: '24 Hour' }
                  ]}
                  onChange={(value) => handleAppearanceUpdate('timeFormat', value)}
                />
              </div>
              <div className="settings-toggles">
                <ToggleSwitch
                  id="highContrast"
                  label="High Contrast"
                  description="Use high contrast colors for better visibility"
                  checked={settings.appearance.highContrast}
                  onChange={(value) => handleAppearanceUpdate('highContrast', value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="settings-section">
              <h2>Accessibility</h2>
              <div className="settings-toggles">
                <ToggleSwitch
                  id="screenReader"
                  label="Screen Reader Support"
                  description="Optimize for screen reader compatibility"
                  checked={settings.accessibility.screenReader}
                  onChange={(value) => handleAccessibilityUpdate('screenReader', value)}
                />
                <ToggleSwitch
                  id="largeText"
                  label="Large Text"
                  description="Use larger text throughout the application"
                  checked={settings.accessibility.largeText}
                  onChange={(value) => handleAccessibilityUpdate('largeText', value)}
                />
                <ToggleSwitch
                  id="reducedMotion"
                  label="Reduced Motion"
                  description="Minimize animations and motion effects"
                  checked={settings.accessibility.reducedMotion}
                  onChange={(value) => handleAccessibilityUpdate('reducedMotion', value)}
                />
                <ToggleSwitch
                  id="voiceNavigation"
                  label="Voice Navigation"
                  description="Enable voice commands for navigation"
                  checked={settings.accessibility.voiceNavigation}
                  onChange={(value) => handleAccessibilityUpdate('voiceNavigation', value)}
                />
                <ToggleSwitch
                  id="keyboardNavigation"
                  label="Enhanced Keyboard Navigation"
                  description="Improve keyboard navigation throughout the app"
                  checked={settings.accessibility.keyboardNavigation}
                  onChange={(value) => handleAccessibilityUpdate('keyboardNavigation', value)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Settings</h3>
              <button 
                onClick={() => setShowImportDialog(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Paste your exported settings JSON data below:</p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your settings data here..."
                rows={10}
                className="import-textarea"
              />
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowImportDialog(false)}
                className="button-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!importData.trim()}
                className="button-primary"
              >
                Import Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
