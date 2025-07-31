// Care Recipient Repository Implementation
// Follows Single Responsibility Principle - only handles care recipient data operations

import { ICareRecipientRepository } from '../../core/interfaces/IRepositories';
import { CareRecipient, CareRecipientProperties } from '../../core/entities/CareRecipient';
import { IApiClient, ILogger } from '../../core/interfaces/IServices';

export class ApiCareRecipientRepository implements ICareRecipientRepository {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async create(careRecipient: CareRecipient): Promise<CareRecipient> {
    try {
      this.logger.info('Creating care recipient', { name: careRecipient.name });
      
      const response = await this.apiClient.post<any>('/care-recipients', careRecipient.toJSON());

      const newCareRecipient = CareRecipient.fromPersistence({
        ...response,
        id: response._id,
        dateOfBirth: new Date(response.dateOfBirth),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      } as CareRecipientProperties);

      this.logger.info('Care recipient created successfully', { id: newCareRecipient.id });
      return newCareRecipient;
    } catch (error) {
      this.logger.error('Failed to create care recipient', error as Error);
      throw new Error('Failed to create care recipient');
    }
  }

  async findById(id: string): Promise<CareRecipient | null> {
    try {
      this.logger.debug('Fetching care recipient by ID', { id });
      
      const response = await this.apiClient.get<any>(`/care-recipients/${id}`);
      
      if (!response) {
        this.logger.debug('Care recipient not found', { id });
        return null;
      }

      const careRecipient = CareRecipient.fromPersistence({
        ...response,
        id: response._id,
        dateOfBirth: new Date(response.dateOfBirth),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      } as CareRecipientProperties);

      this.logger.debug('Care recipient fetched successfully', { id });
      return careRecipient;
    } catch (error) {
      this.logger.error('Failed to fetch care recipient', error as Error, { id });
      return null;
    }
  }

  async findAll(): Promise<CareRecipient[]> {
    try {
      this.logger.debug('Fetching all care recipients');
      
      const response = await this.apiClient.get<any[]>('/care-recipients');
      
      const careRecipients = response.map(item => 
        CareRecipient.fromPersistence({
          ...item,
          id: item._id,
          dateOfBirth: new Date(item.dateOfBirth),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        } as CareRecipientProperties)
      );

      this.logger.debug('All care recipients fetched successfully', { count: careRecipients.length });
      return careRecipients;
    } catch (error) {
      this.logger.error('Failed to fetch all care recipients', error as Error);
      return [];
    }
  }

  async save(careRecipient: CareRecipient): Promise<CareRecipient> {
    // If the care recipient has an ID, update it; otherwise, create it
    if (careRecipient.id) {
      return this.update(careRecipient);
    } else {
      return this.create(careRecipient);
    }
  }

  async findByUserId(userId: string): Promise<CareRecipient[]> {
    try {
      this.logger.debug('Fetching care recipients by user ID', { userId });
      
      const response = await this.apiClient.get<any[]>(`/care-recipients?userId=${userId}`);
      
      const careRecipients = response.map(item => 
        CareRecipient.fromPersistence({
          ...item,
          id: item._id,
          dateOfBirth: new Date(item.dateOfBirth),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        } as CareRecipientProperties)
      );

      this.logger.debug('Care recipients fetched successfully', { 
        userId, 
        count: careRecipients.length 
      });
      
      return careRecipients;
    } catch (error) {
      this.logger.error('Failed to fetch care recipients by user ID', error as Error, { userId });
      return [];
    }
  }

  async findActiveByUserId(userId: string): Promise<CareRecipient[]> {
    try {
      this.logger.debug('Fetching active care recipients by user ID', { userId });
      
      const response = await this.apiClient.get<any[]>(`/care-recipients?userId=${userId}&active=true`);
      
      const careRecipients = response.map(item => 
        CareRecipient.fromPersistence({
          ...item,
          id: item._id,
          dateOfBirth: new Date(item.dateOfBirth),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        } as CareRecipientProperties)
      );

      this.logger.debug('Active care recipients fetched successfully', { 
        userId, 
        count: careRecipients.length 
      });
      
      return careRecipients;
    } catch (error) {
      this.logger.error('Failed to fetch active care recipients', error as Error, { userId });
      return [];
    }
  }

  async update(careRecipient: CareRecipient): Promise<CareRecipient> {
    try {
      this.logger.info('Updating care recipient', { id: careRecipient.id });
      
      const response = await this.apiClient.put<any>(`/care-recipients/${careRecipient.id}`, careRecipient.toJSON());

      const updatedCareRecipient = CareRecipient.fromPersistence({
        ...response,
        id: response._id,
        dateOfBirth: new Date(response.dateOfBirth),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt)
      } as CareRecipientProperties);

      this.logger.info('Care recipient updated successfully', { id: updatedCareRecipient.id });
      return updatedCareRecipient;
    } catch (error) {
      this.logger.error('Failed to update care recipient', error as Error, { id: careRecipient.id });
      throw new Error('Failed to update care recipient');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting care recipient', { id });
      
      await this.apiClient.delete(`/care-recipients/${id}`);
      
      this.logger.info('Care recipient deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete care recipient', error as Error, { id });
      throw new Error('Failed to delete care recipient');
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      this.logger.info('Deactivating care recipient', { id });
      
      await this.apiClient.patch<any>(`/care-recipients/${id}`, { isActive: false });
      
      this.logger.info('Care recipient deactivated successfully', { id });
    } catch (error) {
      this.logger.error('Failed to deactivate care recipient', error as Error, { id });
      throw new Error('Failed to deactivate care recipient');
    }
  }

  async activate(id: string): Promise<void> {
    try {
      this.logger.info('Activating care recipient', { id });
      
      await this.apiClient.patch<any>(`/care-recipients/${id}`, { isActive: true });
      
      this.logger.info('Care recipient activated successfully', { id });
    } catch (error) {
      this.logger.error('Failed to activate care recipient', error as Error, { id });
      throw new Error('Failed to activate care recipient');
    }
  }
}
