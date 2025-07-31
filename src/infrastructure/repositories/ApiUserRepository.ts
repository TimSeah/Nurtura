// API-based User Repository Implementation
// Follows Dependency Inversion Principle - depends on abstractions

import { User, UserProperties } from '../../core/entities/User';
import { IUserRepository } from '../../core/interfaces/IRepositories';
import { IApiClient, ILogger } from '../../core/interfaces/IServices';

export class ApiUserRepository implements IUserRepository {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      const userData = await this.apiClient.get<UserProperties>(`/users/${id}`);
      return userData ? User.fromPersistence(userData) : null;
    } catch (error) {
      this.logger.error('Failed to find user by ID', error as Error, { id });
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const userData = await this.apiClient.get<UserProperties>(`/users/username/${username}`);
      return userData ? User.fromPersistence(userData) : null;
    } catch (error) {
      this.logger.error('Failed to find user by username', error as Error, { username });
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const userData = await this.apiClient.get<UserProperties>(`/users/email/${email}`);
      return userData ? User.fromPersistence(userData) : null;
    } catch (error) {
      this.logger.error('Failed to find user by email', error as Error, { email });
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const usersData = await this.apiClient.get<UserProperties[]>('/users');
      return usersData.map(userData => User.fromPersistence(userData));
    } catch (error) {
      this.logger.error('Failed to find all users', error as Error);
      return [];
    }
  }

  async save(user: User): Promise<User> {
    try {
      const userData = user.toJSON();
      
      // Determine if this is a create or update operation
      const existingUser = await this.findById(user.id);
      
      if (existingUser) {
        // Update existing user
        const updatedData = await this.apiClient.put<UserProperties>(`/users/${user.id}`, userData);
        return User.fromPersistence(updatedData);
      } else {
        // Create new user
        const createdData = await this.apiClient.post<UserProperties>('/users', userData);
        return User.fromPersistence(createdData);
      }
    } catch (error) {
      this.logger.error('Failed to save user', error as Error, { userId: user.id });
      throw new Error('Failed to save user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/users/${id}`);
      this.logger.info('User deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete user', error as Error, { id });
      throw new Error('Failed to delete user');
    }
  }

  async updateSettings(userId: string, settings: any): Promise<void> {
    try {
      await this.apiClient.put(`/users/${userId}/settings`, settings);
      this.logger.info('User settings updated successfully', { userId });
    } catch (error) {
      this.logger.error('Failed to update user settings', error as Error, { userId });
      throw new Error('Failed to update user settings');
    }
  }
}
