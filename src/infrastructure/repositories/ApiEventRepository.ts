// API-based Event Repository Implementation
// Follows Dependency Inversion Principle - depends on abstractions

import { Event, EventProperties } from '../../core/entities/Event';
import { IEventRepository } from '../../core/interfaces/IRepositories';
import { IApiClient, ILogger } from '../../core/interfaces/IServices';

export class ApiEventRepository implements IEventRepository {
  constructor(
    private apiClient: IApiClient,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<Event | null> {
    try {
      const eventData = await this.apiClient.get<EventProperties>(`/events/${id}`);
      return eventData ? Event.fromPersistence(eventData) : null;
    } catch (error) {
      this.logger.error('Failed to find event by ID', error as Error, { id });
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Event[]> {
    try {
      const eventsData = await this.apiClient.get<EventProperties[]>(`/events/user/${userId}`);
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find events by user ID', error as Error, { userId });
      return [];
    }
  }

  async findTodaysEvents(userId: string): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const eventsData = await this.apiClient.get<EventProperties[]>(`/events/user/${userId}/date/${today}`);
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find today\'s events', error as Error, { userId });
      return [];
    }
  }

  async findUpcomingEvents(userId: string, days: number = 7): Promise<Event[]> {
    try {
      const eventsData = await this.apiClient.get<EventProperties[]>(`/events/user/${userId}/upcoming`, {
        days
      });
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find upcoming events', error as Error, { userId, days });
      return [];
    }
  }

  async findPendingReminders(): Promise<Event[]> {
    try {
      const eventsData = await this.apiClient.get<EventProperties[]>('/events/pending-reminders');
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find pending reminders', error as Error);
      return [];
    }
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    try {
      const eventsData = await this.apiClient.get<EventProperties[]>(`/events/user/${userId}/range`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find events by date range', error as Error, { userId, startDate, endDate });
      return [];
    }
  }

  async findAll(): Promise<Event[]> {
    try {
      const eventsData = await this.apiClient.get<EventProperties[]>('/events');
      return eventsData.map(eventData => Event.fromPersistence(eventData));
    } catch (error) {
      this.logger.error('Failed to find all events', error as Error);
      return [];
    }
  }

  async save(event: Event): Promise<Event> {
    try {
      const eventData = event.toJSON();
      
      // Determine if this is a create or update operation
      const existingEvent = await this.findById(event.id);
      
      if (existingEvent) {
        // Update existing event
        const updatedData = await this.apiClient.put<EventProperties>(`/events/${event.id}`, eventData);
        return Event.fromPersistence(updatedData);
      } else {
        // Create new event
        const createdData = await this.apiClient.post<EventProperties>('/events', eventData);
        return Event.fromPersistence(createdData);
      }
    } catch (error) {
      this.logger.error('Failed to save event', error as Error, { eventId: event.id });
      throw new Error('Failed to save event');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/events/${id}`);
      this.logger.info('Event deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete event', error as Error, { id });
      throw new Error('Failed to delete event');
    }
  }

  async markReminderSent(eventId: string): Promise<void> {
    try {
      await this.apiClient.put(`/events/${eventId}/reminder-sent`, {});
      this.logger.info('Event reminder marked as sent', { eventId });
    } catch (error) {
      this.logger.error('Failed to mark reminder as sent', error as Error, { eventId });
      throw new Error('Failed to mark reminder as sent');
    }
  }
}
