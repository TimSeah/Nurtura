// Test Utilities for React Testing Library and Jest
// Provides comprehensive testing setup for hooks and components

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContextType } from '../presentation/contexts/AuthContext';

// Mock AuthContext Provider for testing
export const mockAuthContext: AuthContextType = {
  user: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isLoading: false,
  error: null,
  clearError: jest.fn(),
  validateSession: jest.fn()
};

// Create a mock AuthContext
const MockAuthContext = React.createContext<AuthContextType>(mockAuthContext);

// Test wrapper with AuthContext
interface TestWrapperProps {
  children: ReactNode;
  authContextValue?: Partial<AuthContextType>;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  authContextValue = {} 
}) => {
  const contextValue = { ...mockAuthContext, ...authContextValue };
  
  return React.createElement(
    MockAuthContext.Provider,
    { value: contextValue },
    children
  );
};

// Custom render function with AuthContext
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContextValue?: Partial<AuthContextType>;
}

export function renderWithAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { authContextValue, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => React.createElement(
      TestWrapper,
      { children, authContextValue },
    ),
    ...renderOptions,
  });
}

// Mock DIContainer for testing
export const createMockDIContainer = () => {
  const container = new Map();
  
  // Mock services
  const mockServices = {
    // Use cases
    'getCareRecipientsUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: [
          { id: '1', name: 'John Doe', age: 75, condition: 'Diabetes' },
          { id: '2', name: 'Jane Smith', age: 82, condition: 'Arthritis' }
        ]
      })
    },
    'createCareRecipientUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: { id: '3', name: 'New Recipient', age: 70, condition: 'Hypertension' }
      })
    },
    'updateCareRecipientUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: { id: '1', name: 'Updated Recipient', age: 75, condition: 'Diabetes' }
      })
    },
    'deleteCareRecipientUseCase': {
      execute: jest.fn().mockResolvedValue({ isSuccess: true })
    },
    'getCareRecipientByIdUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: { id: '1', name: 'John Doe', age: 75, condition: 'Diabetes' }
      })
    },
    'getAlertsUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: [
          {
            id: '1',
            title: 'Medication Reminder',
            message: 'Time for morning medication',
            type: 'medication',
            priority: 'high',
            timestamp: '2025-07-31T08:00:00Z',
            isRead: false,
            careRecipientId: '1'
          }
        ]
      })
    },
    'getEventsUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: [
          {
            id: '1',
            title: 'Doctor Appointment',
            description: 'Regular checkup',
            date: '2025-08-01',
            time: '10:00',
            type: 'appointment',
            careRecipientId: '1'
          }
        ]
      })
    },
    'createEventUseCase': {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        data: {
          id: '2',
          title: 'New Event',
          description: 'Test event',
          date: '2025-08-02',
          time: '14:00',
          type: 'appointment',
          careRecipientId: '1'
        }
      })
    }
  };

  // Register all mock services
  Object.entries(mockServices).forEach(([key, service]) => {
    container.set(key, service);
  });

  return {
    get: (key: string) => container.get(key),
    set: (key: string, value: any) => container.set(key, value),
    has: (key: string) => container.has(key),
    clear: () => container.clear()
  };
};

// Common test data
export const mockCareRecipients = [
  {
    id: '1',
    name: 'John Doe',
    age: 75,
    condition: 'Diabetes',
    medications: ['Metformin', 'Insulin'],
    emergencyContact: '+1234567890',
    careProvider: 'Dr. Smith'
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 82,
    condition: 'Arthritis',
    medications: ['Ibuprofen'],
    emergencyContact: '+1234567891',
    careProvider: 'Dr. Johnson'
  }
];

export const mockAlerts = [
  {
    id: '1',
    title: 'Medication Reminder',
    message: 'Time for morning medication',
    type: 'medication',
    priority: 'high',
    timestamp: '2025-07-31T08:00:00Z',
    isRead: false,
    careRecipientId: '1'
  },
  {
    id: '2',
    title: 'Appointment Tomorrow',
    message: 'Doctor visit at 10 AM',
    type: 'appointment',
    priority: 'medium',
    timestamp: '2025-07-31T09:00:00Z',
    isRead: true,
    careRecipientId: '2'
  }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Doctor Appointment',
    description: 'Regular checkup with Dr. Smith',
    date: '2025-08-01',
    time: '10:00',
    type: 'appointment',
    careRecipientId: '1',
    location: 'Medical Center'
  },
  {
    id: '2',
    title: 'Physical Therapy',
    description: 'Weekly PT session',
    date: '2025-08-02',
    time: '14:00',
    type: 'therapy',
    careRecipientId: '2',
    location: 'Therapy Clinic'
  }
];

// Accessibility testing helpers
export const checkAccessibility = {
  // Check for proper heading hierarchy
  checkHeadingHierarchy: () => {
    const headings = screen.getAllByRole('heading');
    headings.forEach((heading, index) => {
      expect(heading).toBeInTheDocument();
      if (index > 0) {
        const currentLevel = parseInt(heading.tagName.substring(1));
        const previousLevel = parseInt(headings[index - 1].tagName.substring(1));
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }
    });
  },

  // Check for proper form labels
  checkFormLabels: () => {
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  },

  // Check for proper button descriptions
  checkButtonAccessibility: () => {
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  },

  // Check keyboard navigation
  checkKeyboardNavigation: async () => {
    const user = userEvent.setup();
    const focusableElements = screen.getAllByRole('button')
      .concat(screen.getAllByRole('textbox'))
      .concat(screen.getAllByRole('link'));
    
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    }
  }
};

// Performance testing helpers
export const performanceHelpers = {
  // Measure component render time
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    await waitFor(() => {
      // Wait for component to be fully rendered
    });
    const end = performance.now();
    return end - start;
  }
};

// Mock window APIs for testing
export const mockWindowAPIs = () => {
  // Mock geolocation
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  });

  // Mock matchMedia for responsive design testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  return {
    geolocation: mockGeolocation,
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock
  };
};

// Export all utilities
export {
  render,
  screen,
  waitFor,
  userEvent
};
