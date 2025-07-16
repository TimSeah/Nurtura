import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import type { Alert } from '../types';
import { 
  getAlertCardClassNames, 
  getPriorityBadgeClassName, 
  getAlertIconClassName,
  formatTimestamp
} from '../utils/alertUtils';
import './AlertCard.css';

interface AlertCardProps {
  alert: Alert;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead, onRemove }) => {
  const getPriorityIcon = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Bell;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this alert?')) {
      onRemove(alert.id);
    }
  };

  const PriorityIcon = getPriorityIcon(alert.priority);

  return (
    <div className={getAlertCardClassNames(alert)}>
      <div className={getAlertIconClassName(alert.priority)}>
        <PriorityIcon />
      </div>
      <div className="alert-content">
        <div className="alert-header">
          <h3>{alert.title}</h3>
          <div className="alert-meta">
            <span className={getPriorityBadgeClassName(alert.priority)}>
              {(alert.priority || 'default').toUpperCase()}
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
            onClick={() => onMarkAsRead(alert.id)}
            aria-label={`Mark ${alert.title} as read`}
          >
            <CheckCircle className="btn-icon" />
            Mark Read
          </button>
        )}
        <button 
          className="btn btn-sm btn-secondary"
          onClick={handleRemove}
          aria-label={`Remove ${alert.title} alert`}
        >
          <X className="btn-icon" />
          Remove
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
