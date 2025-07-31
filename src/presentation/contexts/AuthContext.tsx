// Refactored Authentication Context - Follows SOLID Principles
// Single Responsibility: Manages authentication state only
// Dependency Inversion: Depends on abstractions, not concrete implementations

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { IAuthenticationService } from '../../core/interfaces/IServices';
import { container } from '../../shared/DIContainer';

// Authentication State Types
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication Actions
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Auth Reducer - Follows Single Responsibility Principle
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Context Interface - Interface Segregation Principle
export interface AuthContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { username: string; password: string; email?: string }) => Promise<boolean>;
  clearError: () => void;
  validateSession: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component - Follows Open/Closed Principle
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Dependency Injection - depends on abstraction, not concrete implementation
  const authService = container.getAuthenticationService();

  // Validate session on mount
  useEffect(() => {
    validateSession();
  }, []);

  // Action Handlers - Each follows Single Responsibility Principle
  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await authService.login(username, password);
      
      if (result.success && result.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: result.user });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.error || 'Login failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'An unexpected error occurred' });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      // Even if server logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const register = async (userData: { username: string; password: string; email?: string }): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: result.user });
        return true;
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.error || 'Registration failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'An unexpected error occurred' });
      return false;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const validateSession = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const validation = await authService.validateToken();
      
      if (validation.valid && validation.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: validation.user });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Context Value - Interface Segregation Principle
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    logout,
    register,
    clearError,
    validateSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook - Single Responsibility Principle
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
