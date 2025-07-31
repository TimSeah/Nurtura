// Refactored Dashboard Page - Uses Clean Architecture with Presentation Hooks
// Follows Single Responsibility Principle - only handles dashboard display and user interaction

import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useEvents } from '../hooks/useEvents';
import { useCareRecipients } from '../hooks/useCareRecipients';
import { useVitalSigns } from '../hooks/useVitalSigns';
import { ErrorBoundary } from '../components/ErrorBoundary';
import './Dashboard.css';

// Dashboard Summary Cards Component
interface DashboardSummaryProps {
  alertsCount: number;
  upcomingEventsCount: number;
  careRecipientsCount: number;
  abnormalVitalsCount: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  alertsCount,
  upcomingEventsCount,
  careRecipientsCount,
  abnormalVitalsCount
}) => (
  <div className="dashboard-summary">
    <div className="summary-card alerts">
      <div className="card-icon">🚨</div>
      <div className="card-content">
        <div className="card-number">{alertsCount}</div>
        <div className="card-label">Active Alerts</div>
      </div>
    </div>
    
    <div className="summary-card events">
      <div className="card-icon">📅</div>
      <div className="card-content">
        <div className="card-number">{upcomingEventsCount}</div>
        <div className="card-label">Upcoming Events</div>
      </div>
    </div>
    
    <div className="summary-card recipients">
      <div className="card-icon">👥</div>
      <div className="card-content">
        <div className="card-number">{careRecipientsCount}</div>
        <div className="card-label">Care Recipients</div>
      </div>
    </div>
    
    <div className="summary-card vitals">
      <div className="card-icon">💓</div>
      <div className="card-content">
        <div className="card-number">{abnormalVitalsCount}</div>
        <div className="card-label">Abnormal Vitals</div>
      </div>
    </div>
  </div>
);

// Recent Alerts Widget
interface RecentAlertsProps {
  alerts: any[];
  onMarkAsRead: (alertId: string) => void;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts, onMarkAsRead }) => (
  <div className="dashboard-widget recent-alerts">
    <div className="widget-header">
      <h3>Recent Alerts</h3>
      <a href="/alerts" className="view-all">View All</a>
    </div>
    <div className="widget-content">
      {alerts.length === 0 ? (
        <div className="empty-state">
          <p>No recent alerts</p>
        </div>
      ) : (
        alerts.slice(0, 5).map(alert => (
          <div key={alert.id} className={`alert-item priority-${alert.priority} ${alert.isRead ? 'read' : 'unread'}`}>
            <div className="alert-icon">{alert.typeIcon}</div>
            <div className="alert-details">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-time">{alert.createdAt.toLocaleTimeString()}</div>
            </div>
            {!alert.isRead && (
              <button 
                className="mark-read-btn"
                onClick={() => onMarkAsRead(alert.id)}
                title="Mark as read"
              >
                ✓
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

// Today's Events Widget
interface TodaysEventsProps {
  events: any[];
  onCompleteEvent: (eventId: string) => void;
}

const TodaysEvents: React.FC<TodaysEventsProps> = ({ events, onCompleteEvent }) => (
  <div className="dashboard-widget todays-events">
    <div className="widget-header">
      <h3>Today's Events</h3>
      <a href="/calendar" className="view-all">View Calendar</a>
    </div>
    <div className="widget-content">
      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events scheduled for today</p>
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className={`event-item status-${event.status}`}>
            <div className="event-time">{event.startTime}</div>
            <div className="event-details">
              <div className="event-title">{event.title}</div>
              <div className="event-type">{event.eventType}</div>
            </div>
            {event.status === 'scheduled' && (
              <button 
                className="complete-btn"
                onClick={() => onCompleteEvent(event.id)}
                title="Mark as completed"
              >
                ✓
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

// Care Recipients Widget
interface CareRecipientsWidgetProps {
  recipients: any[];
}

const CareRecipientsWidget: React.FC<CareRecipientsWidgetProps> = ({ recipients }) => (
  <div className="dashboard-widget care-recipients">
    <div className="widget-header">
      <h3>Care Recipients</h3>
      <a href="/care-circle" className="view-all">View All</a>
    </div>
    <div className="widget-content">
      {recipients.length === 0 ? (
        <div className="empty-state">
          <p>No care recipients</p>
          <a href="/care-circle" className="add-link">Add your first recipient</a>
        </div>
      ) : (
        recipients.slice(0, 4).map(recipient => (
          <div key={recipient.id} className={`recipient-item ${recipient.isActive ? 'active' : 'inactive'}`}>
            <div className="recipient-avatar">
              {recipient.name.charAt(0).toUpperCase()}
            </div>
            <div className="recipient-details">
              <div className="recipient-name">{recipient.name}</div>
              <div className="recipient-info">
                {recipient.age} years • {recipient.relationship}
              </div>
              {recipient.medicalConditions.length > 0 && (
                <div className="medical-conditions-count">
                  {recipient.medicalConditions.length} condition{recipient.medicalConditions.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Vital Signs Trends Widget
interface VitalSignsTrendsProps {
  recipientId: string;
}

const VitalSignsTrends: React.FC<VitalSignsTrendsProps> = ({ recipientId }) => {
  const { getLatestByType, getTrend } = useVitalSigns(recipientId);
  
  const vitalTypes = ['blood_pressure', 'heart_rate', 'temperature', 'blood_sugar'];
  
  return (
    <div className="dashboard-widget vital-trends">
      <div className="widget-header">
        <h3>Latest Vital Signs</h3>
        <a href="/health-monitoring" className="view-all">View All</a>
      </div>
      <div className="widget-content">
        {vitalTypes.map(type => {
          const latest = getLatestByType(type);
          const trend = getTrend(type);
          
          return (
            <div key={type} className="vital-item">
              <div className="vital-type">
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="vital-value">
                {latest ? latest.getDisplayValue() : 'No data'}
              </div>
              <div className={`vital-trend trend-${trend}`}>
                {trend === 'increasing' && '📈'}
                {trend === 'decreasing' && '📉'}
                {trend === 'stable' && '➡️'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Widget
const QuickActions: React.FC = () => (
  <div className="dashboard-widget quick-actions">
    <div className="widget-header">
      <h3>Quick Actions</h3>
    </div>
    <div className="widget-content">
      <div className="action-grid">
        <a href="/alerts" className="action-item">
          <div className="action-icon">🚨</div>
          <div className="action-label">View Alerts</div>
        </a>
        
        <a href="/calendar/new" className="action-item">
          <div className="action-icon">➕</div>
          <div className="action-label">Add Event</div>
        </a>
        
        <a href="/health-monitoring/record" className="action-item">
          <div className="action-icon">📊</div>
          <div className="action-label">Record Vitals</div>
        </a>
        
        <a href="/care-circle/new" className="action-item">
          <div className="action-icon">👤</div>
          <div className="action-label">Add Recipient</div>
        </a>
      </div>
    </div>
  </div>
);

// Loading Component
const DashboardLoading: React.FC = () => (
  <div className="dashboard-loading">
    <div className="loading-spinner"></div>
    <p>Loading your dashboard...</p>
  </div>
);

// Error Component
interface DashboardErrorProps {
  error: string;
  onRetry: () => void;
}

const DashboardError: React.FC<DashboardErrorProps> = ({ error, onRetry }) => (
  <div className="dashboard-error">
    <h3>Failed to load dashboard</h3>
    <p>{error}</p>
    <button className="btn btn-primary" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

// Main Dashboard Component
interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  // Use our clean architecture hooks
  const {
    filteredAlerts,
    isLoading: alertsLoading,
    error: alertsError,
    markAsRead,
    refreshAlerts,
    getUnreadCount,
    getActiveCount
  } = useAlerts('default-recipient');

  const {
    events,
    isLoading: eventsLoading,
    error: eventsError,
    completeEvent,
    refreshEvents,
    getTodaysEvents,
    getUpcomingCount
  } = useEvents(userId);

  const {
    careRecipients,
    isLoading: recipientsLoading,
    error: recipientsError,
    refreshCareRecipients,
    getActiveCount: getActiveCareRecipientsCount
  } = useCareRecipients(userId);

  const {
    isLoading: vitalsLoading,
    error: vitalsError,
    refreshVitalSigns,
    getAbnormalCount
  } = useVitalSigns('default-recipient');

  // Combined loading state
  const isLoading = alertsLoading || eventsLoading || recipientsLoading || vitalsLoading;
  
  // Combined error state
  const hasError = alertsError || eventsError || recipientsError || vitalsError;
  const errorMessage = alertsError || eventsError || recipientsError || vitalsError || '';

  // Refresh all data
  const refreshAll = () => {
    refreshAlerts();
    refreshEvents();
    refreshCareRecipients();
    refreshVitalSigns();
  };

  // Show loading state
  if (isLoading) {
    return <DashboardLoading />;
  }

  // Show error state
  if (hasError) {
    return <DashboardError error={errorMessage} onRetry={refreshAll} />;
  }

  const todaysEvents = getTodaysEvents();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your care management activities.</p>
      </div>

      <DashboardSummary
        alertsCount={getActiveCount()}
        upcomingEventsCount={getUpcomingCount()}
        careRecipientsCount={getActiveCareRecipientsCount()}
        abnormalVitalsCount={getAbnormalCount()}
      />

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <RecentAlerts
            alerts={filteredAlerts}
            onMarkAsRead={markAsRead}
          />
          
          <TodaysEvents
            events={todaysEvents}
            onCompleteEvent={completeEvent}
          />
        </div>

        <div className="dashboard-column">
          <CareRecipientsWidget
            recipients={careRecipients}
          />
          
          <VitalSignsTrends
            recipientId="default-recipient"
          />
        </div>

        <div className="dashboard-column">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

// Export with Error Boundary
export default function DashboardPage(props: DashboardProps) {
  return (
    <ErrorBoundary>
      <Dashboard {...props} />
    </ErrorBoundary>
  );
}
