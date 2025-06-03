// Application Configuration
export const APP_CONFIG = {
  name: 'JobHonter',
  version: '1.0.0',
  description: 'AI-powered job application automation platform',
  url: 'https://jobhonter.com',
  api: {
    version: 'v1',
    timeout: 30000, // 30 seconds
    retries: 3,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
    reset: '/auth/reset-password',
  },
  users: {
    base: '/users',
    profile: '/users/profile',
    preferences: '/users/preferences',
  },
  jobs: {
    base: '/jobs',
    search: '/jobs/search',
    recommendations: '/jobs/recommendations',
  },
  applications: {
    base: '/applications',
    stats: '/applications/stats',
    bulk: '/applications/bulk',
  },
  scraping: {
    base: '/scraping',
    jobs: '/scraping/jobs',
    config: '/scraping/config',
    status: '/scraping/status',
  },
  email: {
    base: '/email',
    send: '/email/send',
    templates: '/email/templates',
    preview: '/email/preview',
  },
  contacts: {
    base: '/contacts',
    discover: '/contacts/discover',
    verify: '/contacts/verify',
  },
  analytics: {
    base: '/analytics',
    dashboard: '/analytics/dashboard',
    reports: '/analytics/reports',
  },
  admin: {
    base: '/admin',
    users: '/admin/users',
    system: '/admin/system',
    health: '/admin/health',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // External Services
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  SCRAPING_FAILED: 'SCRAPING_FAILED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// Job Sources Configuration
export const JOB_SOURCES = {
  twitter: {
    name: 'Twitter/X',
    baseUrl: 'https://twitter.com',
    rateLimit: { requestsPerMinute: 50, delayBetweenRequests: 1000 },
    enabled: true,
  },
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://reddit.com',
    rateLimit: { requestsPerMinute: 60, delayBetweenRequests: 1000 },
    enabled: true,
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com',
    rateLimit: { requestsPerMinute: 30, delayBetweenRequests: 2000 },
    enabled: true,
  },
  google: {
    name: 'Google Jobs',
    baseUrl: 'https://www.google.com/search',
    rateLimit: { requestsPerMinute: 100, delayBetweenRequests: 600 },
    enabled: true,
  },
  facebook: {
    name: 'Facebook',
    baseUrl: 'https://facebook.com',
    rateLimit: { requestsPerMinute: 40, delayBetweenRequests: 1500 },
    enabled: false, // Disabled by default due to stricter policies
  },
  bing: {
    name: 'Bing',
    baseUrl: 'https://www.bing.com/search',
    rateLimit: { requestsPerMinute: 80, delayBetweenRequests: 750 },
    enabled: true,
  },
  yahoo: {
    name: 'Yahoo',
    baseUrl: 'https://search.yahoo.com',
    rateLimit: { requestsPerMinute: 60, delayBetweenRequests: 1000 },
    enabled: true,
  },
  yandex: {
    name: 'Yandex',
    baseUrl: 'https://yandex.com/search',
    rateLimit: { requestsPerMinute: 70, delayBetweenRequests: 850 },
    enabled: true,
  },
} as const;

// Email Providers Configuration
export const EMAIL_PROVIDERS = {
  smtp: {
    name: 'SMTP',
    description: 'Standard SMTP server',
    maxDailyEmails: 1000,
    rateLimitPerHour: 100,
    priority: 1,
  },
  sendgrid: {
    name: 'SendGrid',
    description: 'SendGrid email service',
    maxDailyEmails: 10000,
    rateLimitPerHour: 1000,
    priority: 2,
  },
  mailgun: {
    name: 'Mailgun',
    description: 'Mailgun email service',
    maxDailyEmails: 10000,
    rateLimitPerHour: 1000,
    priority: 3,
  },
  resend: {
    name: 'Resend',
    description: 'Resend email service',
    maxDailyEmails: 5000,
    rateLimitPerHour: 500,
    priority: 4,
  },
} as const;

// Application Statuses with Descriptions
export const APPLICATION_STATUSES = {
  pending: { label: 'Pending', description: 'Application is being prepared', color: 'orange' },
  sent: { label: 'Sent', description: 'Application has been sent', color: 'blue' },
  delivered: { label: 'Delivered', description: 'Email was delivered successfully', color: 'green' },
  opened: { label: 'Opened', description: 'Recipient opened the email', color: 'cyan' },
  replied: { label: 'Replied', description: 'Recipient responded to the application', color: 'purple' },
  rejected: { label: 'Rejected', description: 'Application was rejected', color: 'red' },
  interview: { label: 'Interview', description: 'Interview scheduled or completed', color: 'yellow' },
  offer: { label: 'Offer', description: 'Job offer received', color: 'green' },
  declined: { label: 'Declined', description: 'Offer was declined', color: 'gray' },
} as const;

// Job Statuses with Descriptions
export const JOB_STATUSES = {
  discovered: { label: 'Discovered', description: 'Job was found by scraper', color: 'blue' },
  filtered: { label: 'Filtered', description: 'Job passed relevance filters', color: 'cyan' },
  applied: { label: 'Applied', description: 'Application was sent for this job', color: 'green' },
  rejected: { label: 'Rejected', description: 'Job was filtered out', color: 'red' },
  archived: { label: 'Archived', description: 'Job was archived', color: 'gray' },
} as const;

// Default User Preferences
export const DEFAULT_USER_PREFERENCES = {
  jobPreferences: {
    keywords: [],
    locations: [],
    jobTypes: ['full-time', 'remote'],
    experienceLevel: ['entry', 'mid', 'senior'],
  },
  emailPreferences: {
    defaultTemplate: 'professional',
    sendTime: '09:00',
    timezone: 'UTC',
    frequency: 'immediate' as const,
  },
  scraping: {
    sources: ['twitter', 'reddit', 'google'] as const,
    frequency: 24, // hours
    maxApplicationsPerDay: 10,
  },
} as const;

// Rate Limiting Configuration
export const RATE_LIMITS = {
  api: {
    global: { windowMs: 15 * 60 * 1000, max: 1000 }, // 15 minutes
    auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 15 minutes, 5 attempts
    scraping: { windowMs: 60 * 60 * 1000, max: 100 }, // 1 hour, 100 requests
    email: { windowMs: 60 * 60 * 1000, max: 50 }, // 1 hour, 50 emails
  },
  scraping: {
    defaultDelay: 1000, // 1 second between requests
    maxConcurrent: 5, // Maximum concurrent scrapers
    retryDelay: 5000, // 5 seconds between retries
    maxRetries: 3,
  },
  email: {
    defaultDelay: 2000, // 2 seconds between emails
    maxConcurrent: 3, // Maximum concurrent email sends
    retryDelay: 10000, // 10 seconds between retries
    maxRetries: 5,
  },
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256' as const,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxLength: 128,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict' as const,
  },
} as const;

// Pagination Defaults
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
  minLimit: 1,
} as const;

// File Upload Configuration
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  ttl: {
    default: 5 * 60, // 5 minutes
    userProfile: 15 * 60, // 15 minutes
    jobListings: 10 * 60, // 10 minutes
    analytics: 30 * 60, // 30 minutes
    scraping: 60 * 60, // 1 hour
  },
  keys: {
    userProfile: (userId: string) => `user:profile:${userId}`,
    jobListings: (query: string) => `jobs:list:${query}`,
    analytics: (period: string) => `analytics:${period}`,
    scrapingResult: (source: string, query: string) => `scraping:${source}:${query}`,
  },
} as const;

// Environment Variables
export const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  JWT_SECRET: 'JWT_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  REDIS_URL: 'REDIS_URL',
  
  // Email Provider Keys
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASS: 'SMTP_PASS',
  SENDGRID_API_KEY: 'SENDGRID_API_KEY',
  MAILGUN_API_KEY: 'MAILGUN_API_KEY',
  MAILGUN_DOMAIN: 'MAILGUN_DOMAIN',
  RESEND_API_KEY: 'RESEND_API_KEY',
  
  // AI Service Keys (for private package)
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  ANTHROPIC_API_KEY: 'ANTHROPIC_API_KEY',
  
  // Social Media API Keys
  TWITTER_API_KEY: 'TWITTER_API_KEY',
  TWITTER_API_SECRET: 'TWITTER_API_SECRET',
  REDDIT_CLIENT_ID: 'REDDIT_CLIENT_ID',
  REDDIT_CLIENT_SECRET: 'REDDIT_CLIENT_SECRET',
  LINKEDIN_CLIENT_ID: 'LINKEDIN_CLIENT_ID',
  LINKEDIN_CLIENT_SECRET: 'LINKEDIN_CLIENT_SECRET',
} as const; 