// Validation Service Implementation
// Follows Single Responsibility Principle - only handles validation logic

import { IValidationService } from '../../core/interfaces/IServices';

export class ValidationService implements IValidationService {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  private dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Banned words for username validation
  private bannedWords = [
    'admin', 'root', 'administrator', 'moderator', 'system',
    'test', 'guest', 'anonymous', 'user', 'null', 'undefined',
    // Add profanity and inappropriate words as needed
    'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch'
  ];

  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    return this.emailRegex.test(email.trim().toLowerCase()) && email.length <= 254;
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin123', 'letmein', 'welcome', 'monkey', 'dragon'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
    }

    return { valid: errors.length === 0, errors };
  }

  validateUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!username || typeof username !== 'string') {
      errors.push('Username is required');
      return { valid: false, errors };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (trimmedUsername.length > 20) {
      errors.push('Username must be less than 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (trimmedUsername.startsWith('_') || trimmedUsername.endsWith('_')) {
      errors.push('Username cannot start or end with an underscore');
    }

    if (trimmedUsername.includes('__')) {
      errors.push('Username cannot contain consecutive underscores');
    }

    // Check for banned words
    const normalizedUsername = trimmedUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    const containsBannedWord = this.bannedWords.some(word => 
      normalizedUsername.includes(word)
    );

    if (containsBannedWord) {
      errors.push('Username contains inappropriate content');
    }

    // Check if username is all numbers (not allowed)
    if (/^\d+$/.test(trimmedUsername)) {
      errors.push('Username cannot be all numbers');
    }

    return { valid: errors.length === 0, errors };
  }

  validatePhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    return this.phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  validateDate(date: string): boolean {
    if (!date || typeof date !== 'string') {
      return false;
    }
    
    if (!this.dateRegex.test(date)) {
      return false;
    }
    
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && 
           parsedDate.toISOString().split('T')[0] === date;
  }

  validateAge(dateOfBirth: string, minAge: number = 0, maxAge: number = 150): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.validateDate(dateOfBirth)) {
      errors.push('Invalid date format');
      return { valid: false, errors };
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge--;
    }

    if (actualAge < minAge) {
      errors.push(`Age must be at least ${minAge} years`);
    }

    if (actualAge > maxAge) {
      errors.push(`Age must be less than ${maxAge} years`);
    }

    if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    }

    return { valid: errors.length === 0, errors };
  }

  validateRequired(value: any, fieldName: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} is required`);
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      errors.push(`${fieldName} cannot be empty`);
    }
    
    return { valid: errors.length === 0, errors };
  }

  validateLength(value: string, fieldName: string, minLength?: number, maxLength?: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!value || typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
      return { valid: false, errors };
    }
    
    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters long`);
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${fieldName} must be less than ${maxLength} characters long`);
    }
    
    return { valid: errors.length === 0, errors };
  }

  isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 100 && /^[a-zA-Z\s'-]+$/.test(trimmedName);
  }

  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }
}
