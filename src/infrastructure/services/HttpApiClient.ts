// HTTP API Client Implementation
// Follows Dependency Inversion Principle and Single Responsibility Principle

import { IApiClient, ILogger, IConfigurationService } from '../../core/interfaces/IServices';

export class HttpApiClient implements IApiClient {
  private baseUrl: string;

  constructor(
    private configService: IConfigurationService,
    private logger: ILogger
  ) {
    this.baseUrl = this.configService.get('API_BASE_URL') || 'http://localhost:5000/api';
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.makeRequest<T>(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.makeRequest<T>(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    
    return url;
  }

  private async makeRequest<T>(url: string, config: RequestInit): Promise<T> {
    try {
      this.logger.debug(`Making ${config.method} request to ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`HTTP ${response.status} error for ${url}`, new Error(errorText));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      this.logger.debug(`Request successful for ${url}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Request failed for ${url}`, error as Error);
      throw error;
    }
  }
}
