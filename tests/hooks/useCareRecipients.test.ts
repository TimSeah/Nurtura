// Comprehensive Unit Tests for useCareRecipients Hook
// Tests all CRUD operations and error handling scenarios

import { renderHook, act } from '@testing-library/react';
import { useCareRecipients } from '../../src/presentation/hooks/useCareRecipients';
import { createMockDIContainer, mockCareRecipients } from '../../src/shared/testUtils';

// Mock DIContainer
const mockContainer = createMockDIContainer();

// Mock the container import
jest.mock('../../src/shared/DIContainer', () => ({
  container: {
    get: (key: string) => mockContainer.get(key)
  }
}));

describe('useCareRecipients Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer.clear();
    
    // Reset mock services
    const mockServices = {
      'getCareRecipientsUseCase': {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          data: mockCareRecipients
        })
      },
      'createCareRecipientUseCase': {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          data: { 
            id: '3', 
            name: 'New Recipient', 
            age: 70, 
            relationship: 'parent',
            dateOfBirth: '1955-01-01',
            medicalConditions: ['Hypertension'],
            isActive: true
          }
        })
      },
      'updateCareRecipientUseCase': {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          data: { 
            ...mockCareRecipients[0], 
            name: 'Updated Name'
          }
        })
      },
      'deactivateCareRecipientUseCase': {
        execute: jest.fn().mockResolvedValue({ isSuccess: true })
      },
      'getCareRecipientByIdUseCase': {
        execute: jest.fn().mockResolvedValue({
          isSuccess: true,
          data: mockCareRecipients[0]
        })
      }
    };

    Object.entries(mockServices).forEach(([key, service]) => {
      mockContainer.set(key, service);
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useCareRecipients('user123'));

      expect(result.current.careRecipients).toEqual([]);
      expect(result.current.filteredRecipients).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.filters).toEqual({
        relationship: 'all',
        ageRange: 'all',
        hasHealthConditions: false,
        showArchived: false
      });
    });
  });

  describe('Loading Care Recipients', () => {
    it('should load care recipients successfully', async () => {
      const { result } = renderHook(() => useCareRecipients('user123'));

      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.careRecipients).toEqual(mockCareRecipients);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading error gracefully', async () => {
      const errorMessage = 'Failed to load care recipients';
      const getCareRecipientsUseCase = mockContainer.get('getCareRecipientsUseCase');
      getCareRecipientsUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: errorMessage
      });

      const { result } = renderHook(() => useCareRecipients('user123'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.careRecipients).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Creating Care Recipients', () => {
    it('should create a new care recipient successfully', async () => {
      const { result } = renderHook(() => useCareRecipients('user123'));

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const newRecipientData = {
        name: 'New Recipient',
        dateOfBirth: new Date('1955-01-01'),
        relationship: 'parent',
        medicalInfo: {
          conditions: ['Hypertension'],
          emergencyContact: '+1234567892'
        }
      };

      let createResult: boolean = false;
      await act(async () => {
        createResult = await result.current.createCareRecipient(newRecipientData);
      });

      expect(createResult).toBe(true);
      expect(result.current.careRecipients).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Computed Values', () => {
    it('should calculate counts correctly', async () => {
      const { result } = renderHook(() => useCareRecipients('user123'));

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.getTotalCount()).toBe(2);
      expect(result.current.getActiveCount()).toBe(2);
      expect(result.current.getArchivedCount()).toBe(0);
    });
  });
});
