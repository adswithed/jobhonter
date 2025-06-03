// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Job-related Types
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: string;
  url: string;
  source: JobSource;
  discoveredAt: Date;
  relevanceScore: number;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type JobSource = 'twitter' | 'reddit' | 'linkedin' | 'google' | 'facebook' | 'bing' | 'yahoo' | 'yandex';

export type JobStatus = 'discovered' | 'filtered' | 'applied' | 'rejected' | 'archived';

// Application Types
export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  emailSent: boolean;
  emailId?: string;
  response?: ApplicationResponse;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  job?: Job;
  user?: User;
}

export type ApplicationStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'replied' | 'rejected' | 'interview' | 'offer' | 'declined';

export interface ApplicationResponse {
  type: 'positive' | 'negative' | 'neutral';
  content: string;
  receivedAt: Date;
}

// Contact Discovery Types
export interface Contact {
  id: string;
  email: string;
  name?: string;
  title?: string;
  company: string;
  source: string;
  verified: boolean;
  discoveredAt: Date;
}

export interface ContactDiscoveryResult {
  contacts: Contact[];
  source: string;
  confidence: number;
  method: 'regex' | 'pattern' | 'crawl' | 'guess';
}

// Email Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: 'cover_letter' | 'follow_up' | 'thank_you' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: EmailProvider;
  sentAt: Date;
}

export type EmailProvider = 'smtp' | 'sendgrid' | 'mailgun' | 'resend';

// Scraper Types
export interface ScrapingJob {
  id: string;
  source: JobSource;
  query: string;
  status: ScrapingStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results: ScrapingResult;
  error?: string;
}

export type ScrapingStatus = 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScrapingResult {
  jobsFound: number;
  jobsProcessed: number;
  contactsFound: number;
  duplicatesFiltered: number;
  errors: string[];
}

export interface ScrapingConfig {
  source: JobSource;
  enabled: boolean;
  interval: number; // minutes
  keywords: string[];
  locations: string[];
  maxResults: number;
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
}

// Analytics Types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  applications: {
    sent: number;
    responded: number;
    interviews: number;
    offers: number;
  };
  jobs: {
    discovered: number;
    relevant: number;
    applied: number;
  };
  performance: {
    responseRate: number;
    interviewRate: number;
    offerRate: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Configuration Types
export interface UserPreferences {
  jobPreferences: {
    keywords: string[];
    locations: string[];
    salaryRange?: {
      min: number;
      max: number;
    };
    jobTypes: string[];
    experienceLevel: string[];
  };
  emailPreferences: {
    defaultTemplate: string;
    sendTime: string; // HH:mm format
    timezone: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  scraping: {
    sources: JobSource[];
    frequency: number; // hours
    maxApplicationsPerDay: number;
  };
}

// Error Types
export interface JobHonterError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
  timestamp: Date;
}

export type WebhookEventType = 
  | 'job.discovered'
  | 'application.sent'
  | 'application.responded'
  | 'email.delivered'
  | 'email.bounced'
  | 'scraping.completed'
  | 'error.occurred';

// AI Agent Types (for future use)
export interface AIGenerationRequest {
  type: 'cover_letter' | 'resume_customization' | 'email_subject';
  jobDescription: string;
  userProfile: UserProfile;
  companyInfo?: CompanyInfo;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'formal';
}

export interface UserProfile {
  name: string;
  email: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
}

export interface CompanyInfo {
  name: string;
  industry: string;
  size?: string;
  culture?: string;
  values?: string[];
} 