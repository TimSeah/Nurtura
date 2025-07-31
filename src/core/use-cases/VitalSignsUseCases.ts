// Vital Signs Use Cases - Application Layer
// Follows Single Responsibility Principle - each use case has one purpose

import { IVitalSignsRepository } from '../interfaces/IRepositories';
import { VitalSigns, VitalSignType } from '../entities/VitalSigns';
import { ILogger, IValidationService } from '../interfaces/IServices';

// Record Vital Signs Use Case
export class RecordVitalSignsUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private validationService: IValidationService,
    private logger: ILogger
  ) {}

  async execute(vitalSignsData: {
    recipientId: string;
    vitalType: VitalSignType;
    value: string;
    unit: string;
    recordedAt?: Date;
    notes?: string;
  }): Promise<VitalSigns> {
    this.logger.info('Recording vital signs', { 
      recipientId: vitalSignsData.recipientId,
      vitalType: vitalSignsData.vitalType 
    });
    
    try {
      // Validate required fields
      if (!vitalSignsData.recipientId) {
        throw new Error('Recipient ID is required');
      }
      
      if (!vitalSignsData.value) {
        throw new Error('Vital signs value is required');
      }
      
      if (!vitalSignsData.unit) {
        throw new Error('Unit is required');
      }

      // Create vital signs entity
      const vitalSigns = VitalSigns.create({
        recipientId: vitalSignsData.recipientId,
        vitalType: vitalSignsData.vitalType,
        value: this.validationService.sanitizeInput(vitalSignsData.value),
        unit: this.validationService.sanitizeInput(vitalSignsData.unit),
        recordedAt: vitalSignsData.recordedAt || new Date(),
        notes: vitalSignsData.notes ? this.validationService.sanitizeInput(vitalSignsData.notes) : undefined
      });

      // Save to repository
      const savedVitalSigns = await this.vitalSignsRepository.save(vitalSigns);
      
      this.logger.info('Vital signs recorded successfully', { 
        id: savedVitalSigns.id,
        recipientId: savedVitalSigns.recipientId,
        vitalType: savedVitalSigns.vitalType
      });
      
      return savedVitalSigns;
    } catch (error) {
      this.logger.error('Failed to record vital signs', error as Error, { 
        recipientId: vitalSignsData.recipientId,
        vitalType: vitalSignsData.vitalType
      });
      throw error;
    }
  }
}

// Get Vital Signs for Recipient Use Case
export class GetVitalSignsForRecipientUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<VitalSigns[]> {
    this.logger.info('Getting vital signs for recipient', { recipientId });
    
    try {
      const vitalSigns = await this.vitalSignsRepository.findByRecipientId(recipientId);
      
      this.logger.info('Vital signs retrieved successfully', { 
        recipientId, 
        count: vitalSigns.length 
      });
      
      return vitalSigns;
    } catch (error) {
      this.logger.error('Failed to get vital signs', error as Error, { recipientId });
      throw error;
    }
  }
}

// Get Vital Signs by Type Use Case
export class GetVitalSignsByTypeUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string, vitalType: string): Promise<VitalSigns[]> {
    this.logger.info('Getting vital signs by type', { recipientId, vitalType });
    
    try {
      const vitalSigns = await this.vitalSignsRepository.findByRecipientIdAndType(recipientId, vitalType);
      
      this.logger.info('Vital signs by type retrieved successfully', { 
        recipientId, 
        vitalType,
        count: vitalSigns.length 
      });
      
      return vitalSigns;
    } catch (error) {
      this.logger.error('Failed to get vital signs by type', error as Error, { recipientId, vitalType });
      throw error;
    }
  }
}

// Get Recent Vital Signs Use Case
export class GetRecentVitalSignsUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private logger: ILogger
  ) {}

  async execute(limit: number = 10): Promise<VitalSigns[]> {
    this.logger.info('Getting recent vital signs', { limit });
    
    try {
      const vitalSigns = await this.vitalSignsRepository.findRecent(limit);
      
      this.logger.info('Recent vital signs retrieved successfully', { 
        limit,
        count: vitalSigns.length 
      });
      
      return vitalSigns;
    } catch (error) {
      this.logger.error('Failed to get recent vital signs', error as Error, { limit });
      throw error;
    }
  }
}

// Get Vital Signs by Date Range Use Case
export class GetVitalSignsByDateRangeUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string, startDate: Date, endDate: Date): Promise<VitalSigns[]> {
    this.logger.info('Getting vital signs by date range', { 
      recipientId, 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    try {
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      const vitalSigns = await this.vitalSignsRepository.findByDateRange(recipientId, startDate, endDate);
      
      this.logger.info('Vital signs by date range retrieved successfully', { 
        recipientId,
        count: vitalSigns.length 
      });
      
      return vitalSigns;
    } catch (error) {
      this.logger.error('Failed to get vital signs by date range', error as Error, { recipientId });
      throw error;
    }
  }
}

// Get Abnormal Vital Signs Use Case
export class GetAbnormalVitalSignsUseCase {
  constructor(
    private vitalSignsRepository: IVitalSignsRepository,
    private logger: ILogger
  ) {}

  async execute(recipientId: string): Promise<VitalSigns[]> {
    this.logger.info('Getting abnormal vital signs', { recipientId });
    
    try {
      const abnormalVitalSigns = await this.vitalSignsRepository.findAbnormal(recipientId);
      
      this.logger.info('Abnormal vital signs retrieved successfully', { 
        recipientId, 
        count: abnormalVitalSigns.length 
      });
      
      return abnormalVitalSigns;
    } catch (error) {
      this.logger.error('Failed to get abnormal vital signs', error as Error, { recipientId });
      throw error;
    }
  }
}
