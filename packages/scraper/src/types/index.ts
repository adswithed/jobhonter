import { z } from 'zod';

// Job data schema for validation
export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  description: z.string(),
  requirements: z.array(z.string()).default([]),
  salary: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
  remote: z.boolean().default(false),
  url: z.string().url(),
  source: z.enum(['twitter', 'reddit', 'linkedin', 'google', 'facebook', 'github']),
  contact: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
  postedAt: z.date(),
  expiresAt: z.date().optional(),
  scraped: z.object({
    scrapedAt: z.date(),
    scraperId: z.string(),
    rawData: z.record(z.any()).optional(),
  }),
});

export type Job = z.infer<typeof JobSchema>;

// Scraper configuration
export interface ScraperConfig {
  enabled: boolean;
  rateLimit: {
    requests: number;
    period: number; // in milliseconds
  };
  retry: {
    attempts: number;
    delay: number; // base delay in milliseconds
    backoff: 'exponential' | 'linear' | 'fixed';
  };
  userAgent: string;
  timeout: number; // in milliseconds
  concurrent: number; // max concurrent requests
  headers?: Record<string, string>;
}

// Scraper search parameters
export interface SearchParams {
  keywords: string[];
  location?: string;
  radius?: number; // in miles/km
  datePosted?: 'today' | 'week' | 'month' | 'any';
  jobType?: string[];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  limit?: number;
  offset?: number;
}

// Scraper result
export interface ScraperResult {
  jobs: Job[];
  totalFound: number;
  hasMore: boolean;
  nextPageToken?: string;
  metadata: {
    searchParams: SearchParams;
    scrapedAt: Date;
    scraperId: string;
    platform: string;
    took: number; // milliseconds
    errors: string[];
  };
}

// Base scraper interface
export interface IScraper {
  readonly id: string;
  readonly name: string;
  readonly platform: string;
  readonly config: ScraperConfig;

  // Main scraping method
  scrape(params: SearchParams): Promise<ScraperResult>;
  
  // Validation and health checks
  validate(): Promise<boolean>;
  test(): Promise<boolean>;
  
  // Configuration management
  updateConfig(config: Partial<ScraperConfig>): void;
  getStatus(): ScraperStatus;
}

// Scraper status
export interface ScraperStatus {
  id: string;
  name: string;
  platform: string;
  enabled: boolean;
  healthy: boolean;
  lastRun?: Date;
  lastSuccess?: Date;
  totalRuns: number;
  successRate: number;
  averageResponseTime: number;
  errors: ScraperError[];
}

// Error handling
export interface ScraperError {
  timestamp: Date;
  message: string;
  code: string;
  stack?: string;
  metadata?: Record<string, any>;
}

// Scraper events
export type ScraperEvent = 
  | { type: 'start'; scraperId: string; params: SearchParams }
  | { type: 'success'; scraperId: string; result: ScraperResult }
  | { type: 'error'; scraperId: string; error: ScraperError }
  | { type: 'complete'; scraperId: string; duration: number };

// Scraper manager interface
export interface IScraperManager {
  register(scraper: IScraper): void;
  unregister(scraperId: string): void;
  getScraper(scraperId: string): IScraper | undefined;
  getAllScrapers(): IScraper[];
  scrapeAll(params: SearchParams): Promise<ScraperResult[]>;
  getStatuses(): ScraperStatus[];
  
  // Event handling
  on(event: string, listener: (data: ScraperEvent) => void): void;
  off(event: string, listener: (data: ScraperEvent) => void): void;
  emit(event: string, data: ScraperEvent): void;
}

// Rate limiter interface
export interface IRateLimiter {
  consume(key: string, points?: number): Promise<void>;
  reset(key: string): Promise<void>;
  getStatus(key: string): Promise<{
    remainingPoints: number;
    msBeforeNext: number;
    totalHits: number;
  }>;
}

// Logger interface
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  child(defaultMeta: any): ILogger;
}

// Platform-specific configurations
export const PlatformConfigs: Record<string, ScraperConfig> = {
  twitter: {
    enabled: true,
    rateLimit: { requests: 100, period: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    retry: { attempts: 3, delay: 1000, backoff: 'exponential' },
    userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)',
    timeout: 30000,
    concurrent: 2,
  },
  reddit: {
    enabled: true,
    rateLimit: { requests: 60, period: 60 * 1000 }, // 60 requests per minute
    retry: { attempts: 2, delay: 500, backoff: 'linear' },
    userAgent: 'JobHonter/1.0 (by u/jobhonter)',
    timeout: 15000,
    concurrent: 3,
  },
  linkedin: {
    enabled: true,
    rateLimit: { requests: 30, period: 60 * 1000 }, // 30 requests per minute
    retry: { attempts: 3, delay: 2000, backoff: 'exponential' },
    userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)',
    timeout: 45000,
    concurrent: 1, // LinkedIn is strict
  },
  google: {
    enabled: true,
    rateLimit: { requests: 100, period: 60 * 1000 }, // 100 requests per minute
    retry: { attempts: 2, delay: 1000, backoff: 'fixed' },
    userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)',
    timeout: 20000,
    concurrent: 3,
  },
  facebook: {
    enabled: false, // Start disabled due to complexity
    rateLimit: { requests: 200, period: 60 * 60 * 1000 }, // 200 requests per hour
    retry: { attempts: 3, delay: 1000, backoff: 'exponential' },
    userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)',
    timeout: 30000,
    concurrent: 1,
  },
  github: {
    enabled: true,
    rateLimit: { requests: 5000, period: 60 * 60 * 1000 }, // 5000 requests per hour
    retry: { attempts: 2, delay: 1000, backoff: 'linear' },
    userAgent: 'JobHonter/1.0',
    timeout: 15000,
    concurrent: 5,
  },
};

// Utility types
export type Platform = keyof typeof PlatformConfigs;
export type JobType = Job['jobType'];
export type JobSource = Job['source'];

// Constants
export const JOB_KEYWORDS = [
  'hiring', 'job', 'opportunity', 'position', 'role', 'career',
  'software engineer', 'developer', 'programmer', 'frontend', 'backend',
  'full stack', 'devops', 'data scientist', 'product manager', 'designer',
  'marketing', 'sales', 'customer success', 'hr', 'finance', 'accounting',
  'remote work', 'work from home', 'freelance', 'contract', 'internship'
];

export const SALARY_KEYWORDS = [
  'salary', 'compensation', 'pay', 'wage', 'rate', 'remuneration',
  '$', 'usd', 'eur', 'gbp', 'cad', 'aud', 'k', 'thousand', 'million'
];

export const LOCATION_KEYWORDS = [
  'remote', 'work from home', 'wfh', 'distributed', 'anywhere',
  'san francisco', 'new york', 'london', 'toronto', 'berlin',
  'austin', 'seattle', 'boston', 'chicago', 'los angeles'
]; 