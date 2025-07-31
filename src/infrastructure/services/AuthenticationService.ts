// Authentication Service Implementation
// Follows Single Responsibility Principle - only handles authentication

import { IAuthenticationService, IApiClient, ILogger } from '../../core/interfaces/IServices';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export interface AuthValidationResponse {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      this.logger.info('Attempting user login', { username });
      
      const response = await this.apiClient.post<{ _id: string; username: string; email?: string }>('/auth/login', {
        username,
        password
      });

      if (response) {
        const user: AuthUser = {
          id: response._id,
          username: response.username,
          email: response.email
        };

        this.logger.info('Login successful', { userId: user.id });
        
        return {
          success: true,
          user
        };
      }

      return {
        success: false,
        error: 'Invalid credentials'
      };
    } catch (error) {
      this.logger.error('Login failed', error as Error, { username });
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      this.logger.info('Logging out user');
      await this.apiClient.post('/auth/logout');
      this.logger.info('Logout successful');
    } catch (error) {
      this.logger.error('Logout failed', error as Error);
      // Continue with logout on client side even if server logout fails
    }
  }

  async validateToken(token?: string): Promise<AuthValidationResponse> {
    try {
      this.logger.debug('Validating authentication token');
      
      const response = await this.apiClient.get<{ _id: string; username: string; email?: string }>('/auth/me');
      
      if (response) {
        const user: AuthUser = {
          id: response._id,
          username: response.username,
          email: response.email
        };

        this.logger.debug('Token validation successful', { userId: user.id });
        
        return {
          valid: true,
          user
        };
      }

      return {
        valid: false,
        error: 'Invalid token'
      };
    } catch (error) {
      this.logger.debug('Token validation failed', { error: (error as Error).message });
      return {
        valid: false,
        error: 'Authentication required'
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const validation = await this.validateToken();
      return validation.valid ? validation.user || null : null;
    } catch (error) {
      this.logger.error('Failed to get current user', error as Error);
      return null;
    }
  }

  async register(userData: { username: string; password: string; email?: string }): Promise<LoginResponse> {
    try {
      this.logger.info('Attempting user registration', { username: userData.username });
      
      await this.apiClient.post('/auth/register', userData);
      
      // After successful registration, automatically log in
      return this.login(userData.username, userData.password);
    } catch (error) {
      this.logger.error('Registration failed', error as Error, { username: userData.username });
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }
}
