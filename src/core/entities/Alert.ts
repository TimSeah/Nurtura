// Core Alert Entity - Domain Model
// Follows Single Responsibility Principle - only handles alert data and behavior

export interface AlertProperties {
  id: string;
  recipientId: string;
  type: AlertType;
  title: string;
  description: string;
  priority: AlertPriority;
  isRead: boolean;
  isResolved: boolean;
  actionRequired: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type AlertType = 
  | 'medication'
  | 'appointment'
  | 'vital_signs'
  | 'emergency'
  | 'reminder'
  | 'system';

export type AlertPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export class Alert {
  private constructor(private props: AlertProperties) {}

  static create(props: Omit<AlertProperties, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isResolved'>): Alert {
    const now = new Date();
    return new Alert({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      isRead: false,
      isResolved: false
    });
  }

  static fromPersistence(props: AlertProperties): Alert {
    return new Alert(props);
  }

  get id(): string {
    return this.props.id;
  }

  get recipientId(): string {
    return this.props.recipientId;
  }

  get type(): AlertType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get priority(): AlertPriority {
    return this.props.priority;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get isResolved(): boolean {
    return this.props.isResolved;
  }

  get actionRequired(): boolean {
    return this.props.actionRequired;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get resolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  get isUnread(): boolean {
    return !this.props.isRead;
  }

  get isActive(): boolean {
    return !this.props.isResolved;
  }

  get age(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.props.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  get priorityColor(): string {
    switch (this.props.priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#65a30d';
      default:
        return '#6b7280';
    }
  }

  get typeIcon(): string {
    switch (this.props.type) {
      case 'medication':
        return '💊';
      case 'appointment':
        return '📅';
      case 'vital_signs':
        return '❤️';
      case 'emergency':
        return '🚨';
      case 'reminder':
        return '⏰';
      case 'system':
        return '⚙️';
      default:
        return '📋';
    }
  }

  isExpired(daysThreshold: number = 30): boolean {
    return this.age > daysThreshold;
  }

  markAsRead(): void {
    if (!this.props.isRead) {
      this.props.isRead = true;
      this.props.updatedAt = new Date();
    }
  }

  markAsUnread(): void {
    if (this.props.isRead) {
      this.props.isRead = false;
      this.props.updatedAt = new Date();
    }
  }

  resolve(): void {
    if (!this.props.isResolved) {
      this.props.isResolved = true;
      this.props.resolvedAt = new Date();
      this.props.updatedAt = new Date();
      
      // Automatically mark as read when resolved
      if (!this.props.isRead) {
        this.props.isRead = true;
      }
    }
  }

  unresolve(): void {
    if (this.props.isResolved) {
      this.props.isResolved = false;
      this.props.resolvedAt = undefined;
      this.props.updatedAt = new Date();
    }
  }

  updatePriority(priority: AlertPriority): void {
    if (this.props.priority !== priority) {
      this.props.priority = priority;
      this.props.updatedAt = new Date();
    }
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  addMetadata(key: string, value: any): void {
    if (!this.props.metadata) {
      this.props.metadata = {};
    }
    this.props.metadata[key] = value;
    this.props.updatedAt = new Date();
  }

  removeMetadata(key: string): void {
    if (this.props.metadata && key in this.props.metadata) {
      delete this.props.metadata[key];
      this.props.updatedAt = new Date();
    }
  }

  toJSON(): AlertProperties {
    return { ...this.props };
  }
}
