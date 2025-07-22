import React from 'react';
import { Bell } from 'lucide-react';
import { getEmptyStateMessage } from '../utils/alertUtils';

interface EmptyAlertsStateProps {
  filterType: string;
  showOnlyUnread: boolean;
}

const EmptyAlertsState: React.FC<EmptyAlertsStateProps> = ({ filterType, showOnlyUnread }) => {
  return (
    <div className="no-alerts">
      <Bell className="no-alerts-icon" />
      <h3>No alerts found</h3>
      <p>{getEmptyStateMessage(filterType, showOnlyUnread)}</p>
    </div>
  );
};

export default EmptyAlertsState;
