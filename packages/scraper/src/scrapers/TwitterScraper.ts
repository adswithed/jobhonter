import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { format, subDays } from 'date-fns';
import {
  SearchParams,
  ScraperResult,
  Job,
  PlatformConfigs,
  JOB_KEYWORDS
} from '../types';
import { BaseScraper } from '../base/BaseScraper';

export class TwitterScraper extends BaseScraper {
  private httpClient: AxiosInstance;

  constructor() {
    super(
      'twitter-scraper',
      'Twitter/X Job Scraper',
      'twitter',
      PlatformConfigs.twitter
    );

    this.httpClient = axios.create({
      timeout: this._config.timeout,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...this._config.headers
      }
    });
  }

  protected async performScrape(params: SearchParams): Promise<ScraperResult> {
    const jobs: Job[] = [];
    const errors: string[] = [];
    let totalFound = 0;

    try {
      this.logger.info('Starting Twitter job scraping', { params });

      // Build search queries
      const queries = this.buildSearchQueries(params);
      
      for (const query of queries) {
        try {
          const searchResults = await this.searchTwitter(query, params);
          jobs.push(...searchResults.jobs);
          totalFound += searchResults.totalFound;
          
          // Add delay between queries to be respectful
          await this.createDelay(2000);
        } catch (error) {
          const errorMsg = `Failed to search query "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          this.logger.warn(errorMsg);
        }
      }

      // Remove duplicates based on URL
      const uniqueJobs = this.removeDuplicateJobs(jobs);

      this.logger.info('Twitter scraping completed', {
        totalQueries: queries.length,
        jobsFound: uniqueJobs.length,
        errors: errors.length
      });

      return {
        jobs: uniqueJobs,
        totalFound,
        hasMore: false, // Twitter search doesn't provide reliable pagination info
        metadata: {
          searchParams: params,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: this.platform,
          took: 0, // Will be set by BaseScraper
          errors
        }
      };

    } catch (error) {
      this.logger.error('Twitter scraping failed', { error, params });
      throw error;
    }
  }

  private buildSearchQueries(params: SearchParams): string[] {
    const queries: string[] = [];
    const keywords = params.keywords.length > 0 ? params.keywords : JOB_KEYWORDS.slice(0, 5);
    
    // Build location filter
    const locationFilter = params.location ? ` "${params.location}"` : '';
    
    // Build date filter
    let dateFilter = '';
    if (params.datePosted) {
      const days = this.getDateFilterDays(params.datePosted);
      if (days > 0) {
        const since = format(subDays(new Date(), days), 'yyyy-MM-dd');
        dateFilter = ` since:${since}`;
      }
    }

    // Create queries for each keyword combination
    for (const keyword of keywords) {
      // Basic job search
      queries.push(`"${keyword}" (hiring OR job OR opportunity)${locationFilter}${dateFilter} -retweet`);
      
      // Remote-specific search if remote is requested
      if (params.remote) {
        queries.push(`"${keyword}" remote (hiring OR job)${dateFilter} -retweet`);
      }
    }

    // Add location-specific queries if location is provided
    if (params.location) {
      queries.push(`"hiring" "${params.location}" (developer OR engineer OR programmer)${dateFilter} -retweet`);
    }

    return queries.slice(0, 10); // Limit to 10 queries to avoid rate limits
  }

  private async searchTwitter(query: string, params: SearchParams): Promise<{ jobs: Job[]; totalFound: number }> {
    const jobs: Job[] = [];
    
    try {
      // Use Nitter (open-source Twitter frontend) for scraping
      // This is more reliable and respects rate limits better
      const nitterInstances = [
        'https://nitter.net',
        'https://nitter.it',
        'https://nitter.fdn.fr'
      ];

      let response;
      let lastError;

      // Try different Nitter instances
      for (const instance of nitterInstances) {
        try {
          const searchUrl = `${instance}/search?q=${encodeURIComponent(query)}&f=tweets`;
          response = await this.httpClient.get(searchUrl);
          break;
        } catch (error) {
          lastError = error;
          this.logger.warn(`Nitter instance ${instance} failed, trying next...`);
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('All Nitter instances failed');
      }

      const $ = cheerio.load(response.data);
      
      // Parse tweets from Nitter HTML
      $('.timeline-item').each((_, element) => {
        try {
          const job = this.parseTweetElement($, element, query);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          this.logger.debug('Failed to parse tweet element', { error });
        }
      });

      return { jobs, totalFound: jobs.length };

    } catch (error) {
      this.logger.error('Twitter search failed', { query, error });
      throw error;
    }
  }

  private parseTweetElement($: cheerio.CheerioAPI, element: any, query: string): Job | null {
    const $tweet = $(element);
    
    // Extract tweet content
    const tweetText = $tweet.find('.tweet-content').text().trim();
    const username = $tweet.find('.username').text().replace('@', '');
    const fullName = $tweet.find('.fullname').text().trim();
    const tweetLink = $tweet.find('.tweet-link').attr('href');
    
    if (!tweetText || !username || !tweetLink) {
      return null;
    }

    // Check if this looks like a job posting
    if (!this.isJobRelated(tweetText)) {
      return null;
    }

    // Extract job information
    const jobInfo = this.extractJobInfo(tweetText);
    
    if (!jobInfo.title || !jobInfo.company) {
      return null;
    }

    // Construct full URL
    const fullUrl = tweetLink.startsWith('http') ? tweetLink : `https://twitter.com${tweetLink}`;

    // Extract posting date
    const dateStr = $tweet.find('.tweet-date').attr('title');
    const postedAt = dateStr ? new Date(dateStr) : new Date();

    const job: Job = {
      id: this.generateJobId({
        title: jobInfo.title,
        company: jobInfo.company,
        url: fullUrl
      }),
      title: jobInfo.title,
      company: jobInfo.company || fullName || username,
      location: jobInfo.location,
      description: tweetText,
      requirements: jobInfo.requirements,
      salary: jobInfo.salary,
      jobType: jobInfo.jobType,
      remote: jobInfo.remote || this.isRemoteJob(tweetText, jobInfo.location || ''),
      url: fullUrl,
      source: 'twitter',
      contact: {
        name: fullName || username,
        email: this.extractEmail(tweetText),
        website: this.extractWebsite(tweetText)
      },
      postedAt,
      scraped: {
        scrapedAt: new Date(),
        scraperId: this.id,
        rawData: {
          tweetText,
          username,
          fullName,
          query
        }
      }
    };

    return job;
  }

  private isJobRelated(text: string): boolean {
    const jobKeywords = [
      'hiring', 'job', 'opportunity', 'position', 'role', 'career',
      'looking for', 'seeking', 'join our team', 'we are hiring',
      'software engineer', 'developer', 'programmer', 'frontend', 'backend'
    ];

    const textLower = text.toLowerCase();
    return jobKeywords.some(keyword => textLower.includes(keyword));
  }

  private extractJobInfo(text: string): {
    title?: string;
    company?: string;
    location?: string;
    requirements: string[];
    salary?: string;
    jobType?: Job['jobType'];
    remote: boolean;
  } {
    const result: {
      title?: string;
      company?: string;
      location?: string;
      requirements: string[];
      salary?: string;
      jobType?: Job['jobType'];
      remote: boolean;
    } = {
      requirements: [],
      remote: false
    };

    // Extract job title patterns
    const titlePatterns = [
      /(?:hiring|seeking|looking for)\s+(?:a|an)?\s*([\w\s]+?)(?:\s+at|\s+in|\s+for|\s*[,.])/i,
      /(?:position|role|job):\s*([\w\s]+?)(?:\s+at|\s+in|\s+for|\s*[,.])/i,
      /(?:we need|we want|join us as)\s+(?:a|an)?\s*([\w\s]+?)(?:\s+at|\s+in|\s+for|\s*[,.])/i
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.title = match[1].trim();
        break;
      }
    }

    // Extract company name patterns
    const companyPatterns = [
      /at\s+([\w\s&.,-]+?)(?:\s+in|\s+for|\s*[,.]|$)/i,
      /@(\w+)/,
      /(?:join|work with)\s+([\w\s&.,-]+?)(?:\s+as|\s+in|\s*[,.])/i
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.company = match[1].trim();
        break;
      }
    }

    // Extract location
    const locationPatterns = [
      /(?:in|at|located in)\s+([\w\s,.-]+?)(?:\s+for|\s*[,.]|$)/i,
      /(\w+,\s*\w+)(?:\s|$)/  // City, State pattern
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && !this.isJobKeyword(match[1])) {
        result.location = match[1].trim();
        break;
      }
    }

    // Extract salary
    result.salary = this.extractSalary(text);

    // Extract job type
    if (/\b(full.?time|fulltime)\b/i.test(text)) result.jobType = 'full-time';
    else if (/\b(part.?time|parttime)\b/i.test(text)) result.jobType = 'part-time';
    else if (/\b(contract|contractor|freelance)\b/i.test(text)) result.jobType = 'contract';
    else if (/\b(intern|internship)\b/i.test(text)) result.jobType = 'internship';

    // Check for remote
    result.remote = /\b(remote|work from home|wfh|distributed)\b/i.test(text);

    // Extract requirements/skills
    const skillPatterns = [
      /(?:skills?|experience|requirements?):\s*([\w\s,.-]+?)(?:\n|$)/i,
      /(?:must have|should have|looking for):\s*([\w\s,.-]+?)(?:\n|$)/i
    ];

    for (const pattern of skillPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.requirements = match[1].split(',').map(s => s.trim()).filter(Boolean);
        break;
      }
    }

    return result;
  }

  private isJobKeyword(text: string): boolean {
    const keywords = ['hiring', 'job', 'position', 'role', 'opportunity', 'career'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private extractEmail(text: string): string | undefined {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailPattern);
    return match ? match[0] : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlPattern);
    return matches ? matches[0] : undefined;
  }

  private removeDuplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}-${job.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getDateFilterDays(datePosted: string): number {
    switch (datePosted) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 0;
    }
  }

  protected async performValidation(): Promise<void> {
    // Check if we can reach Nitter instances
    const nitterInstances = [
      'https://nitter.net',
      'https://nitter.it'
    ];

    let working = false;
    for (const instance of nitterInstances) {
      try {
        await this.httpClient.get(instance, { timeout: 5000 });
        working = true;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!working) {
      throw new Error('No working Nitter instances available');
    }

    this.logger.info('Twitter scraper validation passed');
  }
}

export default TwitterScraper; 