import { JobHonterError } from './types';

// Date Utilities
export const dateUtils = {
  /**
   * Format date to ISO string
   */
  toISOString: (date: Date): string => date.toISOString(),

  /**
   * Parse ISO string to Date
   */
  fromISOString: (isoString: string): Date => new Date(isoString),

  /**
   * Get current timestamp
   */
  now: (): Date => new Date(),

  /**
   * Add days to a date
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Add hours to a date
   */
  addHours: (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  /**
   * Check if date is within last N days
   */
  isWithinDays: (date: Date, days: number): boolean => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  },

  /**
   * Format date for display
   */
  formatForDisplay: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },
};

// String Utilities
export const stringUtils = {
  /**
   * Generate random string
   */
  generateId: (length = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Slugify string
   */
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  /**
   * Remove HTML tags
   */
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  /**
   * Extract domain from URL
   */
  extractDomain: (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  /**
   * Normalize whitespace
   */
  normalizeWhitespace: (str: string): string => {
    return str.replace(/\s+/g, ' ').trim();
  },
};

// Validation Utilities
export const validationUtils = {
  /**
   * Check if string is valid email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if string is valid URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if string is valid UUID
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Array Utilities
export const arrayUtils = {
  /**
   * Remove duplicates from array
   */
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  /**
   * Chunk array into smaller arrays
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Shuffle array
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Get random item from array
   */
  randomItem: <T>(array: T[]): T | undefined => {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Group array by key
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
};

// Object Utilities
export const objectUtils = {
  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  },

  /**
   * Pick specific keys from object
   */
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const picked = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        picked[key] = obj[key];
      }
    });
    return picked;
  },

  /**
   * Omit specific keys from object
   */
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const omitted = { ...obj };
    keys.forEach(key => {
      delete omitted[key];
    });
    return omitted;
  },

  /**
   * Check if object is empty
   */
  isEmpty: (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  },

  /**
   * Flatten nested object
   */
  flatten: (obj: Record<string, any>, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, objectUtils.flatten(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  },
};

// Async Utilities
export const asyncUtils = {
  /**
   * Sleep for specified milliseconds
   */
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry function with exponential backoff
   */
  retry: async <T>(
    fn: () => Promise<T>,
    options: {
      retries?: number;
      delay?: number;
      backoff?: number;
      onRetry?: (error: Error, attempt: number) => void;
    } = {}
  ): Promise<T> => {
    const { retries = 3, delay = 1000, backoff = 2, onRetry } = options;
    
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw lastError;
        }
        
        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }
        
        const sleepTime = delay * Math.pow(backoff, attempt);
        await asyncUtils.sleep(sleepTime);
      }
    }
    
    throw lastError!;
  },

  /**
   * Timeout a promise
   */
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
      }),
    ]);
  },

  /**
   * Execute promises with concurrency limit
   */
  mapConcurrent: async <T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    concurrency = 5
  ): Promise<R[]> => {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
      const promise = fn(items[i], i).then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  },
};

// Error Utilities
export const errorUtils = {
  /**
   * Create JobHonter error
   */
  createError: (code: string, message: string, details?: Record<string, any>): JobHonterError => {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  },

  /**
   * Check if error is JobHonter error
   */
  isJobHonterError: (error: any): error is JobHonterError => {
    return error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error;
  },

  /**
   * Extract error message
   */
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (errorUtils.isJobHonterError(error)) return error.message;
    return 'An unknown error occurred';
  },

  /**
   * Log error with context
   */
  logError: (error: unknown, context?: Record<string, any>): void => {
    const message = errorUtils.getErrorMessage(error);
    const errorData = {
      message,
      error: error instanceof Error ? error.stack : error,
      context,
      timestamp: new Date().toISOString(),
    };
    
    // In production, this would integrate with logging service
    console.error('JobHonter Error:', JSON.stringify(errorData, null, 2));
  },
};

// Rate Limiting Utilities
export const rateLimitUtils = {
  /**
   * Simple in-memory rate limiter
   */
  createRateLimiter: (maxRequests: number, windowMs: number) => {
    const requests = new Map<string, number[]>();

    return {
      isAllowed: (key: string): boolean => {
        const now = Date.now();
        const userRequests = requests.get(key) || [];
        
        // Remove requests outside the window
        const validRequests = userRequests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
          return false;
        }
        
        validRequests.push(now);
        requests.set(key, validRequests);
        return true;
      },
      
      getRemainingRequests: (key: string): number => {
        const now = Date.now();
        const userRequests = requests.get(key) || [];
        const validRequests = userRequests.filter(time => now - time < windowMs);
        return Math.max(0, maxRequests - validRequests.length);
      },
      
      getResetTime: (key: string): Date => {
        const userRequests = requests.get(key) || [];
        if (userRequests.length === 0) return new Date();
        
        const oldestRequest = Math.min(...userRequests);
        return new Date(oldestRequest + windowMs);
      },
    };
  },
};

// Crypto Utilities (basic, for security use proper crypto libraries)
export const cryptoUtils = {
  /**
   * Generate UUID v4
   */
  generateUUID: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Simple hash function (not cryptographically secure)
   */
  simpleHash: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  },
};

// Export all utilities
export const utils = {
  date: dateUtils,
  string: stringUtils,
  validation: validationUtils,
  array: arrayUtils,
  object: objectUtils,
  async: asyncUtils,
  error: errorUtils,
  rateLimit: rateLimitUtils,
  crypto: cryptoUtils,
}; 