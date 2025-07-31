// Clean Architecture: Events Hook
// Follows Dependency Inversion - depends on abstractions (use cases) not concrete implementations

import { useState, useEffect, useCallback } from 'react';
import { Event } from '../../core/entities/Event';
import { container } from '../../shared/DIContainer';

// Mock logger for now - will be integrated with actual logger later
const Logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data)
};

// Type definitions for hook parameters and return values
export interface UseEventsFilters {
  eventType?: 'appointment' | 'medication' | 'exercise' | 'meal' | 'reminder' | 'all';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  showCompleted?: boolean;
  showUpcoming?: boolean;
  recipientId?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  eventType: string;
  scheduledAt: Date;
  duration?: number; // in minutes
  location?: string;
  recipientId?: string;
  reminderSettings?: {
    enabled: boolean;
    reminderTime: number; // minutes before event
  };
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'none';
    endDate?: Date;
  };
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'missed';
}

// Custom hook for managing events
export function useEvents(userId: string) {
  // State management following immutable patterns
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<UseEventsFilters>({
    eventType: 'all',
    showCompleted: true,
    showUpcoming: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get use cases from dependency injection container
  const createEventUseCase = container.get<any>('createEventUseCase');
  const getUserEventsUseCase = container.get<any>('getUserEventsUseCase');
  const updateEventUseCase = container.get<any>('updateEventUseCase');
  const deleteEventUseCase = container.get<any>('deleteEventUseCase');
  const sendEventReminderUseCase = container.get<any>('sendEventReminderUseCase');

  // Filter events based on current filters
  const applyFilters = useCallback((eventList: Event[], currentFilters: UseEventsFilters): Event[] => {
    return eventList.filter(event => {
      // Event type filter
      if (currentFilters.eventType && currentFilters.eventType !== 'all' && 
          event.eventType !== currentFilters.eventType) {
        return false;
      }

      // Date range filter
      if (currentFilters.dateRange) {
        const eventDate = event.dateTime;
        if (eventDate < currentFilters.dateRange.startDate || 
            eventDate > currentFilters.dateRange.endDate) {
          return false;
        }
      }

      // Completed events filter
      if (!currentFilters.showCompleted && event.status === 'completed') {
        return false;
      }

      // Upcoming events filter
      if (!currentFilters.showUpcoming && event.status !== 'completed') {
        return false;
      }

      // Recipient filter - Note: Event entity doesn't have recipientId, using userId instead
      if (currentFilters.recipientId && event.userId !== currentFilters.recipientId) {
        return false;
      }

      return true;
    });
  }, []);

  // Load events for user
  const loadEvents = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Loading events for user', { userId });
      
      const result = await getUserEventsUseCase.execute(userId);
      
      if (result && Array.isArray(result)) {
        setEvents(result);
        Logger.info('Events loaded successfully', { count: result.length });
      } else {
        const errorMessage = 'Failed to load events';
        setError(errorMessage);
        Logger.error('Failed to load events', { userId });
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while loading events';
      setError(errorMessage);
      Logger.error('Unexpected error loading events', { error: err, userId });
    } finally {
      setIsLoading(false);
    }
  }, [userId, getUserEventsUseCase]);

  // Create new event
  const createEvent = useCallback(async (data: CreateEventData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Creating event', { title: data.title, type: data.eventType });
      
      const result = await createEventUseCase.execute({
        ...data,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (result) {
        // Update local state with new event
        setEvents(prev => [result, ...prev]);
        Logger.info('Event created successfully', { title: data.title });
        return true;
      } else {
        const errorMessage = 'Failed to create event';
        setError(errorMessage);
        Logger.error('Failed to create event', { title: data.title });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while creating event';
      setError(errorMessage);
      Logger.error('Unexpected error creating event', { error: err, title: data.title });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, createEventUseCase]);

  // Update existing event
  const updateEvent = useCallback(async (data: UpdateEventData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Updating event', { eventId: data.id });
      
      const result = await updateEventUseCase.execute({
        ...data,
        updatedAt: new Date()
      });
      
      if (result) {
        // Update local state
        setEvents(prev => 
          prev.map(event => 
            event.id === data.id ? result : event
          )
        );
        Logger.info('Event updated successfully', { eventId: data.id });
        return true;
      } else {
        const errorMessage = 'Failed to update event';
        setError(errorMessage);
        Logger.error('Failed to update event', { eventId: data.id });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating event';
      setError(errorMessage);
      Logger.error('Unexpected error updating event', { error: err, eventId: data.id });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateEventUseCase]);

  // Delete event
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Deleting event', { eventId });
      
      const result = await deleteEventUseCase.execute(eventId);
      
      if (result) {
        // Remove from local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        Logger.info('Event deleted successfully', { eventId });
        return true;
      } else {
        const errorMessage = 'Failed to delete event';
        setError(errorMessage);
        Logger.error('Failed to delete event', { eventId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while deleting event';
      setError(errorMessage);
      Logger.error('Unexpected error deleting event', { error: err, eventId });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deleteEventUseCase]);

  // Mark event as completed
  const completeEvent = useCallback(async (eventId: string): Promise<boolean> => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
      setError('Event not found');
      return false;
    }

    return updateEvent({
      id: eventId,
      status: 'completed'
    });
  }, [events, updateEvent]);

  // Send event reminder
  const sendReminder = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      Logger.info('Sending event reminder', { eventId });
      
      const result = await sendEventReminderUseCase.execute(eventId);
      
      if (result) {
        Logger.info('Event reminder sent successfully', { eventId });
        return true;
      } else {
        const errorMessage = 'Failed to send event reminder';
        setError(errorMessage);
        Logger.error('Failed to send event reminder', { eventId });
        return false;
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while sending reminder';
      setError(errorMessage);
      Logger.error('Unexpected error sending reminder', { error: err, eventId });
      return false;
    }
  }, [sendEventReminderUseCase]);

  // Refresh events data
  const refreshEvents = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = applyFilters(events, filters);
    setFilteredEvents(filtered);
  }, [events, filters, applyFilters]);

  // Load initial data
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Computed values
  const getTotalCount = useCallback(() => events.length, [events]);
  const getCompletedCount = useCallback(() => events.filter(e => e.status === 'completed').length, [events]);
  const getUpcomingCount = useCallback(() => events.filter(e => e.status !== 'completed' && e.dateTime > new Date()).length, [events]);
  const getOverdueCount = useCallback(() => events.filter(e => e.status !== 'completed' && e.dateTime < new Date()).length, [events]);
  const getTypeCount = useCallback((type: string) => events.filter(e => e.eventType === type).length, [events]);

  // Get today's events
  const getTodaysEvents = useCallback(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return events.filter(event => 
      event.dateTime >= startOfDay && 
      event.dateTime < endOfDay
    );
  }, [events]);

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = useCallback((days: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return events
      .filter(event => 
        event.status !== 'completed' && 
        event.dateTime > now && 
        event.dateTime <= futureDate
      )
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }, [events]);

  // Get events requiring reminders
  const getEventsNeedingReminders = useCallback(() => {
    const now = new Date();
    const reminderThreshold = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    return events.filter(event => 
      event.status !== 'completed' && 
      event.dateTime <= reminderThreshold && 
      event.dateTime > now &&
      !event.reminderSent
    );
  }, [events]);

  return {
    // Data
    events,
    filteredEvents,
    filters,
    
    // State
    isLoading,
    error,
    
    // Actions
    setFilters,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    sendReminder,
    refreshEvents,
    
    // Computed values
    getTotalCount,
    getCompletedCount,
    getUpcomingCount,
    getOverdueCount,
    getTypeCount,
    getTodaysEvents,
    getUpcomingEvents,
    getEventsNeedingReminders
  };
}
