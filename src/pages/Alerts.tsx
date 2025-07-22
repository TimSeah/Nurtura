import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import AlertSummary from '../components/AlertSummary';
import AlertFilters from '../components/AlertFilters';
import AlertCard from '../components/AlertCard';
import EmptyAlertsState from '../components/EmptyAlertsState';
import './Alerts.css';

const Alerts: React.FC = () => {
  const {
    filteredAlerts,
    filterType,
    showOnlyUnread,
    unreadCount,
    criticalCount,
    isLoading,
    error,
    setFilterType,
    setShowOnlyUnread,
    handleMarkAsRead,
    handleRemoveAlert,
    refreshAlerts
  } = useAlerts();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="alerts">
        <div className="page-header">
          <h1>Alerts & Notifications</h1>
          <p>Loading your alerts...</p>
        </div>
        <div className="loading-state">
          <p>Please wait while we load your alerts.</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="alerts">
        <div className="page-header">
          <h1>Alerts & Notifications</h1>
          <p>There was an error loading your alerts.</p>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={refreshAlerts}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts">
      <div className="page-header">
        <h1>Alerts & Notifications</h1>
        <p>Stay updated with important notifications and reminders for your care recipients.</p>
      </div>

      <AlertSummary unreadCount={unreadCount} criticalCount={criticalCount} />

      <AlertFilters
        filterType={filterType}
        showOnlyUnread={showOnlyUnread}
        onFilterTypeChange={setFilterType}
        onShowOnlyUnreadChange={setShowOnlyUnread}
      />

      <div className="alerts-container">
        {filteredAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onMarkAsRead={handleMarkAsRead}
            onRemove={handleRemoveAlert}
          />
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <EmptyAlertsState filterType={filterType} showOnlyUnread={showOnlyUnread} />
      )}
    </div>
  );
};

export default Alerts;
