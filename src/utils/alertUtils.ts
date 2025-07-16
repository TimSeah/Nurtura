// Alert utility functions and constants
import type { Alert } from '../types';

// Constants for priority colors and styling
export const PRIORITY_COLORS = {
  critical: '#c62828',
  high: '#ef6c00',
  medium: '#f57f17',
  low: '#2e7d32',
  default: '#616161'
} as const;

export const PRIORITY_BACKGROUNDS = {
  critical: '#ffebee',
  high: '#fff3e0',
  medium: '#fff8e1',
  low: '#e8f5e8',
  default: '#fafafa'
} as const;

// Filter types for alerts
export const ALERT_FILTER_TYPES = [
  { value: 'all', label: 'All Alerts' },
  { value: 'medication', label: 'Medication' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'health', label: 'Health' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'reminder', label: 'Reminders' }
] as const;

// Utility function to get priority color
export const getPriorityColor = (priority: Alert['priority']): string => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.default;
};

// Utility function to get priority background color
export const getPriorityBorderColor = (priority: Alert['priority']): string => {
  return PRIORITY_BACKGROUNDS[priority] || PRIORITY_BACKGROUNDS.default;
};

// Utility function to format timestamp
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Utility function to get CSS class names for alert cards
export const getAlertCardClassNames = (alert: Alert): string => {
  const baseClasses = ['alert-card'];
  
  if (!alert.isRead) {
    baseClasses.push('alert-card--unread');
  }
  
  baseClasses.push(`alert-card--${alert.priority || 'default'}`);
  
  return baseClasses.join(' ');
};

// Utility function to get CSS class names for priority badges
export const getPriorityBadgeClassName = (priority: Alert['priority']): string => {
  return `priority-badge priority-badge--${priority || 'default'}`;
};

// Utility function to get CSS class names for alert icons
export const getAlertIconClassName = (priority: Alert['priority']): string => {
  return `alert-icon alert-icon--${priority || 'default'}`;
};

// Utility function to get summary icon class names
export const getSummaryIconClassName = (type: 'unread' | 'critical'): string => {
  return `summary-icon summary-icon--${type}`;
};

// Utility function to filter alerts
export const filterAlerts = (
  alerts: Alert[], 
  filterType: string, 
  showOnlyUnread: boolean
): Alert[] => {
  return alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesReadStatus = !showOnlyUnread || !alert.isRead;
    return matchesType && matchesReadStatus;
  });
};

// Utility function to get empty state message
export const getEmptyStateMessage = (filterType: string, showOnlyUnread: boolean): string => {
  if (filterType === 'all' && !showOnlyUnread) {
    return "You're all caught up! No alerts at this time.";
  }
  return "No alerts match your current filter criteria.";
};

// Utility function to calculate alert counts
export const calculateAlertCounts = (alerts: Alert[]) => {
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead).length;
  
  return { unreadCount, criticalCount };
};
