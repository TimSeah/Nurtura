import React, { useState, useEffect,useContext } from 'react';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import './Settings.css';
import { AuthContext } from "../contexts/AuthContext";

const Settings: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.username || '',//'Sarah Johnson',
      email: '',//sarah.johnson@email.com',
      phone: '',//(555) 123-4567',
      address: '',//123 Main Street, Springfield, IL 62701',
      emergencyContact: ''//Michael Johnson - (555) 987-6543'
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: true,
      pushNotifications: true,
      medicationReminders: true,
      appointmentReminders: true,
      healthAlerts: true,
      weeklyReports: false
    },
    privacy: {
      shareDataWithFamily: true,
      shareDataWithProviders: true,
      dataRetention: '2years',
      allowAnalytics: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      language: 'english'
    }
  });

  // Load settings from backend when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user-settings', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            profile: {
              name: data.profile?.name || user?.username || '',
              email: data.profile?.email || '',
              phone: data.profile?.phone || '',
              address: data.profile?.address || '',
              emergencyContact: data.profile?.emergencyContact || ''
            },
            notifications: data.notifications || prev.notifications,
            privacy: data.privacy || prev.privacy,
            appearance: data.appearance || prev.appearance
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/user-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading settings...</p>
        </div>
      ) : (
        <div className="settings-container">
        {/* Settings Navigation */}
        <div className="settings-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="tab-icon" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p>Update your personal information and contact details.</p>
              
              <div className="form-grid">
                {/* Full Name, Email, Phone, etc. */}
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    value={settings.profile.emergencyContact}
                    onChange={(e) => handleInputChange('profile', 'emergencyContact', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={settings.profile.address}
                  onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p>Choose how you want to receive alerts and reminders.</p>
              
              <div className="notification-group">
                <h3>Alert Methods</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailAlerts}
                      onChange={(e) => handleInputChange('notifications', 'emailAlerts', e.target.checked)}
                    />
                    <span>Email Alerts</span>
                  </label>
                  <p>Receive important notifications via email</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsAlerts}
                      onChange={(e) => handleInputChange('notifications', 'smsAlerts', e.target.checked)}
                    />
                    <span>SMS Alerts</span>
                  </label>
                  <p>Receive urgent notifications via text message</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                    />
                    <span>Push Notifications</span>
                  </label>
                  <p>Receive notifications in your browser</p>
                </div>
              </div>
              
              <div className="notification-group">
                <h3>Alert Types</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.medicationReminders}
                      onChange={(e) => handleInputChange('notifications', 'medicationReminders', e.target.checked)}
                    />
                    <span>Medication Reminders</span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.appointmentReminders}
                      onChange={(e) => handleInputChange('notifications', 'appointmentReminders', e.target.checked)}
                    />
                    <span>Appointment Reminders</span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.healthAlerts}
                      onChange={(e) => handleInputChange('notifications', 'healthAlerts', e.target.checked)}
                    />
                    <span>Health Alerts</span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReports}
                      onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
                    />
                    <span>Weekly Health Reports</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <p>Control how your data is shared and stored.</p>
              
              <div className="privacy-group">
                <h3>Data Sharing</h3>
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.privacy.shareDataWithFamily}
                      onChange={(e) => handleInputChange('privacy', 'shareDataWithFamily', e.target.checked)}
                    />
                    <span>Share data with family members</span>
                  </label>
                  <p>Allow family members in your care circle to view health data</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.privacy.shareDataWithProviders}
                      onChange={(e) => handleInputChange('privacy', 'shareDataWithProviders', e.target.checked)}
                    />
                    <span>Share data with healthcare providers</span>
                  </label>
                  <p>Allow healthcare providers to access relevant health information</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowAnalytics}
                      onChange={(e) => handleInputChange('privacy', 'allowAnalytics', e.target.checked)}
                    />
                    <span>Allow anonymous analytics</span>
                  </label>
                  <p>Help improve the app by sharing anonymous usage data</p>
                </div>
              </div>
              
              <div className="privacy-group">
                <h3>Data Retention</h3>
                <div className="form-group">
                  <label>Keep health data for:</label>
                  <select
                    value={settings.privacy.dataRetention}
                    onChange={(e) => handleInputChange('privacy', 'dataRetention', e.target.value)}
                  >
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="5years">5 Years</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <p>Customize the look and feel of the application.</p>
              
              <div className="appearance-group">
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Font Size</label>
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleInputChange('appearance', 'fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button 
              className="btn btn-primary" 
              onClick={saveSettings}
              disabled={saving}
            >
              <Save className="btn-icon" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button className="btn btn-secondary">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Settings;
