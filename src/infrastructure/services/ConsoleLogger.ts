// Console Logger Implementation
// Follows Single Responsibility Principle - only handles logging

import { ILogger } from '../../core/interfaces/IServices';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class ConsoleLogger implements ILogger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  debug(message: string, meta?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.log('DEBUG', message, undefined, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.log('INFO', message, undefined, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.log('WARN', message, undefined, meta);
    }
  }

  error(message: string, error?: Error, meta?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.log('ERROR', message, error, meta);
    }
  }

  private log(level: string, message: string, error?: Error, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(error && { error: this.serializeError(error) }),
      ...(meta && { meta })
    };

    switch (level) {
      case 'DEBUG':
        console.debug(`[${timestamp}] DEBUG: ${message}`, meta || '');
        break;
      case 'INFO':
        console.info(`[${timestamp}] INFO: ${message}`, meta || '');
        break;
      case 'WARN':
        console.warn(`[${timestamp}] WARN: ${message}`, meta || '');
        break;
      case 'ERROR':
        console.error(`[${timestamp}] ERROR: ${message}`, error || '', meta || '');
        break;
    }

    // In production, you might want to send logs to a service
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.log('Log Entry:', logEntry);
    }
  }

  private serializeError(error: Error): any {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}
