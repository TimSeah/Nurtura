// User Management Use Cases - Following Single Responsibility Principle
// Each use case handles one specific business operation

import { User } from '../entities/User';
import { IUserRepository } from '../interfaces/IRepositories';
import { IValidationService, ILogger } from '../interfaces/IServices';

// Base use case interface
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// Get user profile use case
export interface GetUserProfileRequest {
  userId: string;
}

export interface GetUserProfileResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class GetUserProfileUseCase implements IUseCase<GetUserProfileRequest, GetUserProfileResponse> {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async execute(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    try {
      this.logger.info('Getting user profile', { userId: request.userId });
      
      const user = await this.userRepository.findById(request.userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      this.logger.error('Failed to get user profile', error as Error, { userId: request.userId });
      return {
        success: false,
        error: 'Failed to retrieve user profile'
      };
    }
  }
}

// Update user profile use case
export interface UpdateUserProfileRequest {
  userId: string;
  updates: {
    username?: string;
    email?: string;
  };
}

export interface UpdateUserProfileResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class UpdateUserProfileUseCase implements IUseCase<UpdateUserProfileRequest, UpdateUserProfileResponse> {
  constructor(
    private userRepository: IUserRepository,
    private validationService: IValidationService,
    private logger: ILogger
  ) {}

  async execute(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    try {
      this.logger.info('Updating user profile', { userId: request.userId });

      // Validate inputs
      if (request.updates.email && !this.validationService.validateEmail(request.updates.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      if (request.updates.username) {
        const usernameValidation = this.validationService.validateUsername(request.updates.username);
        if (!usernameValidation.valid) {
          return {
            success: false,
            error: usernameValidation.errors.join(', ')
          };
        }

        // Check if username is already taken
        const existingUser = await this.userRepository.findByUsername(request.updates.username);
        if (existingUser && existingUser.id !== request.userId) {
          return {
            success: false,
            error: 'Username is already taken'
          };
        }
      }

      // Get and update user
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      user.updateProfile(request.updates);
      const updatedUser = await this.userRepository.save(user);

      this.logger.info('User profile updated successfully', { userId: request.userId });

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      this.logger.error('Failed to update user profile', error as Error, { userId: request.userId });
      return {
        success: false,
        error: 'Failed to update user profile'
      };
    }
  }
}

// Update user settings use case
export interface UpdateUserSettingsRequest {
  userId: string;
  settings: any;
}

export interface UpdateUserSettingsResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class UpdateUserSettingsUseCase implements IUseCase<UpdateUserSettingsRequest, UpdateUserSettingsResponse> {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async execute(request: UpdateUserSettingsRequest): Promise<UpdateUserSettingsResponse> {
    try {
      this.logger.info('Updating user settings', { userId: request.userId });

      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      user.updateSettings(request.settings);
      const updatedUser = await this.userRepository.save(user);

      this.logger.info('User settings updated successfully', { userId: request.userId });

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      this.logger.error('Failed to update user settings', error as Error, { userId: request.userId });
      return {
        success: false,
        error: 'Failed to update user settings'
      };
    }
  }
}
