// Real-time WebSocket Service for Live Updates
// Provides real-time notifications and data synchronization

import { ILogger } from '../../core/interfaces/IServices';

export interface RealTimeEvent {
  type: 'care_recipient_updated' | 'alert_created' | 'event_scheduled' | 'vital_signs_recorded';
  data: any;
  timestamp: string;
  userId: string;
  recipientId?: string;
}

export interface RealTimeSubscription {
  id: string;
  eventType: string;
  callback: (event: RealTimeEvent) => void;
  userId: string;
}

export class RealTimeService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, RealTimeSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(
    private wsUrl: string,
    private logger: ILogger
  ) {}

  // Connect to WebSocket server
  async connect(userId: string, authToken: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return this.connectionPromise || Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = this.establishConnection(userId, authToken);
    
    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
    }
  }

  private async establishConnection(userId: string, authToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.wsUrl}?userId=${userId}&token=${authToken}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.logger.info('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.logger.info('WebSocket connection closed', { code: event.code, reason: event.reason });
          this.handleReconnection(userId, authToken);
        };

        this.ws.onerror = () => {
          this.logger.error('WebSocket error occurred', new Error('WebSocket error'));
          if (this.reconnectAttempts === 0) {
            reject(new Error('Failed to establish WebSocket connection'));
          }
        };

        // Connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.logger.error('Failed to create WebSocket connection', error as Error);
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const realTimeEvent: RealTimeEvent = JSON.parse(event.data);
      
      this.logger.debug('Received real-time event', { 
        type: realTimeEvent.type, 
        userId: realTimeEvent.userId 
      });

      // Notify all relevant subscriptions
      this.subscriptions.forEach(subscription => {
        if (this.shouldNotifySubscription(subscription, realTimeEvent)) {
          try {
            subscription.callback(realTimeEvent);
          } catch (error) {
            this.logger.error('Error in subscription callback', error as Error, {
              subscriptionId: subscription.id,
              eventType: realTimeEvent.type
            });
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to parse WebSocket message', error as Error, { 
        message: event.data 
      });
    }
  }

  private shouldNotifySubscription(subscription: RealTimeSubscription, event: RealTimeEvent): boolean {
    // Check if the event is for the subscribed user
    if (subscription.userId !== event.userId) {
      return false;
    }

    // Check if the subscription is for this event type or all events
    if (subscription.eventType !== '*' && subscription.eventType !== event.type) {
      return false;
    }

    return true;
  }

  private async handleReconnection(userId: string, authToken: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnection attempts reached', new Error(`Reconnection failed after ${this.reconnectAttempts} attempts`));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    this.logger.info('Attempting to reconnect WebSocket', { 
      attempt: this.reconnectAttempts, 
      delay 
    });

    setTimeout(async () => {
      try {
        await this.establishConnection(userId, authToken);
      } catch (error) {
        this.logger.error('Reconnection attempt failed', error as Error, {
          attempt: this.reconnectAttempts
        });
      }
    }, delay);
  }

  // Subscribe to real-time events
  subscribe(
    eventType: string, 
    userId: string, 
    callback: (event: RealTimeEvent) => void
  ): string {
    const subscriptionId = `${eventType}_${userId}_${Date.now()}_${Math.random()}`;
    
    const subscription: RealTimeSubscription = {
      id: subscriptionId,
      eventType,
      callback,
      userId
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    this.logger.debug('Created real-time subscription', {
      subscriptionId,
      eventType,
      userId
    });

    return subscriptionId;
  }

  // Unsubscribe from real-time events
  unsubscribe(subscriptionId: string): void {
    if (this.subscriptions.delete(subscriptionId)) {
      this.logger.debug('Removed real-time subscription', { subscriptionId });
    }
  }

  // Send real-time event to server
  async sendEvent(event: Omit<RealTimeEvent, 'timestamp'>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const eventWithTimestamp: RealTimeEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws.send(JSON.stringify(eventWithTimestamp));
      this.logger.debug('Sent real-time event', { type: event.type, userId: event.userId });
    } catch (error) {
      this.logger.error('Failed to send real-time event', error as Error, { event });
      throw error;
    }
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    this.logger.info('WebSocket disconnected');
  }

  // Get connection status
  getConnectionStatus(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'closed';
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Hook for using real-time updates in React components
import { useState, useEffect, useCallback, useRef } from 'react';
import { container } from '../../shared/DIContainer';
import { useAuth } from '../../presentation/contexts/AuthContext';

export interface UseRealTimeOptions {
  autoConnect?: boolean;
  eventTypes?: string[];
}

export function useRealTime(options: UseRealTimeOptions = {}) {
  const { autoConnect = true, eventTypes = ['*'] } = options;
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');
  const [error, setError] = useState<string | null>(null);
  const realTimeServiceRef = useRef<RealTimeService | null>(null);
  const subscriptionsRef = useRef<string[]>([]);

  // Initialize real-time service
  useEffect(() => {
    if (!realTimeServiceRef.current) {
      const logger = container.get<any>('logger');
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
      realTimeServiceRef.current = new RealTimeService(wsUrl, logger);
    }
  }, []);

  // Connect when authenticated and auto-connect is enabled
  useEffect(() => {
    if (autoConnect && isAuthenticated && user && realTimeServiceRef.current) {
      connect();
    }

    return () => {
      if (realTimeServiceRef.current) {
        realTimeServiceRef.current.disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, user]);

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeServiceRef.current) {
        const status = realTimeServiceRef.current.getConnectionStatus();
        setConnectionStatus(status);
        setIsConnected(status === 'open');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(async () => {
    if (!user || !realTimeServiceRef.current) return;

    try {
      setError(null);
      const authToken = localStorage.getItem('authToken') || '';
      await realTimeServiceRef.current.connect(user.id, authToken);
      
      // Subscribe to event types
      eventTypes.forEach(eventType => {
        if (realTimeServiceRef.current) {
          const subscriptionId = realTimeServiceRef.current.subscribe(
            eventType,
            user.id,
            (event) => {
              // Event will be handled by individual subscriptions
              console.log('Received real-time event:', event);
            }
          );
          subscriptionsRef.current.push(subscriptionId);
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to real-time service');
    }
  }, [user, eventTypes]);

  const disconnect = useCallback(() => {
    if (realTimeServiceRef.current) {
      // Unsubscribe from all subscriptions
      subscriptionsRef.current.forEach(subscriptionId => {
        realTimeServiceRef.current?.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current = [];

      realTimeServiceRef.current.disconnect();
    }
  }, []);

  const subscribe = useCallback((
    eventType: string,
    callback: (event: RealTimeEvent) => void
  ): string | null => {
    if (!user || !realTimeServiceRef.current) return null;

    const subscriptionId = realTimeServiceRef.current.subscribe(eventType, user.id, callback);
    subscriptionsRef.current.push(subscriptionId);
    return subscriptionId;
  }, [user]);

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (realTimeServiceRef.current) {
      realTimeServiceRef.current.unsubscribe(subscriptionId);
      subscriptionsRef.current = subscriptionsRef.current.filter(id => id !== subscriptionId);
    }
  }, []);

  const sendEvent = useCallback(async (event: Omit<RealTimeEvent, 'timestamp'>) => {
    if (!realTimeServiceRef.current) {
      throw new Error('Real-time service not initialized');
    }

    await realTimeServiceRef.current.sendEvent(event);
  }, []);

  return {
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendEvent
  };
}
