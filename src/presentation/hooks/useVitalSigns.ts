// Clean Architecture: Vital Signs Hook
// Follows Dependency Inversion - depends on abstractions (use cases) not concrete implementations

import { useState, useEffect, useCallback } from 'react';
import { VitalSigns } from '../../core/entities/VitalSigns';
import { container } from '../../shared/DIContainer';

// Mock logger for now - will be integrated with actual logger later
const Logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data)
};

// Type definitions for hook parameters and return values
export interface UseVitalSignsFilters {
  type?: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_glucose' | 'oxygen_saturation' | 'all';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  showOnlyAbnormal?: boolean;
  recipientId?: string;
}

export interface RecordVitalSignsData {
  recipientId: string;
  type: string;
  value: number;
  unit: string;
  recordedAt?: Date;
  notes?: string;
  systolic?: number; // For blood pressure
  diastolic?: number; // For blood pressure
}

// Custom hook for managing vital signs
export function useVitalSigns(recipientId: string) {
  // State management following immutable patterns
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [filteredVitalSigns, setFilteredVitalSigns] = useState<VitalSigns[]>([]);
  const [filters, setFilters] = useState<UseVitalSignsFilters>({
    type: 'all',
    showOnlyAbnormal: false,
    recipientId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get use cases from dependency injection container
  const recordVitalSignsUseCase = container.get<any>('recordVitalSignsUseCase');
  const getVitalSignsForRecipientUseCase = container.get<any>('getVitalSignsForRecipientUseCase');
  const getVitalSignsByTypeUseCase = container.get<any>('getVitalSignsByTypeUseCase');
  const getRecentVitalSignsUseCase = container.get<any>('getRecentVitalSignsUseCase');
  const getVitalSignsByDateRangeUseCase = container.get<any>('getVitalSignsByDateRangeUseCase');
  const getAbnormalVitalSignsUseCase = container.get<any>('getAbnormalVitalSignsUseCase');

  // Filter vital signs based on current filters
  const applyFilters = useCallback((signs: VitalSigns[], currentFilters: UseVitalSignsFilters): VitalSigns[] => {
    return signs.filter(sign => {
      // Type filter
      if (currentFilters.type && currentFilters.type !== 'all' && 
          sign.vitalType !== currentFilters.type) {
        return false;
      }

      // Date range filter
      if (currentFilters.dateRange) {
        const recordedDate = sign.recordedAt;
        if (recordedDate < currentFilters.dateRange.startDate || 
            recordedDate > currentFilters.dateRange.endDate) {
          return false;
        }
      }

      // Abnormal filter
      if (currentFilters.showOnlyAbnormal && !sign.isAbnormal) {
        return false;
      }

      return true;
    });
  }, []);

  // Load vital signs for recipient
  const loadVitalSigns = useCallback(async () => {
    if (!recipientId) return;

    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Loading vital signs for recipient', { recipientId });
      
      const result = await getVitalSignsForRecipientUseCase.execute(recipientId);
      
      if (result && Array.isArray(result)) {
        setVitalSigns(result);
        Logger.info('Vital signs loaded successfully', { count: result.length });
      } else {
        const errorMessage = 'Failed to load vital signs';
        setError(errorMessage);
        Logger.error('Failed to load vital signs', { recipientId });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while loading vital signs';
      setError(errorMessage);
      Logger.error('Unexpected error loading vital signs', { error: err, recipientId });
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, getVitalSignsForRecipientUseCase]);

  // Record new vital signs
  const recordVitalSigns = useCallback(async (data: RecordVitalSignsData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Recording vital signs', { type: data.type, recipientId: data.recipientId });
      
      const result = await recordVitalSignsUseCase.execute({
        ...data,
        recordedAt: data.recordedAt || new Date()
      });
      
      if (result) {
        // Update local state with new vital signs
        setVitalSigns(prev => [result, ...prev]);
        Logger.info('Vital signs recorded successfully', { type: data.type });
        return true;
      } else {
        const errorMessage = 'Failed to record vital signs';
        setError(errorMessage);
        Logger.error('Failed to record vital signs', { type: data.type });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while recording vital signs';
      setError(errorMessage);
      Logger.error('Unexpected error recording vital signs', { error: err, type: data.type });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [recordVitalSignsUseCase]);

  // Get vital signs by type
  const getVitalSignsByType = useCallback(async (type: string): Promise<VitalSigns[]> => {
    try {
      Logger.info('Getting vital signs by type', { type, recipientId });
      
      const result = await getVitalSignsByTypeUseCase.execute(recipientId, type);
      
      if (result && Array.isArray(result)) {
        Logger.info('Vital signs by type retrieved successfully', { type, count: result.length });
        return result;
      } else {
        Logger.error('Failed to get vital signs by type', { type, recipientId });
        return [];
      }
    } catch (err) {
      Logger.error('Unexpected error getting vital signs by type', { error: err, type, recipientId });
      return [];
    }
  }, [recipientId, getVitalSignsByTypeUseCase]);

  // Get recent vital signs
  const getRecentVitalSigns = useCallback(async (limit: number = 10): Promise<VitalSigns[]> => {
    try {
      Logger.info('Getting recent vital signs', { limit });
      
      const result = await getRecentVitalSignsUseCase.execute(limit);
      
      if (result && Array.isArray(result)) {
        Logger.info('Recent vital signs retrieved successfully', { count: result.length });
        return result;
      } else {
        Logger.error('Failed to get recent vital signs');
        return [];
      }
    } catch (err) {
      Logger.error('Unexpected error getting recent vital signs', { error: err });
      return [];
    }
  }, [getRecentVitalSignsUseCase]);

  // Get vital signs by date range
  const getVitalSignsByDateRange = useCallback(async (startDate: Date, endDate: Date): Promise<VitalSigns[]> => {
    try {
      Logger.info('Getting vital signs by date range', { startDate, endDate, recipientId });
      
      const result = await getVitalSignsByDateRangeUseCase.execute(recipientId, startDate, endDate);
      
      if (result && Array.isArray(result)) {
        Logger.info('Vital signs by date range retrieved successfully', { count: result.length });
        return result;
      } else {
        Logger.error('Failed to get vital signs by date range', { recipientId });
        return [];
      }
    } catch (err) {
      Logger.error('Unexpected error getting vital signs by date range', { error: err, recipientId });
      return [];
    }
  }, [recipientId, getVitalSignsByDateRangeUseCase]);

  // Get abnormal vital signs
  const getAbnormalVitalSigns = useCallback(async (): Promise<VitalSigns[]> => {
    try {
      Logger.info('Getting abnormal vital signs', { recipientId });
      
      const result = await getAbnormalVitalSignsUseCase.execute(recipientId);
      
      if (result && Array.isArray(result)) {
        Logger.info('Abnormal vital signs retrieved successfully', { count: result.length });
        return result;
      } else {
        Logger.error('Failed to get abnormal vital signs', { recipientId });
        return [];
      }
    } catch (err) {
      Logger.error('Unexpected error getting abnormal vital signs', { error: err, recipientId });
      return [];
    }
  }, [recipientId, getAbnormalVitalSignsUseCase]);

  // Refresh vital signs data
  const refreshVitalSigns = useCallback(() => {
    loadVitalSigns();
  }, [loadVitalSigns]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = applyFilters(vitalSigns, filters);
    setFilteredVitalSigns(filtered);
  }, [vitalSigns, filters, applyFilters]);

  // Load initial data
  useEffect(() => {
    loadVitalSigns();
  }, [loadVitalSigns]);

  // Computed values
  const getTotalCount = useCallback(() => vitalSigns.length, [vitalSigns]);
  const getAbnormalCount = useCallback(() => vitalSigns.filter(v => v.isAbnormal).length, [vitalSigns]);
  const getTypeCount = useCallback((type: string) => vitalSigns.filter(v => v.vitalType === type).length, [vitalSigns]);
  const getLatestByType = useCallback((type: string) => {
    const typeVitals = vitalSigns.filter(v => v.vitalType === type);
    return typeVitals.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0] || null;
  }, [vitalSigns]);

  // Get vital signs trends
  const getTrend = useCallback((type: string, days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentVitals = vitalSigns
      .filter(v => v.vitalType === type && v.recordedAt >= cutoffDate)
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
    
    if (recentVitals.length < 2) return 'stable';
    
    const firstValue = parseFloat(recentVitals[0].value);
    const lastValue = parseFloat(recentVitals[recentVitals.length - 1].value);
    
    if (isNaN(firstValue) || isNaN(lastValue)) return 'stable';
    
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    if (percentChange > 5) return 'increasing';
    if (percentChange < -5) return 'decreasing';
    return 'stable';
  }, [vitalSigns]);

  return {
    // Data
    vitalSigns,
    filteredVitalSigns,
    filters,
    
    // State
    isLoading,
    error,
    
    // Actions
    setFilters,
    recordVitalSigns,
    getVitalSignsByType,
    getRecentVitalSigns,
    getVitalSignsByDateRange,
    getAbnormalVitalSigns,
    refreshVitalSigns,
    
    // Computed values
    getTotalCount,
    getAbnormalCount,
    getTypeCount,
    getLatestByType,
    getTrend
  };
}
