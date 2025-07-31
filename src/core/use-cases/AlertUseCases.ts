// Alert Use Cases - Application Layer
// Follows Single Responsibility Principle - each use case has one purpose

import { IAlertRepository } from '../interfaces/IRepositories';
import { Alert, AlertType, AlertPriority } from '../entities/Alert';
import { ILogger, IValidationService } from '../interfaces/IServices';

// Create Alert Use Case
export class CreateAlertUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private validationService: IValidationService,
    private logger: ILogger
  ) {}

  async execute(alertData: {
    recipientId: string;
    type: AlertType;
    title: string;
    description: string;
    priority: AlertPriority;
    actionRequired?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Alert> {
    this.logger.info('Creating alert', { 
      recipientId: alertData.recipientId,
      type: alertData.type,
      priority: alertData.priority 
    });
    
    try {
      // Validate required fields
      if (!alertData.recipientId) {
        throw new Error('Recipient ID is required');
      }
      
      if (!alertData.title || alertData.title.trim().length === 0) {
        throw new Error('Alert title is required');
      }
      
      if (!alertData.description || alertData.description.trim().length === 0) {
        throw new Error('Alert description is required');
      }

      // Create alert entity
      const alert = Alert.create({
        recipientId: alertData.recipientId,
        type: alertData.type,
        title: this.validationService.sanitizeInput(alertData.title),
        description: this.validationService.sanitizeInput(alertData.description),
        priority: alertData.priority,
        actionRequired: alertData.actionRequired || false,
        metadata: alertData.metadata
      });

      // Save to repository
      const savedAlert = await this.alertRepository.save(alert);
      
      this.logger.info('Alert created successfully', { 
        id: savedAlert.id,
        recipientId: savedAlert.recipientId,
        type: savedAlert.type
      });
      
      return savedAlert;
    } catch (error) {
      this.logger.error('Failed to create alert', error as Error, { 
        recipientId: alertData.recipientId,
        type: alertData.type
      });
      throw error;
    }
  }
}

// Get Alerts for Recipient Use Case
export class GetAlertsForRecipientUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<Alert[]> {
    this.logger.info('Getting alerts for recipient', { recipientId });
    
    try {
      const alerts = await this.alertRepository.findByRecipientId(recipientId);
      
      this.logger.info('Alerts retrieved successfully', { 
        recipientId, 
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to get alerts', error as Error, { recipientId });
      throw error;
    }
  }
}

// Get Unread Alerts Use Case
export class GetUnreadAlertsUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<Alert[]> {
    this.logger.info('Getting unread alerts for recipient', { recipientId });
    
    try {
      const unreadAlerts = await this.alertRepository.findUnreadByRecipientId(recipientId);
      
      this.logger.info('Unread alerts retrieved successfully', { 
        recipientId, 
        count: unreadAlerts.length 
      });
      
      return unreadAlerts;
    } catch (error) {
      this.logger.error('Failed to get unread alerts', error as Error, { recipientId });
      throw error;
    }
  }
}

// Get Active Alerts Use Case
export class GetActiveAlertsUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<Alert[]> {
    this.logger.info('Getting active alerts for recipient', { recipientId });
    
    try {
      const activeAlerts = await this.alertRepository.findActive(recipientId);
      
      this.logger.info('Active alerts retrieved successfully', { 
        recipientId, 
        count: activeAlerts.length 
      });
      
      return activeAlerts;
    } catch (error) {
      this.logger.error('Failed to get active alerts', error as Error, { recipientId });
      throw error;
    }
  }
}

// Get Alerts by Type Use Case
export class GetAlertsByTypeUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string, alertType: string): Promise<Alert[]> {
    this.logger.info('Getting alerts by type', { recipientId, alertType });
    
    try {
      const alerts = await this.alertRepository.findByType(recipientId, alertType);
      
      this.logger.info('Alerts by type retrieved successfully', { 
        recipientId, 
        alertType,
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to get alerts by type', error as Error, { recipientId, alertType });
      throw error;
    }
  }
}

// Get Alerts by Priority Use Case
export class GetAlertsByPriorityUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string, priority: string): Promise<Alert[]> {
    this.logger.info('Getting alerts by priority', { recipientId, priority });
    
    try {
      const alerts = await this.alertRepository.findByPriority(recipientId, priority);
      
      this.logger.info('Alerts by priority retrieved successfully', { 
        recipientId, 
        priority,
        count: alerts.length 
      });
      
      return alerts;
    } catch (error) {
      this.logger.error('Failed to get alerts by priority', error as Error, { recipientId, priority });
      throw error;
    }
  }
}

// Mark Alert as Read Use Case
export class MarkAlertAsReadUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(alertId: string): Promise<void> {
    this.logger.info('Marking alert as read', { alertId });
    
    try {
      await this.alertRepository.markAsRead(alertId);
      
      this.logger.info('Alert marked as read successfully', { alertId });
    } catch (error) {
      this.logger.error('Failed to mark alert as read', error as Error, { alertId });
      throw error;
    }
  }
}

// Mark All Alerts as Read Use Case
export class MarkAllAlertsAsReadUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<void> {
    this.logger.info('Marking all alerts as read for recipient', { recipientId });
    
    try {
      await this.alertRepository.markAllAsRead(recipientId);
      
      this.logger.info('All alerts marked as read successfully', { recipientId });
    } catch (error) {
      this.logger.error('Failed to mark all alerts as read', error as Error, { recipientId });
      throw error;
    }
  }
}

// Resolve Alert Use Case
export class ResolveAlertUseCase {
  constructor(
    private alertRepository: IAlertRepository,
    private logger: ILogger
  ) {}

  async execute(alertId: string): Promise<void> {
    this.logger.info('Resolving alert', { alertId });
    
    try {
      await this.alertRepository.resolve(alertId);
      
      this.logger.info('Alert resolved successfully', { alertId });
    } catch (error) {
      this.logger.error('Failed to resolve alert', error as Error, { alertId });
      throw error;
    }
  }
}
