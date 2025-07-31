// Refactored Alerts Page - Uses Clean Architecture with Error Boundaries
// Follows Single Responsibility Principle - only handles alert display and user interaction

import React, { useState } from 'react';
import { useAlerts, UseAlertsFilters } from '../hooks/useAlerts';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Alert } from '../../core/entities/Alert';
import './Alerts.css';

// Alert Summary Component
interface AlertSummaryProps {
  totalCount: number;
  unreadCount: number;
  activeCount: number;
  criticalCount: number;
}

const AlertSummary: React.FC<AlertSummaryProps> = ({
  totalCount,
  unreadCount,
  activeCount,
  criticalCount
}) => (
  <div className="alert-summary">
    <div className="summary-card">
      <div className="summary-number">{totalCount}</div>
      <div className="summary-label">Total Alerts</div>
    </div>
    <div className="summary-card unread">
      <div className="summary-number">{unreadCount}</div>
      <div className="summary-label">Unread</div>
    </div>
    <div className="summary-card active">
      <div className="summary-number">{activeCount}</div>
      <div className="summary-label">Active</div>
    </div>
    <div className="summary-card critical">
      <div className="summary-number">{criticalCount}</div>
      <div className="summary-label">Critical</div>
    </div>
  </div>
);

// Alert Filters Component
interface AlertFiltersProps {
  filters: UseAlertsFilters;
  onFiltersChange: (filters: UseAlertsFilters) => void;
}

const AlertFilters: React.FC<AlertFiltersProps> = ({ filters, onFiltersChange }) => {
  return (
    <div className="alert-filters">
      <div className="filter-group">
        <label htmlFor="type-filter">Type:</label>
        <select
          id="type-filter"
          value={filters.type || 'all'}
          onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="medication">Medication</option>
          <option value="appointment">Appointment</option>
          <option value="vital_signs">Vital Signs</option>
          <option value="emergency">Emergency</option>
          <option value="reminder">Reminder</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priority-filter">Priority:</label>
        <select
          id="priority-filter"
          value={filters.priority || 'all'}
          onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.showOnlyUnread || false}
            onChange={(e) => onFiltersChange({ ...filters, showOnlyUnread: e.target.checked })}
          />
          Show only unread
        </label>
      </div>

      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.showOnlyActive || false}
            onChange={(e) => onFiltersChange({ ...filters, showOnlyActive: e.target.checked })}
          />
          Show only active
        </label>
      </div>
    </div>
  );
};

// Alert Card Component
interface AlertCardProps {
  alert: Alert;
  onMarkAsRead: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead, onResolve }) => {
  return (
    <div className={`alert-card priority-${alert.priority} ${alert.isRead ? 'read' : 'unread'}`}>
      <div className="alert-header">
        <span className="alert-icon" role="img" aria-label={alert.type}>
          {alert.typeIcon}
        </span>
        <div className="alert-meta">
          <span className="alert-type">{alert.type}</span>
          <span className="alert-priority" style={{ color: alert.priorityColor }}>
            {alert.priority}
          </span>
        </div>
        <div className="alert-actions">
          {!alert.isRead && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onMarkAsRead(alert.id)}
              title="Mark as read"
            >
              Mark Read
            </button>
          )}
          {!alert.isResolved && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onResolve(alert.id)}
              title="Resolve alert"
            >
              Resolve
            </button>
          )}
        </div>
      </div>
      
      <div className="alert-content">
        <h3 className="alert-title">{alert.title}</h3>
        <p className="alert-description">{alert.description}</p>
        
        <div className="alert-footer">
          <span className="alert-time">
            {alert.createdAt.toLocaleDateString()} at {alert.createdAt.toLocaleTimeString()}
          </span>
          {alert.isResolved && alert.resolvedAt && (
            <span className="alert-resolved">
              Resolved on {alert.resolvedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Component
const AlertsLoading: React.FC = () => (
  <div className="alerts-loading">
    <div className="loading-spinner"></div>
    <p>Loading your alerts...</p>
  </div>
);

// Error Component
interface AlertsErrorProps {
  error: string;
  onRetry: () => void;
}

const AlertsError: React.FC<AlertsErrorProps> = ({ error, onRetry }) => (
  <div className="alerts-error">
    <h3>Failed to load alerts</h3>
    <p>{error}</p>
    <button className="btn btn-primary" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

// Empty State Component
interface AlertsEmptyProps {
  filters: UseAlertsFilters;
}

const AlertsEmpty: React.FC<AlertsEmptyProps> = ({ filters }) => {
  const hasFilters = filters.type !== 'all' || filters.priority !== 'all' || 
                    filters.showOnlyUnread || filters.showOnlyActive;

  return (
    <div className="alerts-empty">
      <div className="empty-icon">📭</div>
      <h3>
        {hasFilters ? 'No alerts match your filters' : 'No alerts yet'}
      </h3>
      <p>
        {hasFilters 
          ? 'Try adjusting your filters to see more alerts.'
          : 'You\'ll see alerts and notifications here when they arrive.'
        }
      </p>
    </div>
  );
};

// Main Alerts Component
interface AlertsProps {
  recipientId?: string;
}

const Alerts: React.FC<AlertsProps> = ({ recipientId = 'default-recipient' }) => {
  const {
    filteredAlerts,
    filters,
    isLoading,
    error,
    setFilters,
    markAsRead,
    markAllAsRead,
    resolveAlert,
    refreshAlerts,
    getTotalCount,
    getUnreadCount,
    getActiveCount,
    getCriticalCount
  } = useAlerts(recipientId);

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const handleMarkAllAsRead = async () => {
    if (getUnreadCount() === 0) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead(recipientId);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <AlertsLoading />;
  }

  // Error state
  if (error) {
    return <AlertsError error={error} onRetry={refreshAlerts} />;
  }

  return (
    <div className="alerts">
      <div className="page-header">
        <div className="header-content">
          <h1>Alerts & Notifications</h1>
          <p>Stay updated with important notifications and reminders for your care recipients.</p>
        </div>
        
        {getUnreadCount() > 0 && (
          <button
            className="btn btn-outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? 'Marking all read...' : `Mark All Read (${getUnreadCount()})`}
          </button>
        )}
      </div>

      <AlertSummary
        totalCount={getTotalCount()}
        unreadCount={getUnreadCount()}
        activeCount={getActiveCount()}
        criticalCount={getCriticalCount()}
      />

      <AlertFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <AlertsEmpty filters={filters} />
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkAsRead={markAsRead}
              onResolve={resolveAlert}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Export with Error Boundary
export default function AlertsPage(props: AlertsProps) {
  return (
    <ErrorBoundary>
      <Alerts {...props} />
    </ErrorBoundary>
  );
}
