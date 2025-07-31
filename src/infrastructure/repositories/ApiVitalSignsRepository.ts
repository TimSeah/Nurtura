// Vital Signs Repository Implementation
// Follows Single Responsibility Principle - only handles vital signs data operations

import { IVitalSignsRepository } from '../../core/interfaces/IRepositories';
import { VitalSigns, VitalSignsProperties } from '../../core/entities/VitalSigns';
import { IApiClient, ILogger } from '../../core/interfaces/IServices';

export class ApiVitalSignsRepository implements IVitalSignsRepository {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async create(vitalSigns: VitalSigns): Promise<VitalSigns> {
    try {
      this.logger.info('Creating vital signs record', { 
        recipientId: vitalSigns.recipientId, 
        vitalType: vitalSigns.vitalType 
      });
      
      const response = await this.apiClient.post<any>('/vital-signs', vitalSigns.toJSON());

      const newVitalSigns = VitalSigns.fromPersistence({
        ...response,
        id: response._id,
        recordedAt: new Date(response.recordedAt),
        createdAt: new Date(response.createdAt)
      } as VitalSignsProperties);

      this.logger.info('Vital signs record created successfully', { id: newVitalSigns.id });
      return newVitalSigns;
    } catch (error) {
      this.logger.error('Failed to create vital signs record', error as Error);
      throw new Error('Failed to create vital signs record');
    }
  }

  async findById(id: string): Promise<VitalSigns | null> {
    try {
      this.logger.debug('Fetching vital signs by ID', { id });
      
      const response = await this.apiClient.get<any>(`/vital-signs/${id}`);
      
      if (!response) {
        this.logger.debug('Vital signs record not found', { id });
        return null;
      }

      const vitalSigns = VitalSigns.fromPersistence({
        ...response,
        id: response._id,
        recordedAt: new Date(response.recordedAt),
        createdAt: new Date(response.createdAt)
      } as VitalSignsProperties);

      this.logger.debug('Vital signs record fetched successfully', { id });
      return vitalSigns;
    } catch (error) {
      this.logger.error('Failed to fetch vital signs record', error as Error, { id });
      return null;
    }
  }

  async findAll(): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching all vital signs records');
      
      const response = await this.apiClient.get<any[]>('/vital-signs');
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('All vital signs records fetched successfully', { count: vitalSignsRecords.length });
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch all vital signs records', error as Error);
      return [];
    }
  }

  async save(vitalSigns: VitalSigns): Promise<VitalSigns> {
    // If the vital signs record has an ID, update it; otherwise, create it
    if (vitalSigns.id) {
      return this.update(vitalSigns);
    } else {
      return this.create(vitalSigns);
    }
  }

  async update(vitalSigns: VitalSigns): Promise<VitalSigns> {
    try {
      this.logger.info('Updating vital signs record', { id: vitalSigns.id });
      
      const response = await this.apiClient.put<any>(`/vital-signs/${vitalSigns.id}`, vitalSigns.toJSON());

      const updatedVitalSigns = VitalSigns.fromPersistence({
        ...response,
        id: response._id,
        recordedAt: new Date(response.recordedAt),
        createdAt: new Date(response.createdAt)
      } as VitalSignsProperties);

      this.logger.info('Vital signs record updated successfully', { id: updatedVitalSigns.id });
      return updatedVitalSigns;
    } catch (error) {
      this.logger.error('Failed to update vital signs record', error as Error, { id: vitalSigns.id });
      throw new Error('Failed to update vital signs record');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting vital signs record', { id });
      
      await this.apiClient.delete(`/vital-signs/${id}`);
      
      this.logger.info('Vital signs record deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete vital signs record', error as Error, { id });
      throw new Error('Failed to delete vital signs record');
    }
  }

  async findByRecipientId(recipientId: string): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching vital signs by recipient ID', { recipientId });
      
      const response = await this.apiClient.get<any[]>(`/vital-signs?recipientId=${recipientId}`);
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('Vital signs records fetched successfully', { 
        recipientId, 
        count: vitalSignsRecords.length 
      });
      
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch vital signs by recipient ID', error as Error, { recipientId });
      return [];
    }
  }

  async findByRecipientIdAndType(recipientId: string, type: string): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching vital signs by recipient ID and type', { recipientId, type });
      
      const response = await this.apiClient.get<any[]>(`/vital-signs?recipientId=${recipientId}&type=${type}`);
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('Vital signs records by type fetched successfully', { 
        recipientId, 
        type,
        count: vitalSignsRecords.length 
      });
      
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch vital signs by recipient ID and type', error as Error, { recipientId, type });
      return [];
    }
  }

  async findRecent(limit: number): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching recent vital signs records', { limit });
      
      const response = await this.apiClient.get<any[]>(`/vital-signs?limit=${limit}&sort=recordedAt:desc`);
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('Recent vital signs records fetched successfully', { 
        limit,
        count: vitalSignsRecords.length 
      });
      
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch recent vital signs records', error as Error, { limit });
      return [];
    }
  }

  async findByDateRange(recipientId: string, startDate: Date, endDate: Date): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching vital signs by date range', { 
        recipientId, 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });
      
      const response = await this.apiClient.get<any[]>(
        `/vital-signs?recipientId=${recipientId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('Vital signs records by date range fetched successfully', { 
        recipientId, 
        count: vitalSignsRecords.length 
      });
      
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch vital signs by date range', error as Error, { recipientId });
      return [];
    }
  }

  async findAbnormal(recipientId: string): Promise<VitalSigns[]> {
    try {
      this.logger.debug('Fetching abnormal vital signs', { recipientId });
      
      const response = await this.apiClient.get<any[]>(`/vital-signs?recipientId=${recipientId}&abnormal=true`);
      
      const vitalSignsRecords = response.map(item => 
        VitalSigns.fromPersistence({
          ...item,
          id: item._id,
          recordedAt: new Date(item.recordedAt),
          createdAt: new Date(item.createdAt)
        } as VitalSignsProperties)
      );

      this.logger.debug('Abnormal vital signs records fetched successfully', { 
        recipientId, 
        count: vitalSignsRecords.length 
      });
      
      return vitalSignsRecords;
    } catch (error) {
      this.logger.error('Failed to fetch abnormal vital signs', error as Error, { recipientId });
      return [];
    }
  }
}
