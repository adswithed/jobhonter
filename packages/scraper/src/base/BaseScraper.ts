import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import pRetry from 'p-retry';
import UserAgent from 'user-agents';
import winston from 'winston';
import {
  IScraper,
  ScraperConfig,
  SearchParams,
  ScraperResult,
  ScraperStatus,
  ScraperError,
  Job,
  JobSchema,
  ILogger
} from '../types';
import { RateLimiter } from '../utils/RateLimiter';
import { createLogger } from '../utils/Logger';

export abstract class BaseScraper extends EventEmitter implements IScraper {
  protected rateLimiter: RateLimiter;
  protected logger: ILogger;
  protected stats: {
    totalRuns: number;
    successfulRuns: number;
    totalResponseTime: number;
    lastRun?: Date;
    lastSuccess?: Date;
    errors: ScraperError[];
  };

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly platform: string,
    protected _config: ScraperConfig
  ) {
    super();
    
    this.rateLimiter = new RateLimiter(this._config.rateLimit);
    this.logger = createLogger(`scraper:${this.platform}`);
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      totalResponseTime: 0,
      errors: []
    };

    this.logger.info(`${this.name} scraper initialized`, {
      id: this.id,
      platform: this.platform,
      config: this._config
    });
  }

  get config(): ScraperConfig {
    return { ...this._config };
  }

  updateConfig(config: Partial<ScraperConfig>): void {
    this._config = { ...this._config, ...config };
    this.rateLimiter = new RateLimiter(this._config.rateLimit);
    this.logger.info('Scraper config updated', { config: this._config });
  }

  async scrape(params: SearchParams): Promise<ScraperResult> {
    if (!this._config.enabled) {
      throw new Error(`${this.name} scraper is disabled`);
    }

    const startTime = performance.now();
    this.stats.totalRuns++;
    this.stats.lastRun = new Date();

    this.logger.info('Starting scrape operation', { 
      params, 
      scraperId: this.id 
    });

    this.emit('scrapeStart', { 
      scraperId: this.id, 
      params 
    });

    try {
      // Rate limiting
      await this.rateLimiter.consume(this.id);

      // Retry wrapper for the actual scraping
      const result = await pRetry(
        async () => {
          return await this.performScrape(params);
        },
        {
          retries: this._config.retry.attempts,
          minTimeout: this._config.retry.delay,
          factor: this._config.retry.backoff === 'exponential' ? 2 : 1,
          randomize: true,
          onFailedAttempt: (error) => {
            this.logger.warn('Scrape attempt failed', {
              attempt: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              error: error.message
            });
          }
        }
      );

      // Validate scraped jobs
      const validatedJobs = this.validateJobs(result.jobs);
      const finalResult: ScraperResult = {
        ...result,
        jobs: validatedJobs,
        metadata: {
          ...result.metadata,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: this.platform,
          took: performance.now() - startTime
        }
      };

      // Update stats
      this.stats.successfulRuns++;
      this.stats.lastSuccess = new Date();
      this.stats.totalResponseTime += finalResult.metadata.took;

      this.logger.info('Scrape operation completed successfully', {
        jobsFound: finalResult.jobs.length,
        totalFound: finalResult.totalFound,
        took: finalResult.metadata.took
      });

      this.emit('scrapeSuccess', { 
        scraperId: this.id, 
        result: finalResult 
      });

      return finalResult;

    } catch (error) {
      const scraperError: ScraperError = {
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        stack: error instanceof Error ? error.stack : undefined,
        metadata: { params }
      };

      this.stats.errors.push(scraperError);
      
      // Keep only last 50 errors
      if (this.stats.errors.length > 50) {
        this.stats.errors = this.stats.errors.slice(-50);
      }

      this.logger.error('Scrape operation failed', {
        error: scraperError,
        params
      });

      this.emit('scrapeError', { 
        scraperId: this.id, 
        error: scraperError 
      });

      throw error;
    } finally {
      this.emit('scrapeComplete', { 
        scraperId: this.id, 
        duration: performance.now() - startTime 
      });
    }
  }

  getStatus(): ScraperStatus {
    const successRate = this.stats.totalRuns > 0 
      ? (this.stats.successfulRuns / this.stats.totalRuns) * 100 
      : 0;

    const averageResponseTime = this.stats.successfulRuns > 0 
      ? this.stats.totalResponseTime / this.stats.successfulRuns 
      : 0;

    return {
      id: this.id,
      name: this.name,
      platform: this.platform,
      enabled: this._config.enabled,
      healthy: successRate >= 70, // Consider healthy if 70%+ success rate
      lastRun: this.stats.lastRun,
      lastSuccess: this.stats.lastSuccess,
      totalRuns: this.stats.totalRuns,
      successRate,
      averageResponseTime,
      errors: this.stats.errors.slice(-10) // Return last 10 errors
    };
  }

  async validate(): Promise<boolean> {
    try {
      await this.performValidation();
      return true;
    } catch (error) {
      this.logger.error('Validation failed', { error });
      return false;
    }
  }

  async test(): Promise<boolean> {
    try {
      const testParams: SearchParams = {
        keywords: ['software engineer'],
        limit: 1
      };

      const result = await this.scrape(testParams);
      return result.jobs.length >= 0; // Success if no errors thrown
    } catch (error) {
      this.logger.error('Test scrape failed', { error });
      return false;
    }
  }

  protected validateJobs(jobs: Job[]): Job[] {
    const validJobs: Job[] = [];

    for (const job of jobs) {
      try {
        const validatedJob = JobSchema.parse(job);
        validJobs.push(validatedJob);
      } catch (error) {
        this.logger.warn('Invalid job data encountered', {
          job,
          error: error instanceof Error ? error.message : 'Unknown validation error'
        });
      }
    }

    this.logger.debug(`Validated ${validJobs.length}/${jobs.length} jobs`);
    return validJobs;
  }

  protected generateJobId(job: Partial<Job>): string {
    // Create a unique ID based on job content
    const content = `${job.title}-${job.company}-${job.url}`;
    return Buffer.from(content).toString('base64').slice(0, 16);
  }

  protected normalizeJobType(jobType: string): Job['jobType'] {
    const normalized = jobType.toLowerCase().trim();
    
    if (normalized.includes('full') && normalized.includes('time')) return 'full-time';
    if (normalized.includes('part') && normalized.includes('time')) return 'part-time';
    if (normalized.includes('contract')) return 'contract';
    if (normalized.includes('intern')) return 'internship';
    if (normalized.includes('freelance')) return 'freelance';
    
    return 'full-time'; // Default
  }

  protected isRemoteJob(description: string, location: string = ''): boolean {
    const text = `${description} ${location}`.toLowerCase();
    return /\b(remote|work from home|wfh|distributed|anywhere)\b/.test(text);
  }

  protected extractSalary(text: string): string | undefined {
    // Look for salary patterns
    const salaryPatterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand)?/gi,
      /(\d{1,3}(?:,\d{3})*)\s*(?:k|thousand)\s*(?:per year|annually|\/year)?/gi,
      /(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*(?:k|thousand)?/gi
    ];

    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  protected getRandomUserAgent(): string {
    if (this._config.userAgent.includes('Mozilla')) {
      // Use a random user agent
      const userAgent = new UserAgent();
      return userAgent.toString();
    }
    return this._config.userAgent;
  }

  protected createDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract methods that must be implemented by platform-specific scrapers
  protected abstract performScrape(params: SearchParams): Promise<ScraperResult>;
  protected abstract performValidation(): Promise<void>;
}

export default BaseScraper; 