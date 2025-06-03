import { z } from 'zod';

// User and Authentication Schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
});

// Job Schemas
export const JobSourceSchema = z.enum(['twitter', 'reddit', 'linkedin', 'google', 'facebook', 'bing', 'yahoo', 'yandex']);

export const JobStatusSchema = z.enum(['discovered', 'filtered', 'applied', 'rejected', 'archived']);

export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  company: z.string().min(1).max(255),
  description: z.string(),
  location: z.string().optional(),
  salary: z.string().optional(),
  url: z.string().url(),
  source: JobSourceSchema,
  discoveredAt: z.date(),
  relevanceScore: z.number().min(0).max(1),
  status: JobStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Application Schemas
export const ApplicationStatusSchema = z.enum([
  'pending', 'sent', 'delivered', 'opened', 'replied', 'rejected', 'interview', 'offer', 'declined'
]);

export const ApplicationResponseSchema = z.object({
  type: z.enum(['positive', 'negative', 'neutral']),
  content: z.string(),
  receivedAt: z.date(),
});

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  userId: z.string().uuid(),
  status: ApplicationStatusSchema,
  appliedAt: z.date(),
  emailSent: z.boolean(),
  emailId: z.string().optional(),
  response: ApplicationResponseSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Contact Discovery Schemas
export const ContactSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  title: z.string().optional(),
  company: z.string().min(1),
  source: z.string(),
  verified: z.boolean(),
  discoveredAt: z.date(),
});

export const ContactDiscoveryResultSchema = z.object({
  contacts: z.array(ContactSchema),
  source: z.string(),
  confidence: z.number().min(0).max(1),
  method: z.enum(['regex', 'pattern', 'crawl', 'guess']),
});

// Email Schemas
export const EmailProviderSchema = z.enum(['smtp', 'sendgrid', 'mailgun', 'resend']);

export const EmailTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  subject: z.string().min(1),
  body: z.string().min(1),
  variables: z.array(z.string()),
  type: z.enum(['cover_letter', 'follow_up', 'thank_you', 'custom']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmailSendResultSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
  provider: EmailProviderSchema,
  sentAt: z.date(),
});

// Scraper Schemas
export const ScrapingStatusSchema = z.enum(['scheduled', 'running', 'completed', 'failed', 'cancelled']);

export const ScrapingResultSchema = z.object({
  jobsFound: z.number().min(0),
  jobsProcessed: z.number().min(0),
  contactsFound: z.number().min(0),
  duplicatesFiltered: z.number().min(0),
  errors: z.array(z.string()),
});

export const ScrapingJobSchema = z.object({
  id: z.string().uuid(),
  source: JobSourceSchema,
  query: z.string().min(1),
  status: ScrapingStatusSchema,
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  results: ScrapingResultSchema,
  error: z.string().optional(),
});

export const ScrapingConfigSchema = z.object({
  source: JobSourceSchema,
  enabled: z.boolean(),
  interval: z.number().min(5), // minimum 5 minutes
  keywords: z.array(z.string().min(1)),
  locations: z.array(z.string()),
  maxResults: z.number().min(1).max(1000),
  rateLimit: z.object({
    requestsPerMinute: z.number().min(1).max(60),
    delayBetweenRequests: z.number().min(0),
  }),
});

// Analytics Schemas
export const AnalyticsDataSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']),
  applications: z.object({
    sent: z.number().min(0),
    responded: z.number().min(0),
    interviews: z.number().min(0),
    offers: z.number().min(0),
  }),
  jobs: z.object({
    discovered: z.number().min(0),
    relevant: z.number().min(0),
    applied: z.number().min(0),
  }),
  performance: z.object({
    responseRate: z.number().min(0).max(1),
    interviewRate: z.number().min(0).max(1),
    offerRate: z.number().min(0).max(1),
  }),
});

// API Response Schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().min(0),
    page: z.number().min(1),
    limit: z.number().min(1),
    hasMore: z.boolean(),
  });

// Configuration Schemas
export const UserPreferencesSchema = z.object({
  jobPreferences: z.object({
    keywords: z.array(z.string().min(1)),
    locations: z.array(z.string()),
    salaryRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    jobTypes: z.array(z.string()),
    experienceLevel: z.array(z.string()),
  }),
  emailPreferences: z.object({
    defaultTemplate: z.string(),
    sendTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
    timezone: z.string(),
    frequency: z.enum(['immediate', 'daily', 'weekly']),
  }),
  scraping: z.object({
    sources: z.array(JobSourceSchema),
    frequency: z.number().min(1).max(24), // hours
    maxApplicationsPerDay: z.number().min(1).max(100),
  }),
});

// Error Schemas
export const JobHonterErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.date(),
});

// Webhook Schemas
export const WebhookEventTypeSchema = z.enum([
  'job.discovered',
  'application.sent',
  'application.responded',
  'email.delivered',
  'email.bounced',
  'scraping.completed',
  'error.occurred',
]);

export const WebhookEventSchema = z.object({
  id: z.string().uuid(),
  type: WebhookEventTypeSchema,
  data: z.record(z.any()),
  timestamp: z.date(),
});

// Common validation schemas for API inputs
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(255),
  filters: z.record(z.any()).optional(),
});

// Export commonly used type inference helpers
export type UserInput = z.infer<typeof UserSchema>;
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;
export type RegisterDataInput = z.infer<typeof RegisterDataSchema>;
export type JobInput = z.infer<typeof JobSchema>;
export type ApplicationInput = z.infer<typeof ApplicationSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>; 