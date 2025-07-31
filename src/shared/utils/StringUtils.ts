// String Utilities
// Following Single Responsibility Principle - only handles string operations

export class StringUtils {
  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   */
  static capitalizeWords(str: string): string {
    if (!str) return str;
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert camelCase to readable format
   */
  static camelCaseToReadable(str: string): string {
    if (!str) return str;
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Convert snake_case to readable format
   */
  static snakeCaseToReadable(str: string): string {
    if (!str) return str;
    return str
      .split('_')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Truncate string to specified length with ellipsis
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * Truncate string at word boundary
   */
  static truncateWords(str: string, wordCount: number, suffix: string = '...'): string {
    if (!str) return str;
    const words = str.split(' ');
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(' ') + suffix;
  }

  /**
   * Remove HTML tags from string
   */
  static stripHtml(str: string): string {
    if (!str) return str;
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(str: string): string {
    if (!str) return str;
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return str.replace(/[&<>"'\/]/g, match => htmlEscapes[match]);
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate URL-safe slug from string
   */
  static createSlug(str: string): string {
    if (!str) return str;
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if format not recognized
  }

  /**
   * Mask sensitive information (e.g., email, phone)
   */
  static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    
    return this.formatPhoneNumber(masked);
  }

  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is valid email format
   */
  static isEmail(str: string): boolean {
    if (!str) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is valid URL
   */
  static isUrl(str: string): boolean {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract initials from name
   */
  static getInitials(name: string, maxInitials: number = 2): string {
    if (!name) return '';
    
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxInitials)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    return initials;
  }

  /**
   * Pluralize word based on count
   */
  static pluralize(word: string, count: number, suffix: string = 's'): string {
    return count === 1 ? word : word + suffix;
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Search for text within string (case insensitive)
   */
  static searchText(text: string, searchTerm: string): boolean {
    if (!text || !searchTerm) return false;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }

  /**
   * Highlight search term in text
   */
  static highlightText(text: string, searchTerm: string, className: string = 'highlight'): string {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  }
}
