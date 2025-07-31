// Configuration Service Implementation
// Follows Single Responsibility Principle - only handles configuration

import { IConfigurationService } from '../../core/interfaces/IServices';

export class ConfigurationService implements IConfigurationService {
  private config: Record<string, string>;

  constructor(config?: Record<string, string>) {
    // Default configuration
    this.config = {
      API_BASE_URL: 'http://localhost:5000/api',
      LOG_LEVEL: 'INFO',
      ENVIRONMENT: 'development',
      ...config
    };

    // Load from environment variables if available
    if (typeof process !== 'undefined' && process.env) {
      Object.keys(process.env).forEach(key => {
        if (process.env[key]) {
          this.config[key] = process.env[key]!;
        }
      });
    }

    // Load from browser localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedConfig = localStorage.getItem('app-config');
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          this.config = { ...this.config, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load config from localStorage:', error);
      }
    }
  }

  get(key: string): string | undefined {
    return this.config[key];
  }

  getRequired(key: string): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Required configuration key '${key}' is missing`);
    }
    return value;
  }

  getNumber(key: string, defaultValue?: number): number {
    const value = this.config[key];
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Configuration key '${key}' is missing`);
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(`Configuration key '${key}' is not a valid number: ${value}`);
    }
    
    return numValue;
  }

  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.config[key];
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Configuration key '${key}' is missing`);
    }
    
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return false;
    }
    
    throw new Error(`Configuration key '${key}' is not a valid boolean: ${value}`);
  }

  set(key: string, value: string): void {
    this.config[key] = value;
    
    // Persist to localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('app-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save config to localStorage:', error);
      }
    }
  }

  getAll(): Record<string, string> {
    return { ...this.config };
  }

  has(key: string): boolean {
    return key in this.config && this.config[key] !== undefined;
  }
}
