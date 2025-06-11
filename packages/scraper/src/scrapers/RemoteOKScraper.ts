import axios, { AxiosInstance } from 'axios';
import { format, subDays } from 'date-fns';
import {
  SearchParams,
  ScraperResult,
  Job,
  PlatformConfigs,
  JOB_KEYWORDS
} from '../types';
import { BaseScraper } from '../base/BaseScraper';

interface RemoteOKJob {
  id: string;
  slug: string;
  epoch: number;
  date: string;
  company: string;
  company_logo?: string;
  position: string;
  tags: string[];
  logo?: string;
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  apply_url: string;
  url: string;
  original?: boolean;
  verified?: boolean;
}

interface RemoteOKResponse {
  legal: string;
  jobs?: RemoteOKJob[];
  [key: number]: RemoteOKJob;
}

export class RemoteOKScraper extends BaseScraper {
  private httpClient: AxiosInstance;

  constructor() {
    super(
      'remoteok-scraper',
      'RemoteOK Jobs Scraper',
      'twitter', // Using twitter as source since remoteok is not in the enum
      PlatformConfigs.twitter || {
        enabled: true,
        rateLimit: { requests: 10, period: 60000 }, // 10 requests per minute
        retry: { attempts: 3, delay: 1000, backoff: 'exponential' },
        userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)',
        timeout: 10000,
        concurrent: 1
      }
    );

    this.httpClient = axios.create({
      baseURL: 'https://remoteok.com/api',
      timeout: this._config.timeout,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
  }

  protected async performScrape(params: SearchParams): Promise<ScraperResult> {
    try {
      console.log('🔍 Starting RemoteOK job search...');
      console.log(`📝 Search parameters:`, {
        keywords: params.keywords,
        location: params.location,
        remote: params.remote,
        limit: params.limit
      });

      // Fetch jobs from RemoteOK API
      const response = await this.httpClient.get('');
      const data: RemoteOKResponse = response.data;

      console.log(`📡 RemoteOK API Response received`);

      // Convert response to array format
      let jobs: RemoteOKJob[] = [];
      if (Array.isArray(data)) {
        // Sometimes the API returns an array directly
        jobs = data.slice(1); // First item is usually legal text
      } else if (data && typeof data === 'object') {
        // Sometimes it's an object with numeric keys
        jobs = Object.keys(data)
          .filter(key => !isNaN(Number(key)) && key !== '0')
          .map(key => data[key as any])
          .filter(job => job && typeof job === 'object');
      }

      console.log(`📊 Found ${jobs.length} total jobs from RemoteOK`);

      // Filter and process jobs
      const filteredJobs = this.filterJobs(jobs, params);
      const processedJobs = filteredJobs.map(job => this.processJob(job));

      console.log(`✅ Processed ${processedJobs.length} jobs matching criteria`);

      return {
        jobs: processedJobs,
        totalFound: processedJobs.length,
        hasMore: false,
        metadata: {
          searchParams: params,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: this.platform,
          took: 0, // Will be set by parent class
          errors: []
        }
      };

    } catch (error) {
      console.error('❌ RemoteOK scraping failed:', error);
      throw error;
    }
  }

  protected async performValidation(): Promise<void> {
    try {
      const response = await this.httpClient.get('');
      if (!response.data) {
        throw new Error('RemoteOK API returned no data');
      }
    } catch (error) {
      throw new Error(`RemoteOK API validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private filterJobs(jobs: RemoteOKJob[], params: SearchParams): RemoteOKJob[] {
    let filtered = jobs.filter(job => {
      // Basic validation
      if (!job || !job.position || !job.company) return false;
      
      // Filter by keywords
      if (params.keywords && params.keywords.length > 0) {
        const searchText = `${job.position} ${job.description} ${job.tags?.join(' ') || ''}`.toLowerCase();
        const hasKeyword = params.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      // Filter by location if specified and not remote-only
      if (params.location && !params.remote) {
        const jobLocation = job.location?.toLowerCase() || '';
        const searchLocation = params.location.toLowerCase();
        if (!jobLocation.includes(searchLocation)) return false;
      }

      // Filter by remote preference
      if (params.remote) {
        const jobText = `${job.position} ${job.description} ${job.location}`.toLowerCase();
        if (!this.isRemoteJob(jobText)) return false;
      }

      // Filter by job types
      if (params.jobType && params.jobType.length > 0) {
        const jobText = `${job.position} ${job.description}`.toLowerCase();
        const hasJobType = params.jobType.some((type: string) => {
          switch (type) {
            case 'full-time':
              return /\b(full.?time|fulltime)\b/i.test(jobText);
            case 'part-time':
              return /\b(part.?time|parttime)\b/i.test(jobText);
            case 'contract':
              return /\b(contract|contractor|freelance)\b/i.test(jobText);
            case 'internship':
              return /\b(intern|internship)\b/i.test(jobText);
            default:
              return true;
          }
        });
        if (!hasJobType) return false;
      }

      // Filter by date posted
      if (params.datePosted && params.datePosted !== 'any') {
        const jobDate = new Date(job.epoch * 1000);
        const now = new Date();
        let cutoffDate: Date;

        switch (params.datePosted) {
          case 'today':
            cutoffDate = subDays(now, 1);
            break;
          case 'week':
            cutoffDate = subDays(now, 7);
            break;
          case 'month':
            cutoffDate = subDays(now, 30);
            break;
          default:
            return true;
        }

        if (jobDate < cutoffDate) return false;
      }

      return true;
    });

    // Apply limit
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  private processJob(job: RemoteOKJob): Job {
    const processedJob: Job = {
      id: job.id || job.slug,
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      description: this.cleanDescription(job.description),
      requirements: job.tags?.map(tag => tag.replace(/[_-]/g, ' ')) || [],
      salary: this.formatSalary(job.salary_min, job.salary_max),
      jobType: this.extractJobType(`${job.position} ${job.description}`),
      remote: this.isRemoteJob(`${job.position} ${job.description} ${job.location}`),
      url: job.url,
      source: 'twitter', // Using twitter as source since remoteok is not in the enum
      contact: {
        email: this.extractEmail(job.description)
      },
      postedAt: new Date(job.epoch * 1000),
      scraped: {
        scrapedAt: new Date(),
        scraperId: this.id,
        rawData: job
      }
    };

    return processedJob;
  }

  private cleanDescription(description: string): string {
    if (!description) return '';
    
    // Remove HTML tags
    let cleaned = description.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  private formatSalary(min?: number, max?: number): string | undefined {
    if (!min && !max) return undefined;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return undefined;
  }

  private extractJobType(text: string): Job['jobType'] {
    if (/\b(full.?time|fulltime)\b/i.test(text)) return 'full-time';
    if (/\b(part.?time|parttime)\b/i.test(text)) return 'part-time';
    if (/\b(contract|contractor|freelance)\b/i.test(text)) return 'contract';
    if (/\b(intern|internship)\b/i.test(text)) return 'internship';
    return undefined;
  }

  private extractEmail(text: string): string | undefined {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailPattern);
    return match ? match[0] : undefined;
  }
} 