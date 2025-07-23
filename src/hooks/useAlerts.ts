import { useState, useEffect, useCallback } from 'react';
import type { Alert } from '../types';
import { apiService } from '../services/apiService';
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

  // Load alerts from backend API  
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Using a default recipient ID 
      // - in a real app, this would come from auth context
      const alertsData = await apiService.getAlerts('1'); // Default recipient ID
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
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await apiService.markAlertAsRead(id);
      // Reload alerts after marking as read
      loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark alert as read');
    }
  }, [loadAlerts]);

  // Remove alert
  const handleRemoveAlert = useCallback(async (id: string) => {
    try {
      await apiService.deleteAlert(id);
      // Reload alerts after deletion
      loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove alert');
    }
  }, [loadAlerts]);

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
