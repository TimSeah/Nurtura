// Alert Repository Implementation
// Follows Single Responsibility Principle - only handles alert data operations

import { IAlertRepository } from '../../core/interfaces/IRepositories';
import { Alert, AlertProperties } from '../../core/entities/Alert';
import { IApiClient, ILogger } from '../../core/interfaces/IServices';

export class ApiAlertRepository implements IAlertRepository {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async create(alert: Alert): Promise<Alert> {
    try {
      this.logger.info('Creating alert', { 
        recipientId: alert.recipientId, 
        type: alert.type, 
        priority: alert.priority 
      });
      
      const response = await this.apiClient.post<any>('/alerts', alert.toJSON());

      const newAlert = Alert.fromPersistence({
        ...response,
        id: response._id,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        resolvedAt: response.resolvedAt ? new Date(response.resolvedAt) : undefined
      } as AlertProperties);

      this.logger.info('Alert created successfully', { id: newAlert.id });
      return newAlert;
    } catch (error) {
      this.logger.error('Failed to create alert', error as Error);
      throw new Error('Failed to create alert');
    }
  }

  async findById(id: string): Promise<Alert | null> {
    try {
      this.logger.debug('Fetching alert by ID', { id });
      
      const response = await this.apiClient.get<any>(`/alerts/${id}`);
      
      if (!response) {
        this.logger.debug('Alert not found', { id });
        return null;
      }

      const alert = Alert.fromPersistence({
        ...response,
        id: response._id,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        resolvedAt: response.resolvedAt ? new Date(response.resolvedAt) : undefined
      } as AlertProperties);

      this.logger.debug('Alert fetched successfully', { id });
      return alert;
    } catch (error) {
      this.logger.error('Failed to fetch alert', error as Error, { id });
      return null;
    }
  }

  async findAll(): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching all alerts');
      
      const response = await this.apiClient.get<any[]>('/alerts');
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('All alerts fetched successfully', { count: alerts.length });
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch all alerts', error as Error);
      return [];
    }
  }

  async save(alert: Alert): Promise<Alert> {
    // If the alert has an ID, update it; otherwise, create it
    if (alert.id) {
      return this.update(alert);
    } else {
      return this.create(alert);
    }
  }

  async update(alert: Alert): Promise<Alert> {
    try {
      this.logger.info('Updating alert', { id: alert.id });
      
      const response = await this.apiClient.put<any>(`/alerts/${alert.id}`, alert.toJSON());

      const updatedAlert = Alert.fromPersistence({
        ...response,
        id: response._id,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        resolvedAt: response.resolvedAt ? new Date(response.resolvedAt) : undefined
      } as AlertProperties);

      this.logger.info('Alert updated successfully', { id: updatedAlert.id });
      return updatedAlert;
    } catch (error) {
      this.logger.error('Failed to update alert', error as Error, { id: alert.id });
      throw new Error('Failed to update alert');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting alert', { id });
      
      await this.apiClient.delete(`/alerts/${id}`);
      
      this.logger.info('Alert deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete alert', error as Error, { id });
      throw new Error('Failed to delete alert');
    }
  }

  async findByRecipientId(recipientId: string): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching alerts by recipient ID', { recipientId });
      
      const response = await this.apiClient.get<any[]>(`/alerts?recipientId=${recipientId}`);
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('Alerts by recipient ID fetched successfully', { 
        recipientId, 
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch alerts by recipient ID', error as Error, { recipientId });
      return [];
    }
  }

  async findUnreadByRecipientId(recipientId: string): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching unread alerts by recipient ID', { recipientId });
      
      const response = await this.apiClient.get<any[]>(`/alerts?recipientId=${recipientId}&isRead=false`);
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('Unread alerts fetched successfully', { 
        recipientId, 
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch unread alerts', error as Error, { recipientId });
      return [];
    }
  }

  async findByType(recipientId: string, type: string): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching alerts by type', { recipientId, type });
      
      const response = await this.apiClient.get<any[]>(`/alerts?recipientId=${recipientId}&type=${type}`);
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('Alerts by type fetched successfully', { 
        recipientId, 
        type,
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch alerts by type', error as Error, { recipientId, type });
      return [];
    }
  }

  async findByPriority(recipientId: string, priority: string): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching alerts by priority', { recipientId, priority });
      
      const response = await this.apiClient.get<any[]>(`/alerts?recipientId=${recipientId}&priority=${priority}`);
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('Alerts by priority fetched successfully', { 
        recipientId, 
        priority,
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch alerts by priority', error as Error, { recipientId, priority });
      return [];
    }
  }

  async markAsRead(alertId: string): Promise<void> {
    try {
      this.logger.info('Marking alert as read', { alertId });
      
      await this.apiClient.patch<any>(`/alerts/${alertId}`, { isRead: true });
      
      this.logger.info('Alert marked as read successfully', { alertId });
    } catch (error) {
      this.logger.error('Failed to mark alert as read', error as Error, { alertId });
      throw new Error('Failed to mark alert as read');
    }
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    try {
      this.logger.info('Marking all alerts as read for recipient', { recipientId });
      
      await this.apiClient.patch<any>(`/alerts/mark-all-read/${recipientId}`, {});
      
      this.logger.info('All alerts marked as read successfully', { recipientId });
    } catch (error) {
      this.logger.error('Failed to mark all alerts as read', error as Error, { recipientId });
      throw new Error('Failed to mark all alerts as read');
    }
  }

  async resolve(alertId: string): Promise<void> {
    try {
      this.logger.info('Resolving alert', { alertId });
      
      await this.apiClient.patch<any>(`/alerts/${alertId}`, { 
        isResolved: true, 
        resolvedAt: new Date().toISOString() 
      });
      
      this.logger.info('Alert resolved successfully', { alertId });
    } catch (error) {
      this.logger.error('Failed to resolve alert', error as Error, { alertId });
      throw new Error('Failed to resolve alert');
    }
  }

  async findActive(recipientId: string): Promise<Alert[]> {
    try {
      this.logger.debug('Fetching active alerts', { recipientId });
      
      const response = await this.apiClient.get<any[]>(`/alerts?recipientId=${recipientId}&isResolved=false`);
      
      const alerts = response.map(item => 
        Alert.fromPersistence({
          ...item,
          id: item._id,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined
        } as AlertProperties)
      );

      this.logger.debug('Active alerts fetched successfully', { 
        recipientId, 
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to fetch active alerts', error as Error, { recipientId });
      return [];
    }
  }
}
