// Date Utilities
// Following Single Responsibility Principle - only handles date operations

export class DateUtils {
  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  static formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString();
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  /**
   * Format time for display (HH:MM)
   */
  static formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (Math.abs(diffMinutes) < 1) {
      return 'just now';
    }
    
    if (Math.abs(diffMinutes) < 60) {
      return diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}` 
                              : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} ago`;
    }
    
    if (Math.abs(diffHours) < 24) {
      return diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}` 
                           : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
    }
    
    if (Math.abs(diffDays) < 7) {
      return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` 
                          : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    }
    
    // For longer periods, just show the date
    return this.formatDate(date);
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return this.formatDateToISO(date) === this.formatDateToISO(today);
  }

  /**
   * Check if date is tomorrow
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDateToISO(date) === this.formatDateToISO(tomorrow);
  }

  /**
   * Check if date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDateToISO(date) === this.formatDateToISO(yesterday);
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to date
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add minutes to date
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Get age from date of birth
   */
  static getAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Check if date is within a certain range from now
   */
  static isWithinHours(date: Date, hours: number): boolean {
    const now = new Date();
    const diffMs = Math.abs(date.getTime() - now.getTime());
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= hours;
  }

  /**
   * Parse time string (HH:MM) and combine with date
   */
  static combineDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Get days in month
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Get first day of month (0 = Sunday, 1 = Monday, etc.)
   */
  static getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  /**
   * Check if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
}
