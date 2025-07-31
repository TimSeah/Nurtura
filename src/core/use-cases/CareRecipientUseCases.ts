// Care Recipient Use Cases - Application Layer
// Follows Single Responsibility Principle - each use case has one purpose

import { ICareRecipientRepository } from '../interfaces/IRepositories';
import { CareRecipient } from '../entities/CareRecipient';
import { ILogger, IValidationService } from '../interfaces/IServices';

// Get Care Recipients for a User Use Case
export class GetCareRecipientsUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private logger: ILogger
  ) {}

  async execute(userId: string): Promise<CareRecipient[]> {
    this.logger.info('Getting care recipients for user', { userId });
    
    try {
      const careRecipients = await this.careRecipientRepository.findByUserId(userId);
      
      this.logger.info('Care recipients retrieved successfully', { 
        userId, 
        count: careRecipients.length 
      });
      
      return careRecipients;
    } catch (error) {
      this.logger.error('Failed to get care recipients', error as Error, { userId });
      throw error;
    }
  }
}

// Get Active Care Recipients for a User Use Case
export class GetActiveCareRecipientsUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private logger: ILogger
  ) {}

  async execute(userId: string): Promise<CareRecipient[]> {
    this.logger.info('Getting active care recipients for user', { userId });
    
    try {
      const careRecipients = await this.careRecipientRepository.findActiveByUserId(userId);
      
      this.logger.info('Active care recipients retrieved successfully', { 
        userId, 
        count: careRecipients.length 
      });
      
      return careRecipients;
    } catch (error) {
      this.logger.error('Failed to get active care recipients', error as Error, { userId });
      throw error;
    }
  }
}

// Get Care Recipient by ID Use Case
export class GetCareRecipientByIdUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private logger: ILogger
  ) {}

  async execute(careRecipientId: string): Promise<{ isSuccess: boolean; data?: CareRecipient; error?: string }> {
    this.logger.info('Getting care recipient by ID', { careRecipientId });
    
    try {
      const careRecipient = await this.careRecipientRepository.findById(careRecipientId);
      
      if (!careRecipient) {
        this.logger.warn('Care recipient not found', { careRecipientId });
        return {
          isSuccess: false,
          error: 'Care recipient not found'
        };
      }
      
      this.logger.info('Care recipient retrieved successfully', { careRecipientId });
      
      return {
        isSuccess: true,
        data: careRecipient
      };
    } catch (error) {
      this.logger.error('Failed to get care recipient', error as Error, { careRecipientId });
      return {
        isSuccess: false,
        error: (error as Error).message
      };
    }
  }
}

// Create Care Recipient Use Case
export class CreateCareRecipientUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private validationService: IValidationService,
    private logger: ILogger
  ) {}

  async execute(careRecipientData: {
    name: string;
    dateOfBirth: Date;
    relationship: string;
    medicalConditions?: string[];
    caregiverNotes?: string;
  }): Promise<CareRecipient> {
    this.logger.info('Creating care recipient', { name: careRecipientData.name });
    
    try {
      // Validate required fields
      if (!this.validationService.isValidName(careRecipientData.name)) {
        throw new Error('Invalid care recipient name');
      }
      
      if (!careRecipientData.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      
      if (!careRecipientData.relationship) {
        throw new Error('Relationship is required');
      }

      // Create care recipient entity
      const careRecipient = CareRecipient.create({
        name: careRecipientData.name,
        dateOfBirth: careRecipientData.dateOfBirth,
        relationship: careRecipientData.relationship,
        medicalConditions: careRecipientData.medicalConditions || [],
        medications: [],
        emergencyContacts: [],
        caregiverNotes: careRecipientData.caregiverNotes || '',
        isActive: true
      });

      // Save to repository
      const savedCareRecipient = await this.careRecipientRepository.save(careRecipient);
      
      this.logger.info('Care recipient created successfully', { 
        id: savedCareRecipient.id,
        name: savedCareRecipient.name 
      });
      
      return savedCareRecipient;
    } catch (error) {
      this.logger.error('Failed to create care recipient', error as Error, { 
        name: careRecipientData.name 
      });
      throw error;
    }
  }
}

// Update Care Recipient Use Case
export class UpdateCareRecipientUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private validationService: IValidationService,
    private logger: ILogger
  ) {}

  async execute(careRecipientId: string, updates: {
    name?: string;
    relationship?: string;
    caregiverNotes?: string;
  }): Promise<CareRecipient> {
    this.logger.info('Updating care recipient', { careRecipientId });
    
    try {
      // Get existing care recipient
      const existingCareRecipient = await this.careRecipientRepository.findById(careRecipientId);
      if (!existingCareRecipient) {
        throw new Error('Care recipient not found');
      }

      // Validate updates
      if (updates.name && !this.validationService.isValidName(updates.name)) {
        throw new Error('Invalid care recipient name');
      }

      // Update care recipient
      existingCareRecipient.updateProfile(updates);

      // Save changes
      const updatedCareRecipient = await this.careRecipientRepository.save(existingCareRecipient);
      
      this.logger.info('Care recipient updated successfully', { 
        id: updatedCareRecipient.id 
      });
      
      return updatedCareRecipient;
    } catch (error) {
      this.logger.error('Failed to update care recipient', error as Error, { careRecipientId });
      throw error;
    }
  }
}

// Deactivate Care Recipient Use Case
export class DeactivateCareRecipientUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private logger: ILogger
  ) {}

  async execute(careRecipientId: string): Promise<void> {
    this.logger.info('Deactivating care recipient', { careRecipientId });
    
    try {
      await this.careRecipientRepository.deactivate(careRecipientId);
      
      this.logger.info('Care recipient deactivated successfully', { careRecipientId });
    } catch (error) {
      this.logger.error('Failed to deactivate care recipient', error as Error, { careRecipientId });
      throw error;
    }
  }
}

// Add Medical Condition Use Case
export class AddMedicalConditionUseCase {
  constructor(
    private careRecipientRepository: ICareRecipientRepository,
    private logger: ILogger
  ) {}

  async execute(careRecipientId: string, condition: string): Promise<CareRecipient> {
    this.logger.info('Adding medical condition to care recipient', { careRecipientId, condition });
    
    try {
      // Get existing care recipient
      const careRecipient = await this.careRecipientRepository.findById(careRecipientId);
      if (!careRecipient) {
        throw new Error('Care recipient not found');
      }

      // Add medical condition
      careRecipient.addMedicalCondition(condition);

      // Save changes
      const updatedCareRecipient = await this.careRecipientRepository.save(careRecipient);
      
      this.logger.info('Medical condition added successfully', { 
        careRecipientId, 
        condition 
      });
      
      return updatedCareRecipient;
    } catch (error) {
      this.logger.error('Failed to add medical condition', error as Error, { 
        careRecipientId, 
        condition 
      });
      throw error;
    }
  }
}
