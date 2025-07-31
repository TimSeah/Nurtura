// Event Management Use Cases - Following Single Responsibility Principle
// Each use case handles one specific business operation

import { Event, EventType, EventStatus } from '../entities/Event';
import { IEventRepository } from '../interfaces/IRepositories';
import { IEmailService, ILogger } from '../interfaces/IServices';
import { IUseCase } from './UserUseCases';

// Create event use case
export interface CreateEventRequest {
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  duration?: number;
  remark?: string;
  enableReminder: boolean;
  reminderEmail?: string;
  eventType: EventType;
}

export interface CreateEventResponse {
  success: boolean;
  event?: Event;
  error?: string;
}

export class CreateEventUseCase implements IUseCase<CreateEventRequest, CreateEventResponse> {
  constructor(
    private eventRepository: IEventRepository,
    private logger: ILogger
  ) {}

  async execute(request: CreateEventRequest): Promise<CreateEventResponse> {
    try {
      this.logger.info('Creating new event', { userId: request.userId, title: request.title });

      // Validate date is not in the past
      const eventDateTime = new Date(request.date);
      const [hours, minutes] = request.startTime.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);

      if (eventDateTime < new Date()) {
        return {
          success: false,
          error: 'Cannot create events in the past'
        };
      }

      // Create event entity
      const event = Event.create({
        userId: request.userId,
        title: request.title,
        date: request.date,
        startTime: request.startTime,
        duration: request.duration,
        remark: request.remark,
        enableReminder: request.enableReminder,
        reminderEmail: request.reminderEmail,
        eventType: request.eventType,
        status: 'scheduled' as EventStatus
      });

      // Save event
      const savedEvent = await this.eventRepository.save(event);

      this.logger.info('Event created successfully', { eventId: savedEvent.id });

      return {
        success: true,
        event: savedEvent
      };
    } catch (error) {
      this.logger.error('Failed to create event', error as Error, { userId: request.userId });
      return {
        success: false,
        error: 'Failed to create event'
      };
    }
  }
}

// Get user events use case
export interface GetUserEventsRequest {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetUserEventsResponse {
  success: boolean;
  events?: Event[];
  error?: string;
}

export class GetUserEventsUseCase implements IUseCase<GetUserEventsRequest, GetUserEventsResponse> {
  constructor(
    private eventRepository: IEventRepository,
    private logger: ILogger
  ) {}

  async execute(request: GetUserEventsRequest): Promise<GetUserEventsResponse> {
    try {
      this.logger.info('Getting user events', { userId: request.userId });

      let events: Event[];

      if (request.startDate && request.endDate) {
        events = await this.eventRepository.findByDateRange(request.userId, request.startDate, request.endDate);
      } else {
        events = await this.eventRepository.findByUserId(request.userId);
      }

      return {
        success: true,
        events
      };
    } catch (error) {
      this.logger.error('Failed to get user events', error as Error, { userId: request.userId });
      return {
        success: false,
        error: 'Failed to retrieve events'
      };
    }
  }
}

// Send event reminder use case
export interface SendEventReminderRequest {
  eventId: string;
  recipientEmail?: string;
}

export interface SendEventReminderResponse {
  success: boolean;
  error?: string;
}

export class SendEventReminderUseCase implements IUseCase<SendEventReminderRequest, SendEventReminderResponse> {
  constructor(
    private eventRepository: IEventRepository,
    private emailService: IEmailService,
    private logger: ILogger
  ) {}

  async execute(request: SendEventReminderRequest): Promise<SendEventReminderResponse> {
    try {
      this.logger.info('Sending event reminder', { eventId: request.eventId });

      const event = await this.eventRepository.findById(request.eventId);
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      const recipientEmail = request.recipientEmail || event.reminderEmail;
      if (!recipientEmail) {
        return {
          success: false,
          error: 'No recipient email provided'
        };
      }

      // Send email reminder
      const emailSent = await this.emailService.sendEventReminder(
        event.toJSON(),
        recipientEmail
      );

      if (!emailSent) {
        return {
          success: false,
          error: 'Failed to send email reminder'
        };
      }

      // Mark reminder as sent
      event.markReminderSent();
      await this.eventRepository.save(event);

      this.logger.info('Event reminder sent successfully', { eventId: request.eventId });

      return {
        success: true
      };
    } catch (error) {
      this.logger.error('Failed to send event reminder', error as Error, { eventId: request.eventId });
      return {
        success: false,
        error: 'Failed to send reminder'
      };
    }
  }
}

// Update event use case
export interface UpdateEventRequest {
  eventId: string;
  updates: {
    title?: string;
    date?: Date;
    startTime?: string;
    duration?: number;
    remark?: string;
    enableReminder?: boolean;
    reminderEmail?: string;
    eventType?: EventType;
  };
}

export interface UpdateEventResponse {
  success: boolean;
  event?: Event;
  error?: string;
}

export class UpdateEventUseCase implements IUseCase<UpdateEventRequest, UpdateEventResponse> {
  constructor(
    private eventRepository: IEventRepository,
    private logger: ILogger
  ) {}

  async execute(request: UpdateEventRequest): Promise<UpdateEventResponse> {
    try {
      this.logger.info('Updating event', { eventId: request.eventId });

      const event = await this.eventRepository.findById(request.eventId);
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      // Validate date if being updated
      if (request.updates.date && request.updates.startTime) {
        const eventDateTime = new Date(request.updates.date);
        const [hours, minutes] = request.updates.startTime.split(':').map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);

        if (eventDateTime < new Date()) {
          return {
            success: false,
            error: 'Cannot schedule events in the past'
          };
        }
      }

      event.update(request.updates);
      const updatedEvent = await this.eventRepository.save(event);

      this.logger.info('Event updated successfully', { eventId: request.eventId });

      return {
        success: true,
        event: updatedEvent
      };
    } catch (error) {
      this.logger.error('Failed to update event', error as Error, { eventId: request.eventId });
      return {
        success: false,
        error: 'Failed to update event'
      };
    }
  }
}

// Delete event use case
export interface DeleteEventRequest {
  eventId: string;
}

export interface DeleteEventResponse {
  success: boolean;
  error?: string;
}

export class DeleteEventUseCase implements IUseCase<DeleteEventRequest, DeleteEventResponse> {
  constructor(
    private eventRepository: IEventRepository,
    private logger: ILogger
  ) {}

  async execute(request: DeleteEventRequest): Promise<DeleteEventResponse> {
    try {
      this.logger.info('Deleting event', { eventId: request.eventId });

      const event = await this.eventRepository.findById(request.eventId);
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      await this.eventRepository.delete(request.eventId);

      this.logger.info('Event deleted successfully', { eventId: request.eventId });

      return {
        success: true
      };
    } catch (error) {
      this.logger.error('Failed to delete event', error as Error, { eventId: request.eventId });
      return {
        success: false,
        error: 'Failed to delete event'
      };
    }
  }
}
