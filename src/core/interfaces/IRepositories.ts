// Repository Interfaces - Following Interface Segregation Principle
// Each repository has a single, focused responsibility

import { User } from '../entities/User';
import { CareRecipient } from '../entities/CareRecipient';
import { VitalSigns } from '../entities/VitalSigns';
import { Event } from '../entities/Event';
import { Alert } from '../entities/Alert';

// Base repository interface with common operations
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// User repository interface
export interface IUserRepository extends IRepository<User> {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateSettings(userId: string, settings: any): Promise<void>;
}

// Care recipient repository interface
export interface ICareRecipientRepository extends IRepository<CareRecipient> {
  findByUserId(userId: string): Promise<CareRecipient[]>;
  findActiveByUserId(userId: string): Promise<CareRecipient[]>;
  deactivate(id: string): Promise<void>;
  activate(id: string): Promise<void>;
}

// Vital signs repository interface
export interface IVitalSignsRepository extends IRepository<VitalSigns> {
  findByRecipientId(recipientId: string): Promise<VitalSigns[]>;
  findByRecipientIdAndType(recipientId: string, type: string): Promise<VitalSigns[]>;
  findRecent(limit: number): Promise<VitalSigns[]>;
  findByDateRange(recipientId: string, startDate: Date, endDate: Date): Promise<VitalSigns[]>;
  findAbnormal(recipientId: string): Promise<VitalSigns[]>;
}

// Event repository interface
export interface IEventRepository extends IRepository<Event> {
  findByUserId(userId: string): Promise<Event[]>;
  findTodaysEvents(userId: string): Promise<Event[]>;
  findUpcomingEvents(userId: string, days?: number): Promise<Event[]>;
  findPendingReminders(): Promise<Event[]>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Event[]>;
  markReminderSent(eventId: string): Promise<void>;
}

// Alert repository interface
export interface IAlertRepository extends IRepository<Alert> {
  findByRecipientId(recipientId: string): Promise<Alert[]>;
  findUnreadByRecipientId(recipientId: string): Promise<Alert[]>;
  findByType(recipientId: string, type: string): Promise<Alert[]>;
  findByPriority(recipientId: string, priority: string): Promise<Alert[]>;
  markAsRead(alertId: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
  resolve(alertId: string): Promise<void>;
  findActive(recipientId: string): Promise<Alert[]>;
}
