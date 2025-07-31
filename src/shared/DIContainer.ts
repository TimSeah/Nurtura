// Dependency Injection Container
// Follows Dependency Inversion Principle - manages all dependencies

import { 
  IUserRepository, 
  IEventRepository,
  ICareRecipientRepository,
  IVitalSignsRepository,
  IAlertRepository
} from '../core/interfaces/IRepositories';

import {
  IApiClient,
  ILogger,
  IConfigurationService,
  IValidationService,
  IEmailService,
  IAuthenticationService
} from '../core/interfaces/IServices';

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  UpdateUserSettingsUseCase
} from '../core/use-cases/UserUseCases';

import {
  CreateEventUseCase,
  GetUserEventsUseCase,
  SendEventReminderUseCase,
  UpdateEventUseCase,
  DeleteEventUseCase
} from '../core/use-cases/EventUseCases';

import {
  GetCareRecipientsUseCase,
  GetActiveCareRecipientsUseCase,
  GetCareRecipientByIdUseCase,
  CreateCareRecipientUseCase,
  UpdateCareRecipientUseCase,
  DeactivateCareRecipientUseCase,
  AddMedicalConditionUseCase
} from '../core/use-cases/CareRecipientUseCases';

import {
  RecordVitalSignsUseCase,
  GetVitalSignsForRecipientUseCase,
  GetVitalSignsByTypeUseCase,
  GetRecentVitalSignsUseCase,
  GetVitalSignsByDateRangeUseCase,
  GetAbnormalVitalSignsUseCase
} from '../core/use-cases/VitalSignsUseCases';

import {
  CreateAlertUseCase,
  GetAlertsForRecipientUseCase,
  GetUnreadAlertsUseCase,
  GetActiveAlertsUseCase,
  GetAlertsByTypeUseCase,
  GetAlertsByPriorityUseCase,
  MarkAlertAsReadUseCase,
  MarkAllAlertsAsReadUseCase,
  ResolveAlertUseCase
} from '../core/use-cases/AlertUseCases';

// Infrastructure implementations
import { ApiUserRepository } from '../infrastructure/repositories/ApiUserRepository';
import { ApiEventRepository } from '../infrastructure/repositories/ApiEventRepository';
import { ApiCareRecipientRepository } from '../infrastructure/repositories/ApiCareRecipientRepository';
import { ApiVitalSignsRepository } from '../infrastructure/repositories/ApiVitalSignsRepository';
import { ApiAlertRepository } from '../infrastructure/repositories/ApiAlertRepository';
import { HttpApiClient } from '../infrastructure/services/HttpApiClient';
import { ConsoleLogger, LogLevel } from '../infrastructure/services/ConsoleLogger';
import { ConfigurationService } from '../infrastructure/services/ConfigurationService';
import { ValidationService } from '../infrastructure/services/ValidationService';
import { AuthenticationService } from '../infrastructure/services/AuthenticationService';

export class DIContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();

  constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    // Configuration Service (Singleton)
    this.registerSingleton('configService', () => new ConfigurationService());

    // Logger Service (Singleton)
    this.registerSingleton('logger', () => {
      const config = this.get<IConfigurationService>('configService');
      const logLevel = config.get('LOG_LEVEL') === 'DEBUG' ? LogLevel.DEBUG : LogLevel.INFO;
      return new ConsoleLogger(logLevel);
    });

    // Validation Service (Singleton)
    this.registerSingleton('validationService', () => new ValidationService());

    // API Client (Singleton)
    this.registerSingleton('apiClient', () => 
      new HttpApiClient(
        this.get<IConfigurationService>('configService'),
        this.get<ILogger>('logger')
      )
    );

    // Authentication Service (Singleton)
    this.registerSingleton('authenticationService', () => 
      new AuthenticationService(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    // Repositories
    this.register('userRepository', () => 
      new ApiUserRepository(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    this.register('eventRepository', () => 
      new ApiEventRepository(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    this.register('careRecipientRepository', () => 
      new ApiCareRecipientRepository(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    this.register('vitalSignsRepository', () => 
      new ApiVitalSignsRepository(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    this.register('alertRepository', () => 
      new ApiAlertRepository(
        this.get<IApiClient>('apiClient'),
        this.get<ILogger>('logger')
      )
    );

    // Use Cases
    this.register('getUserProfileUseCase', () => 
      new GetUserProfileUseCase(
        this.get<IUserRepository>('userRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('updateUserProfileUseCase', () => 
      new UpdateUserProfileUseCase(
        this.get<IUserRepository>('userRepository'),
        this.get<IValidationService>('validationService'),
        this.get<ILogger>('logger')
      )
    );

    this.register('updateUserSettingsUseCase', () => 
      new UpdateUserSettingsUseCase(
        this.get<IUserRepository>('userRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('createEventUseCase', () => 
      new CreateEventUseCase(
        this.get<IEventRepository>('eventRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getUserEventsUseCase', () => 
      new GetUserEventsUseCase(
        this.get<IEventRepository>('eventRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('sendEventReminderUseCase', () => 
      new SendEventReminderUseCase(
        this.get<IEventRepository>('eventRepository'),
        this.get<IEmailService>('emailService'),
        this.get<ILogger>('logger')
      )
    );

    this.register('updateEventUseCase', () => 
      new UpdateEventUseCase(
        this.get<IEventRepository>('eventRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('deleteEventUseCase', () => 
      new DeleteEventUseCase(
        this.get<IEventRepository>('eventRepository'),
        this.get<ILogger>('logger')
      )
    );

    // Care Recipient Use Cases
    this.register('getCareRecipientsUseCase', () => 
      new GetCareRecipientsUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getActiveCareRecipientsUseCase', () => 
      new GetActiveCareRecipientsUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getCareRecipientByIdUseCase', () => 
      new GetCareRecipientByIdUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('createCareRecipientUseCase', () => 
      new CreateCareRecipientUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<IValidationService>('validationService'),
        this.get<ILogger>('logger')
      )
    );

    this.register('updateCareRecipientUseCase', () => 
      new UpdateCareRecipientUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<IValidationService>('validationService'),
        this.get<ILogger>('logger')
      )
    );

    this.register('deactivateCareRecipientUseCase', () => 
      new DeactivateCareRecipientUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('addMedicalConditionUseCase', () => 
      new AddMedicalConditionUseCase(
        this.get<ICareRecipientRepository>('careRecipientRepository'),
        this.get<ILogger>('logger')
      )
    );

    // Alert Use Cases
    this.register('createAlertUseCase', () => 
      new CreateAlertUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<IValidationService>('validationService'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getAlertsForRecipientUseCase', () => 
      new GetAlertsForRecipientUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getUnreadAlertsUseCase', () => 
      new GetUnreadAlertsUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getActiveAlertsUseCase', () => 
      new GetActiveAlertsUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getAlertsByTypeUseCase', () => 
      new GetAlertsByTypeUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('getAlertsByPriorityUseCase', () => 
      new GetAlertsByPriorityUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('markAlertAsReadUseCase', () => 
      new MarkAlertAsReadUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('markAllAlertsAsReadUseCase', () => 
      new MarkAllAlertsAsReadUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );

    this.register('resolveAlertUseCase', () => 
      new ResolveAlertUseCase(
        this.get<IAlertRepository>('alertRepository'),
        this.get<ILogger>('logger')
      )
    );
  }

  private register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  private registerSingleton<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
    // Mark as singleton by adding to singletons map when first created
  }

  get<T>(key: string): T {
    // Check if it's a singleton that's already been created
    if (this.singletons.has(key)) {
      return this.singletons.get(key);
    }

    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service '${key}' not found in container`);
    }

    const instance = factory();

    // If this was registered as a singleton, store the instance
    if (this.isSingleton(key)) {
      this.singletons.set(key, instance);
    }

    return instance;
  }

  private isSingleton(key: string): boolean {
    // Simple check - if the service is one of our core services, treat as singleton
    const singletonServices = [
      'configService', 'logger', 'validationService', 'apiClient', 'authenticationService'
    ];
    return singletonServices.includes(key);
  }

  // Helper methods for common services
  getLogger(): ILogger {
    return this.get<ILogger>('logger');
  }

  getConfig(): IConfigurationService {
    return this.get<IConfigurationService>('configService');
  }

  getValidator(): IValidationService {
    return this.get<IValidationService>('validationService');
  }

  getApiClient(): IApiClient {
    return this.get<IApiClient>('apiClient');
  }

  getAuthenticationService(): IAuthenticationService {
    return this.get<IAuthenticationService>('authenticationService');
  }

  // Repository getters
  getUserRepository(): IUserRepository {
    return this.get<IUserRepository>('userRepository');
  }

  getEventRepository(): IEventRepository {
    return this.get<IEventRepository>('eventRepository');
  }

  getCareRecipientRepository(): ICareRecipientRepository {
    return this.get<ICareRecipientRepository>('careRecipientRepository');
  }

  getVitalSignsRepository(): IVitalSignsRepository {
    return this.get<IVitalSignsRepository>('vitalSignsRepository');
  }

  getAlertRepository(): IAlertRepository {
    return this.get<IAlertRepository>('alertRepository');
  }

  // Use case getters
  getUserProfileUseCase(): GetUserProfileUseCase {
    return this.get<GetUserProfileUseCase>('getUserProfileUseCase');
  }

  getUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
    return this.get<UpdateUserProfileUseCase>('updateUserProfileUseCase');
  }

  getUpdateUserSettingsUseCase(): UpdateUserSettingsUseCase {
    return this.get<UpdateUserSettingsUseCase>('updateUserSettingsUseCase');
  }

  getCreateEventUseCase(): CreateEventUseCase {
    return this.get<CreateEventUseCase>('createEventUseCase');
  }

  getGetUserEventsUseCase(): GetUserEventsUseCase {
    return this.get<GetUserEventsUseCase>('getUserEventsUseCase');
  }

  getSendEventReminderUseCase(): SendEventReminderUseCase {
    return this.get<SendEventReminderUseCase>('sendEventReminderUseCase');
  }

  getUpdateEventUseCase(): UpdateEventUseCase {
    return this.get<UpdateEventUseCase>('updateEventUseCase');
  }

  getDeleteEventUseCase(): DeleteEventUseCase {
    return this.get<DeleteEventUseCase>('deleteEventUseCase');
  }
}

// Export singleton instance
export const container = new DIContainer();
