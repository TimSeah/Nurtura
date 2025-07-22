import React from 'react';
// import { Filter } from 'lucide-react';
import { ALERT_FILTER_TYPES } from '../utils/alertUtils';

interface AlertFiltersProps {
  filterType: string;
  showOnlyUnread: boolean;
  onFilterTypeChange: (filterType: string) => void;
  onShowOnlyUnreadChange: (showOnlyUnread: boolean) => void;
}

const AlertFilters: React.FC<AlertFiltersProps> = ({
  filterType,
  showOnlyUnread,
  onFilterTypeChange,
  onShowOnlyUnreadChange
}) => {
  return (
    <div className="card">
      <div className="alert-filters">
        <div className="filter-group">
          {/* <Filter className="filter-icon" /> */}
          <select 
            value={filterType} 
            onChange={(e) => onFilterTypeChange(e.target.value)}
            aria-label="Filter alerts by type"
          >
            {ALERT_FILTER_TYPES.map(type => (
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
              onChange={(e) => onShowOnlyUnreadChange(e.target.checked)}
              aria-label="Show only unread alerts"
            />
            Show only unread
          </label>
        </div>
      </div>
    </div>
  );
};

export default AlertFilters;
