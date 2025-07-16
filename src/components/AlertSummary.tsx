import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { getSummaryIconClassName } from '../utils/alertUtils';

interface AlertSummaryProps {
  unreadCount: number;
  criticalCount: number;
}

const AlertSummary: React.FC<AlertSummaryProps> = ({ unreadCount, criticalCount }) => {
  return (
    <div className="alert-summary">
      <div className="summary-card">
        <div className={getSummaryIconClassName('unread')}>
          <Bell />
        </div>
        <div className="summary-info">
          <h3>{unreadCount}</h3>
          <p>Unread Alerts</p>
        </div>
      </div>
      <div className="summary-card">
        <div className={getSummaryIconClassName('critical')}>
          <AlertTriangle />
        </div>
        <div className="summary-info">
          <h3>{criticalCount}</h3>
          <p>Critical Alerts</p>
        </div>
      </div>
    </div>
  );
};

export default AlertSummary;
