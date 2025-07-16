import { useState, useEffect, useCallback } from 'react';
import type { Alert } from '../types';
import { dataService } from '../services/dataService';
import { filterAlerts, calculateAlertCounts } from '../utils/alertUtils';

interface UseAlertsReturn {
  alerts: Alert[];
  filteredAlerts: Alert[];
  filterType: string;
  showOnlyUnread: boolean;
  unreadCount: number;
  criticalCount: number;
  isLoading: boolean;
  error: string | null;
  setFilterType: (filterType: string) => void;
  setShowOnlyUnread: (showOnlyUnread: boolean) => void;
  handleMarkAsRead: (id: string) => void;
  handleRemoveAlert: (id: string) => void;
  refreshAlerts: () => void;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load alerts from data service
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const alertsData = dataService.getAlerts();
      setAlerts(alertsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize alerts on component mount
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Mark alert as read
  const handleMarkAsRead = useCallback((id: string) => {
    try {
      dataService.markAlertAsRead(id);
      setAlerts(dataService.getAlerts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark alert as read');
    }
  }, []);

  // Remove alert
  const handleRemoveAlert = useCallback((id: string) => {
    try {
      dataService.removeAlert(id);
      setAlerts(dataService.getAlerts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove alert');
    }
  }, []);

  // Refresh alerts manually
  const refreshAlerts = useCallback(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Calculate filtered alerts
  const filteredAlerts = filterAlerts(alerts, filterType, showOnlyUnread);

  // Calculate alert counts
  const { unreadCount, criticalCount } = calculateAlertCounts(alerts);

  return {
    alerts,
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
  };
};
