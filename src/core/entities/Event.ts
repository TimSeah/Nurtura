// Core Event Entity - Domain Model
// Follows Single Responsibility Principle - only handles event data and behavior

export interface EventProperties {
  id: string;
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  duration?: number; // in minutes
  remark?: string;
  enableReminder: boolean;
  reminderEmail?: string;
  reminderSent: boolean;
  eventType: EventType;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 
  | 'appointment'
  | 'medication'
  | 'therapy'
  | 'personal'
  | 'social'
  | 'emergency';

export type EventStatus = 
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'missed';

export class Event {
  private constructor(private props: EventProperties) {}

  static create(props: Omit<EventProperties, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent'>): Event {
    const now = new Date();
    return new Event({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      reminderSent: false
    });
  }

  static fromPersistence(props: EventProperties): Event {
    return new Event(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get date(): Date {
    return this.props.date;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get duration(): number | undefined {
    return this.props.duration;
  }

  get remark(): string | undefined {
    return this.props.remark;
  }

  get enableReminder(): boolean {
    return this.props.enableReminder;
  }

  get reminderEmail(): string | undefined {
    return this.props.reminderEmail;
  }

  get reminderSent(): boolean {
    return this.props.reminderSent;
  }

  get eventType(): EventType {
    return this.props.eventType;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get dateTime(): Date {
    const [hours, minutes] = this.props.startTime.split(':').map(Number);
    const eventDateTime = new Date(this.props.date);
    eventDateTime.setHours(hours, minutes, 0, 0);
    return eventDateTime;
  }

  get endTime(): string | undefined {
    if (!this.props.duration) return undefined;
    
    const [hours, minutes] = this.props.startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.props.duration;
    
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  isToday(): boolean {
    const today = new Date();
    return this.props.date.toDateString() === today.toDateString();
  }

  isUpcoming(): boolean {
    return this.dateTime > new Date();
  }

  isPast(): boolean {
    return this.dateTime < new Date();
  }

  isWithinHours(hours: number): boolean {
    const now = new Date();
    const hoursInMs = hours * 60 * 60 * 1000;
    const timeDiff = this.dateTime.getTime() - now.getTime();
    
    return timeDiff > 0 && timeDiff <= hoursInMs;
  }

  needsReminder(): boolean {
    return this.props.enableReminder && 
           !this.props.reminderSent && 
           this.isUpcoming() &&
           this.isWithinHours(1); // 1 hour before
  }

  update(updates: {
    title?: string;
    date?: Date;
    startTime?: string;
    duration?: number;
    remark?: string;
    enableReminder?: boolean;
    reminderEmail?: string;
    eventType?: EventType;
  }): void {
    Object.assign(this.props, updates);
    this.props.updatedAt = new Date();
  }

  markReminderSent(): void {
    this.props.reminderSent = true;
    this.props.updatedAt = new Date();
  }

  markCompleted(): void {
    this.props.status = 'completed';
    this.props.updatedAt = new Date();
  }

  markCancelled(): void {
    this.props.status = 'cancelled';
    this.props.updatedAt = new Date();
  }

  markMissed(): void {
    this.props.status = 'missed';
    this.props.updatedAt = new Date();
  }

  reschedule(newDate: Date, newStartTime: string): void {
    this.props.date = newDate;
    this.props.startTime = newStartTime;
    this.props.reminderSent = false; // Reset reminder status
    this.props.status = 'scheduled';
    this.props.updatedAt = new Date();
  }

  toJSON(): EventProperties {
    return { ...this.props };
  }
}
