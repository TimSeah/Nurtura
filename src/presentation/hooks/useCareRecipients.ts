// Clean Architecture: Care Recipients Hook
// Follows Dependency Inversion - depends on abstractions (use cases) not concrete implementations

import { useState, useEffect, useCallback } from 'react';
import { CareRecipient } from '../../core/entities/CareRecipient';
import { container } from '../../shared/DIContainer';

// Mock logger for now - will be integrated with actual logger later
const Logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data)
};

// Type definitions for hook parameters and return values
export interface UseCareRecipientsFilters {
  relationship?: string;
  ageRange?: 'child' | 'adult' | 'elderly' | 'all';
  hasHealthConditions?: boolean;
  showArchived?: boolean;
}

export interface CreateCareRecipientData {
  name: string;
  dateOfBirth: Date;
  relationship: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  medicalInfo?: {
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    bloodType?: string;
    emergencyContact?: string;
  };
  notes?: string;
}

export interface UpdateCareRecipientData extends Partial<CreateCareRecipientData> {
  id: string;
  isActive?: boolean;
}

// Custom hook for managing care recipients
export function useCareRecipients(userId: string) {
  // State management following immutable patterns
  const [careRecipients, setCareRecipients] = useState<CareRecipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<CareRecipient[]>([]);
  const [filters, setFilters] = useState<UseCareRecipientsFilters>({
    relationship: 'all',
    ageRange: 'all',
    hasHealthConditions: false,
    showArchived: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get use cases from dependency injection container
  const getAllCareRecipientsUseCase = container.get<any>('getCareRecipientsUseCase');
  const getCareRecipientByIdUseCase = container.get<any>('getCareRecipientByIdUseCase');
  const createCareRecipientUseCase = container.get<any>('createCareRecipientUseCase');
  const updateCareRecipientUseCase = container.get<any>('updateCareRecipientUseCase');
  const deleteCareRecipientUseCase = container.get<any>('deactivateCareRecipientUseCase');

  // Filter care recipients based on current filters
  const applyFilters = useCallback((recipients: CareRecipient[], currentFilters: UseCareRecipientsFilters): CareRecipient[] => {
    return recipients.filter(recipient => {
      // Relationship filter
      if (currentFilters.relationship && currentFilters.relationship !== 'all' && 
          recipient.relationship !== currentFilters.relationship) {
        return false;
      }

      // Age range filter
      if (currentFilters.ageRange && currentFilters.ageRange !== 'all') {
        const age = recipient.age;
        switch (currentFilters.ageRange) {
          case 'child':
            if (age >= 18) return false;
            break;
          case 'adult':
            if (age < 18 || age >= 65) return false;
            break;
          case 'elderly':
            if (age < 65) return false;
            break;
        }
      }

      // Health conditions filter
      if (currentFilters.hasHealthConditions && recipient.medicalConditions.length === 0) {
        return false;
      }

      // Archived filter (using isActive inversely)
      if (!currentFilters.showArchived && !recipient.isActive) {
        return false;
      }

      return true;
    });
  }, []);

  // Load all care recipients
  const loadCareRecipients = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Loading care recipients for user', { userId });
      
      const result = await getAllCareRecipientsUseCase.execute(userId);
      
      if (result.isSuccess && result.data) {
        setCareRecipients(result.data);
        Logger.info('Care recipients loaded successfully', { count: result.data.length });
      } else {
        const errorMessage = result.error || 'Failed to load care recipients';
        setError(errorMessage);
        Logger.error('Failed to load care recipients', { error: errorMessage, userId });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while loading care recipients';
      setError(errorMessage);
      Logger.error('Unexpected error loading care recipients', { error: err, userId });
    } finally {
      setIsLoading(false);
    }
  }, [userId, getAllCareRecipientsUseCase]);

  // Get a single care recipient by ID
  const getCareRecipient = useCallback(async (recipientId: string): Promise<CareRecipient | null> => {
    try {
      Logger.info('Getting care recipient', { recipientId });
      
      const result = await getCareRecipientByIdUseCase.execute(recipientId);
      
      if (result.isSuccess && result.data) {
        Logger.info('Care recipient retrieved successfully', { recipientId });
        return result.data;
      } else {
        Logger.error('Failed to get care recipient', { error: result.error, recipientId });
        return null;
      }
    } catch (err) {
      Logger.error('Unexpected error getting care recipient', { error: err, recipientId });
      return null;
    }
  }, [getCareRecipientByIdUseCase]);

  // Create a new care recipient
  const createCareRecipient = useCallback(async (data: CreateCareRecipientData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Creating care recipient', { name: data.name, relationship: data.relationship });
      
      const result = await createCareRecipientUseCase.execute({
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (result.isSuccess && result.data) {
        // Update local state with new recipient
        setCareRecipients(prev => [...prev, result.data!]);
        Logger.info('Care recipient created successfully');
        return true;
      } else {
        const errorMessage = result.error || 'Failed to create care recipient';
        setError(errorMessage);
        Logger.error('Failed to create care recipient', { error: errorMessage });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating care recipient';
      setError(errorMessage);
      Logger.error('Unexpected error creating care recipient', { error: err });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, createCareRecipientUseCase]);

  // Update an existing care recipient
  const updateCareRecipient = useCallback(async (data: UpdateCareRecipientData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Updating care recipient', { recipientId: data.id });
      
      const result = await updateCareRecipientUseCase.execute({
        ...data,
        updatedAt: new Date()
      });
      
      if (result.isSuccess && result.data) {
        // Update local state
        setCareRecipients(prev => 
          prev.map(recipient => 
            recipient.id === data.id ? result.data! : recipient
          )
        );
        Logger.info('Care recipient updated successfully', { recipientId: data.id });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to update care recipient';
        setError(errorMessage);
        Logger.error('Failed to update care recipient', { error: errorMessage, recipientId: data.id });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating care recipient';
      setError(errorMessage);
      Logger.error('Unexpected error updating care recipient', { error: err, recipientId: data.id });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateCareRecipientUseCase]);

  // Archive (soft delete) a care recipient
  const archiveCareRecipient = useCallback(async (recipientId: string): Promise<boolean> => {
    const recipient = careRecipients.find(r => r.id === recipientId);
    if (!recipient) {
      setError('Care recipient not found');
      return false;
    }

    // Deactivate the recipient (soft delete)
    recipient.deactivate();
    
    return updateCareRecipient({
      id: recipientId,
      isActive: false
    });
  }, [careRecipients, updateCareRecipient]);

  // Permanently delete a care recipient
  const deleteCareRecipient = useCallback(async (recipientId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Deleting care recipient', { recipientId });
      
      const result = await deleteCareRecipientUseCase.execute(recipientId);
      
      if (result.isSuccess) {
        // Remove from local state
        setCareRecipients(prev => prev.filter(recipient => recipient.id !== recipientId));
        Logger.info('Care recipient deleted successfully', { recipientId });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to delete care recipient';
        setError(errorMessage);
        Logger.error('Failed to delete care recipient', { error: errorMessage, recipientId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while deleting care recipient';
      setError(errorMessage);
      Logger.error('Unexpected error deleting care recipient', { error: err, recipientId });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deleteCareRecipientUseCase]);

  // Refresh care recipients data
  const refreshCareRecipients = useCallback(() => {
    loadCareRecipients();
  }, [loadCareRecipients]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = applyFilters(careRecipients, filters);
    setFilteredRecipients(filtered);
  }, [careRecipients, filters, applyFilters]);

  // Load initial data
  useEffect(() => {
    loadCareRecipients();
  }, [loadCareRecipients]);

  // Computed values
  const getTotalCount = useCallback(() => careRecipients.length, [careRecipients]);
  const getActiveCount = useCallback(() => careRecipients.filter(r => r.isActive).length, [careRecipients]);
  const getArchivedCount = useCallback(() => careRecipients.filter(r => !r.isActive).length, [careRecipients]);
  const getChildrenCount = useCallback(() => careRecipients.filter(r => r.age < 18).length, [careRecipients]);
  const getAdultsCount = useCallback(() => careRecipients.filter(r => r.age >= 18 && r.age < 65).length, [careRecipients]);
  const getElderlyCount = useCallback(() => careRecipients.filter(r => r.age >= 65).length, [careRecipients]);
  const getWithHealthConditionsCount = useCallback(() => careRecipients.filter(r => r.medicalConditions.length > 0).length, [careRecipients]);

  return {
    // Data
    careRecipients,
    filteredRecipients,
    filters,
    
    // State
    isLoading,
    error,
    
    // Actions
    setFilters,
    getCareRecipient,
    createCareRecipient,
    updateCareRecipient,
    archiveCareRecipient,
    deleteCareRecipient,
    refreshCareRecipients,
    
    // Computed values
    getTotalCount,
    getActiveCount,
    getArchivedCount,
    getChildrenCount,
    getAdultsCount,
    getElderlyCount,
    getWithHealthConditionsCount
  };
}
