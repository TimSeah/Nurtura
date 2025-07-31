// Refactored Alerts Hook - Uses Clean Architecture with Use Cases
// Follows Single Responsibility Principle - only handles alert state management

import { useState, useEffect, useCallback } from 'react';
import { container } from '../../shared/DIContainer';
import {
  GetAlertsForRecipientUseCase,
  GetUnreadAlertsUseCase,
  GetActiveAlertsUseCase,
  GetAlertsByTypeUseCase,
  GetAlertsByPriorityUseCase,
  MarkAlertAsReadUseCase,
  MarkAllAlertsAsReadUseCase,
  ResolveAlertUseCase
} from '../../core/use-cases/AlertUseCases';
import { Alert } from '../../core/entities/Alert';
import { ILogger } from '../../core/interfaces/IServices';

export interface UseAlertsFilters {
  type?: string;
  priority?: string;
  showOnlyUnread?: boolean;
  showOnlyActive?: boolean;
}

export interface UseAlertsReturn {
  alerts: Alert[];
  filteredAlerts: Alert[];
  unreadAlerts: Alert[];
  activeAlerts: Alert[];
  filters: UseAlertsFilters;
  isLoading: boolean;
  error: string | null;
  // Actions
  setFilters: (filters: UseAlertsFilters) => void;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: (recipientId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  // Statistics
  getTotalCount: () => number;
  getUnreadCount: () => number;
  getActiveCount: () => number;
  getCriticalCount: () => number;
}

export function useAlerts(recipientId: string): UseAlertsReturn {
  // State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [filters, setFiltersState] = useState<UseAlertsFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dependencies from DI Container
  const logger = container.getLogger();
  const getAlertsUseCase = container.get<GetAlertsForRecipientUseCase>('getAlertsForRecipientUseCase');
  const getUnreadAlertsUseCase = container.get<GetUnreadAlertsUseCase>('getUnreadAlertsUseCase');
  const getActiveAlertsUseCase = container.get<GetActiveAlertsUseCase>('getActiveAlertsUseCase');
  const getAlertsByTypeUseCase = container.get<GetAlertsByTypeUseCase>('getAlertsByTypeUseCase');
  const getAlertsByPriorityUseCase = container.get<GetAlertsByPriorityUseCase>('getAlertsByPriorityUseCase');
  const markAsReadUseCase = container.get<MarkAlertAsReadUseCase>('markAlertAsReadUseCase');
  const markAllAsReadUseCase = container.get<MarkAllAlertsAsReadUseCase>('markAllAlertsAsReadUseCase');
  const resolveAlertUseCase = container.get<ResolveAlertUseCase>('resolveAlertUseCase');

  // Load all alerts for the recipient
  const loadAlerts = useCallback(async () => {
    if (!recipientId) return;

    try {
      setIsLoading(true);
      setError(null);

      logger.info('Loading alerts for recipient', { recipientId });

      // Load different types of alerts in parallel
      const [
        allAlerts,
        unreadAlertsData,
        activeAlertsData
      ] = await Promise.all([
        getAlertsUseCase.execute(recipientId),
        getUnreadAlertsUseCase.execute(recipientId),
        getActiveAlertsUseCase.execute(recipientId)
      ]);

      setAlerts(allAlerts);
      setUnreadAlerts(unreadAlertsData);
      setActiveAlerts(activeAlertsData);

      logger.info('Alerts loaded successfully', { 
        recipientId,
        totalCount: allAlerts.length,
        unreadCount: unreadAlertsData.length,
        activeCount: activeAlertsData.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(errorMessage);
      logger.error('Failed to load alerts', err as Error, { recipientId });
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, getAlertsUseCase, getUnreadAlertsUseCase, getActiveAlertsUseCase, logger]);

  // Apply filters to alerts
  const applyFilters = useCallback(async () => {
    let filtered = [...alerts];

    try {
      // Filter by type
      if (filters.type && filters.type !== 'all') {
        filtered = await getAlertsByTypeUseCase.execute(recipientId, filters.type);
      }

      // Filter by priority
      if (filters.priority && filters.priority !== 'all') {
        const priorityFiltered = await getAlertsByPriorityUseCase.execute(recipientId, filters.priority);
        if (filters.type && filters.type !== 'all') {
          // Intersection of type and priority filters
          filtered = filtered.filter(alert => 
            priorityFiltered.some(pAlert => pAlert.id === alert.id)
          );
        } else {
          filtered = priorityFiltered;
        }
      }

      // Filter by unread status
      if (filters.showOnlyUnread) {
        filtered = filtered.filter(alert => !alert.isRead);
      }

      // Filter by active status
      if (filters.showOnlyActive) {
        filtered = filtered.filter(alert => !alert.isResolved);
      }

      setFilteredAlerts(filtered);

    } catch (err) {
      logger.error('Failed to apply filters', err as Error, { recipientId, filters });
      setFilteredAlerts(alerts); // Fallback to all alerts
    }
  }, [alerts, filters, recipientId, getAlertsByTypeUseCase, getAlertsByPriorityUseCase, logger]);

  // Set filters and trigger re-filtering
  const setFilters = useCallback((newFilters: UseAlertsFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Mark alert as read
  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await markAsReadUseCase.execute(alertId);
      
      // Update local state using entity methods
      setAlerts(prev => prev.map(alert => {
        if (alert.id === alertId) {
          alert.markAsRead();
          return alert;
        }
        return alert;
      }));
      setUnreadAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      logger.info('Alert marked as read', { alertId, recipientId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark alert as read';
      setError(errorMessage);
      logger.error('Failed to mark alert as read', err as Error, { alertId, recipientId });
    }
  }, [markAsReadUseCase, logger, recipientId]);

  // Mark all alerts as read
  const markAllAsRead = useCallback(async (recipientId: string) => {
    try {
      await markAllAsReadUseCase.execute(recipientId);
      
      // Update local state using entity methods
      setAlerts(prev => prev.map(alert => {
        alert.markAsRead();
        return alert;
      }));
      setUnreadAlerts([]);
      
      logger.info('All alerts marked as read', { recipientId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all alerts as read';
      setError(errorMessage);
      logger.error('Failed to mark all alerts as read', err as Error, { recipientId });
    }
  }, [markAllAsReadUseCase, logger]);

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await resolveAlertUseCase.execute(alertId);
      
      // Update local state using entity methods
      setAlerts(prev => prev.map(alert => {
        if (alert.id === alertId) {
          alert.resolve();
          return alert;
        }
        return alert;
      }));
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      logger.info('Alert resolved', { alertId, recipientId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alert';
      setError(errorMessage);
      logger.error('Failed to resolve alert', err as Error, { alertId, recipientId });
    }
  }, [resolveAlertUseCase, logger, recipientId]);

  // Refresh alerts
  const refreshAlerts = useCallback(async () => {
    await loadAlerts();
  }, [loadAlerts]);

  // Statistics
  const getTotalCount = useCallback(() => alerts.length, [alerts]);
  const getUnreadCount = useCallback(() => unreadAlerts.length, [unreadAlerts]);
  const getActiveCount = useCallback(() => activeAlerts.length, [activeAlerts]);
  const getCriticalCount = useCallback(() => 
    alerts.filter(alert => alert.priority === 'urgent' || alert.priority === 'high').length,
    [alerts]
  );

  // Effects
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    alerts,
    filteredAlerts,
    unreadAlerts,
    activeAlerts,
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
  };
}
