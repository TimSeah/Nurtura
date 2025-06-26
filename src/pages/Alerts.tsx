import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X, Filter } from 'lucide-react';
import type { Alert } from '../types';
import { dataService } from '../services/dataService';

const Alerts: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setAlerts(dataService.getAlerts());
  }, []);

  const handleMarkAsRead = (id: string) => {
    dataService.markAlertAsRead(id);
    setAlerts(dataService.getAlerts());
  };

  const handleRemoveAlert = (id: string) => {
    if (window.confirm('Are you sure you want to remove this alert?')) {
      dataService.removeAlert(id);
      setAlerts(dataService.getAlerts());
    }
  };

  const alertTypes = [
    { value: 'all', label: 'All Alerts' },
    { value: 'medication', label: 'Medication' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'health', label: 'Health' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'reminder', label: 'Reminders' }
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesReadStatus = !showOnlyUnread || !alert.isRead;
    return matchesType && matchesReadStatus;
  });

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return '#c62828'; // Mayo Clinic red
      case 'high': return '#ef6c00'; // Mayo Clinic orange
      case 'medium': return '#f57f17'; // Mayo Clinic amber
      case 'low': return '#2e7d32'; // Mayo Clinic green
      default: return '#616161'; // Mayo Clinic gray
    }
  };

  const getPriorityBorderColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return '#ffebee'; // Light red background
      case 'high': return '#fff3e0'; // Light orange background
      case 'medium': return '#fff8e1'; // Light amber background
      case 'low': return '#e8f5e8'; // Light green background
      default: return '#fafafa'; // Light gray background
    }
  };

  const getPriorityIcon = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Bell;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead).length;

  return (
    <div className="alerts">
      <div className="page-header">
        <h1>Alerts & Notifications</h1>
        <p>Stay updated with important notifications and reminders for your care recipients.</p>
      </div>

      {/* Alert Summary */}
      <div className="alert-summary">
        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#e1f5fe', color: '#0078d4' }}>
            <Bell />
          </div>
          <div className="summary-info">
            <h3>{unreadCount}</h3>
            <p>Unread Alerts</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#ffebee', color: '#c62828' }}>
            <AlertTriangle />
          </div>
          <div className="summary-info">
            <h3>{criticalCount}</h3>
            <p>Critical Alerts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="alert-filters">
          <div className="filter-group">
            <Filter className="filter-icon" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              {alertTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-toggle">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
              />
              Show only unread
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-container">
        {filteredAlerts.map(alert => {
          const PriorityIcon = getPriorityIcon(alert.priority);
          return (
            <div 
              key={alert.id} 
              className={`alert-card ${alert.isRead ? 'read' : 'unread'}`}
              style={{
                borderLeft: `4px solid ${getPriorityColor(alert.priority)}`,
                backgroundColor: alert.isRead ? '#ffffff' : getPriorityBorderColor(alert.priority)
              }}
            >
              <div className="alert-icon">
                <PriorityIcon style={{ color: getPriorityColor(alert.priority) }} />
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h3>{alert.title}</h3>
                  <div className="alert-meta">
                    <span className={`priority-badge ${alert.priority}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    {alert.recipient && (
                      <span className="care-recipient">{alert.recipient}</span>
                    )}
                  </div>
                </div>
                <p className="alert-description">{alert.description}</p>
                <div className="alert-footer">
                  <div className="alert-time">
                    <Clock className="time-icon" />
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                  {alert.actionRequired && (
                    <span className="action-required">Action Required</span>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                {!alert.isRead && (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    <CheckCircle className="btn-icon" />
                    Mark Read
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleRemoveAlert(alert.id)}
                >
                  <X className="btn-icon" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="no-alerts">
          <Bell className="no-alerts-icon" />
          <h3>No alerts found</h3>
          <p>
            {filterType === 'all' && !showOnlyUnread 
              ? "You're all caught up! No alerts at this time."
              : "No alerts match your current filter criteria."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
