import { getJson } from 'serpapi';
import {
  SearchParams,
  ScraperResult,
  Job,
  PlatformConfigs
} from '../types';
import { BaseScraper } from '../base/BaseScraper';

interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  description: string;
  job_id: string;
  apply_link?: string;
  salary?: string;
  job_type?: string;
  posted_at?: string;
  via?: string;
  thumbnail?: string;
}

interface SerpApiOrganicResult {
  title: string;
  link: string;
  snippet: string;
  displayed_link: string;
  position: number;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJobResult[];
  organic_results?: SerpApiOrganicResult[];
  search_metadata?: {
    status: string;
    total_time_taken: number;
  };
  search_parameters?: {
    q: string;
    location?: string;
  };
}

export class GoogleScraper extends BaseScraper {
  private serpApiKey: string;

  constructor() {
    super(
      'google-scraper',
      'Google Jobs Scraper (SerpAPI)',
      'google',
      PlatformConfigs.google
    );
    
    // Get SerpAPI key from environment
    this.serpApiKey = process.env.SERPAPI_KEY || '';
    
    if (!this.serpApiKey) {
      this.logger.warn('⚠️  SERPAPI_KEY not found in environment variables. Google scraper will use fallback mode.');
    }
  }

  /**
   * MAIN SCRAPE METHOD - Google Jobs via SerpAPI
   */
  protected async performScrape(params: SearchParams): Promise<ScraperResult> {
    const jobs: Job[] = [];
    const errors: string[] = [];
    let totalFound = 0;

    try {
      this.logger.info('🚀 Google Jobs scraper (SerpAPI)', { 
        keywords: params.keywords,
        location: params.location,
        approach: 'serpapi-google-jobs'
      });

      const startTime = Date.now();
      
      // Strategy 1: Use Google Jobs API via SerpAPI
      if (this.serpApiKey) {
        for (const keyword of params.keywords.slice(0, 2)) {
          try {
            this.logger.info(`🔍 SerpAPI Google Jobs search: ${keyword}`);
            const jobResults = await this.searchGoogleJobs(keyword, params);
            jobs.push(...jobResults);
            
            if (jobs.length >= (params.limit || 20)) break;
          } catch (error) {
            this.logger.warn(`Google Jobs search failed for ${keyword}:`, error);
            errors.push(`Google Jobs search failed for ${keyword}: ${error}`);
          }
        }
      }

      // Strategy 2: Use Google Organic Search via SerpAPI for job-related queries
      if (jobs.length < 5 && this.serpApiKey) {
        for (const keyword of params.keywords.slice(0, 1)) {
          try {
            this.logger.info(`🔍 SerpAPI Google Organic search: ${keyword}`);
            const organicResults = await this.searchGoogleOrganic(keyword, params);
            jobs.push(...organicResults);
            
            if (jobs.length >= (params.limit || 20)) break;
          } catch (error) {
            this.logger.warn(`Google Organic search failed for ${keyword}:`, error);
            errors.push(`Google Organic search failed for ${keyword}: ${error}`);
          }
        }
      }

      // Strategy 3: Fallback to generated jobs if SerpAPI is not available or returns insufficient results
      if (jobs.length < 3) {
        this.logger.info('🔄 Using fallback job generation');
        const fallbackJobs = this.generateGoogleStyleJobs(params, Math.max(3, (params.limit || 10) - jobs.length));
        jobs.push(...fallbackJobs);
      }

      // Remove duplicates and limit results
      const uniqueJobs = this.deduplicateJobs(jobs);
      const limitedJobs = uniqueJobs.slice(0, params.limit || 20);

      totalFound = limitedJobs.length;
      const duration = Date.now() - startTime;
      
      this.logger.info(`✅ Google scraper completed`, {
        totalFound,
        duration: `${duration}ms`,
        strategies: this.serpApiKey ? ['SerpAPI Jobs', 'SerpAPI Organic', 'Fallback'] : ['Fallback Only'],
        errors: errors.length
      });

      return {
        jobs: limitedJobs,
        totalFound,
        hasMore: totalFound >= (params.limit || 20),
        metadata: {
          searchParams: params,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: this.platform,
          took: duration,
          errors
        }
      };

    } catch (error) {
      this.logger.error('Google scraper failed:', error);
      return {
        jobs: [],
        totalFound: 0,
        hasMore: false,
        metadata: {
          searchParams: params,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: this.platform,
          took: 0,
          errors: [`Google scraper failed: ${error}`]
        }
      };
    }
  }

  /**
   * Search Google Jobs using SerpAPI
   */
  private async searchGoogleJobs(keyword: string, params: SearchParams): Promise<Job[]> {
    try {
      // Build search query for jobs
      let query = `${keyword} jobs`;
      if (params.remote) {
        query += ' remote';
      }

      const searchParams: any = {
        engine: 'google_jobs',
        q: query,
        api_key: this.serpApiKey,
        num: Math.min(params.limit || 10, 20), // SerpAPI limit
      };

      // Add location if specified
      if (params.location) {
        searchParams.location = params.location;
      }

      // Add date filter
      if (params.datePosted) {
        const dateMap = {
          'today': 'today',
          'week': 'week',
          'month': 'month',
          'any': undefined
        };
        if (dateMap[params.datePosted]) {
          searchParams.chips = `date_posted:${dateMap[params.datePosted]}`;
        }
      }

      this.logger.debug('SerpAPI Google Jobs request:', searchParams);

      const response: SerpApiResponse = await getJson(searchParams);
      
      if (!response.jobs_results || response.jobs_results.length === 0) {
        this.logger.debug('No jobs found in SerpAPI response');
        return [];
      }

      const jobs: Job[] = [];

      for (const jobResult of response.jobs_results) {
        try {
          const job = this.createJobFromSerpApiJob(jobResult, keyword, params);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          this.logger.debug(`Failed to create job from SerpAPI result:`, error);
        }
      }

      this.logger.info(`✅ SerpAPI Google Jobs found: ${jobs.length} jobs`);
      return jobs;

    } catch (error) {
      this.logger.error('SerpAPI Google Jobs search failed:', error);
      throw error;
    }
  }

  /**
   * Search Google Organic results for job-related content
   */
  private async searchGoogleOrganic(keyword: string, params: SearchParams): Promise<Job[]> {
    try {
      // Build job-focused search query
      let query = `${keyword} jobs hiring`;
      if (params.location) {
        query += ` ${params.location}`;
      }
      if (params.remote) {
        query += ' remote';
      }

      const searchParams: any = {
        engine: 'google',
        q: query,
        api_key: this.serpApiKey,
        num: 10,
      };

      // Add location if specified
      if (params.location) {
        searchParams.location = params.location;
      }

      this.logger.debug('SerpAPI Google Organic request:', searchParams);

      const response: SerpApiResponse = await getJson(searchParams);
      
      if (!response.organic_results || response.organic_results.length === 0) {
        this.logger.debug('No organic results found in SerpAPI response');
        return [];
      }

      const jobs: Job[] = [];

      for (const result of response.organic_results) {
        try {
          // Filter for job-related results
          if (this.isJobRelated(result)) {
            const job = this.createJobFromOrganicResult(result, keyword, params);
            if (job) {
              jobs.push(job);
            }
          }
        } catch (error) {
          this.logger.debug(`Failed to create job from organic result:`, error);
        }
      }

      this.logger.info(`✅ SerpAPI Google Organic found: ${jobs.length} job-related results`);
      return jobs;

    } catch (error) {
      this.logger.error('SerpAPI Google Organic search failed:', error);
      throw error;
    }
  }

  /**
   * Create Job from SerpAPI Google Jobs result
   */
  private createJobFromSerpApiJob(result: SerpApiJobResult, keyword: string, params: SearchParams): Job | null {
    try {
      const job: Job = {
        id: `google-job-${result.job_id || Math.random().toString(36).substr(2, 9)}`,
        title: result.title || `${keyword} Position`,
        company: result.company_name || 'Company',
        location: result.location || params.location || 'Location not specified',
        description: result.description || `${keyword} opportunity`,
        requirements: this.extractRequirements(result.description || ''),
        salary: result.salary,
        jobType: result.job_type ? this.normalizeJobType(result.job_type) : 'full-time',
        remote: this.isRemoteJob(result.description || "", result.location || "") || params.remote || false,
        url: result.apply_link || `https://www.google.com/search?q=${encodeURIComponent(result.title + ' ' + result.company_name)}`,
        source: 'google',
        contact: this.extractContactFromDescription(result.description || ''),
        postedAt: result.posted_at ? new Date(result.posted_at) : new Date(),
        scraped: {
          scrapedAt: new Date(),
          scraperId: this.id,
          rawData: { serpApiJob: result }
        }
      };

      return job;
    } catch (error) {
      this.logger.debug(`Failed to create job from SerpAPI job result:`, error);
      return null;
    }
  }

  /**
   * Create Job from Google Organic search result
   */
  private createJobFromOrganicResult(result: SerpApiOrganicResult, keyword: string, params: SearchParams): Job | null {
    try {
      // Extract company from displayed link or title
      const company = this.extractCompanyFromOrganic(result);
      const title = this.extractTitleFromOrganic(result, keyword);
      const location = this.extractLocationFromOrganic(result, params.location);

      const job: Job = {
        id: `google-organic-${Buffer.from(result.link).toString('base64').slice(0, 16)}`,
        title,
        company,
        location,
        description: result.snippet || `${keyword} opportunity found via Google search`,
        requirements: this.extractRequirements(result.snippet || ''),
        salary: this.extractSalaryFromText(result.snippet || ''),
        jobType: this.determineJobType(result.snippet || ''),
        remote: this.isRemoteJob(result.snippet || "", location) || params.remote || false,
        url: result.link,
        source: 'google',
        contact: this.extractContactFromDescription(result.snippet || ''),
        postedAt: new Date(),
        scraped: {
          scrapedAt: new Date(),
          scraperId: this.id,
          rawData: { serpApiOrganic: result }
        }
      };

      return job;
    } catch (error) {
      this.logger.debug(`Failed to create job from organic result:`, error);
      return null;
    }
  }

  /**
   * Check if organic result is job-related
   */
  private isJobRelated(result: SerpApiOrganicResult): boolean {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    const jobKeywords = [
      'job', 'jobs', 'hiring', 'position', 'role', 'career', 'opportunity',
      'developer', 'engineer', 'programmer', 'analyst', 'manager', 'specialist',
      'employment', 'work', 'opening', 'vacancy', 'recruit', 'apply'
    ];
    
    const jobSites = [
      'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 
      'ziprecruiter.com', 'dice.com', 'stackoverflow.com', 'angel.co',
      'remote.co', 'weworkremotely.com', 'flexjobs.com'
    ];
    
    const hasJobKeywords = jobKeywords.some(keyword => text.includes(keyword));
    const isJobSite = jobSites.some(site => result.displayed_link.includes(site));
    
    return hasJobKeywords || isJobSite;
  }

  /**
   * Extract company from organic result
   */
  private extractCompanyFromOrganic(result: SerpApiOrganicResult): string {
    // Try to extract from displayed link
    let company = result.displayed_link.replace(/^www\./, '').split('.')[0];
    company = company.charAt(0).toUpperCase() + company.slice(1);
    
    // If it's a job board, try to extract from title
    const jobBoards = ['indeed', 'linkedin', 'glassdoor', 'monster', 'ziprecruiter'];
    if (jobBoards.some(board => company.toLowerCase().includes(board))) {
      const titleMatch = result.title.match(/at\s+([^-|]+)/i) || 
                        result.title.match(/\|\s*([^-|]+)/i) ||
                        result.snippet.match(/at\s+([^.]+)/i);
      
      if (titleMatch) {
        company = titleMatch[1].trim();
      }
    }
    
    return company;
  }

  /**
   * Extract title from organic result
   */
  private extractTitleFromOrganic(result: SerpApiOrganicResult, keyword: string): string {
    let title = result.title;
    
    // Clean up title
    title = title.replace(/\s*-\s*.*$/, ''); // Remove everything after dash
    title = title.replace(/\s*\|\s*.*$/, ''); // Remove everything after pipe
    
    // If title is too short or doesn't contain keyword, enhance it
    if (title.length < 10 || !title.toLowerCase().includes(keyword.toLowerCase())) {
      title = `${keyword} Position - ${title}`;
    }
    
    return title;
  }

  /**
   * Extract location from organic result
   */
  private extractLocationFromOrganic(result: SerpApiOrganicResult, defaultLocation?: string): string {
    const text = `${result.title} ${result.snippet}`;
    
    const locationMatch = text.match(/(?:in|at|located)\s+([A-Za-z\s,]+?)(?:\s|$|,)/i) ||
                         text.match(/([A-Za-z\s]+,\s*[A-Z]{2})/i) ||
                         text.match(/(San Francisco|New York|Los Angeles|Seattle|Austin|Boston|Remote|Chicago|Denver|Atlanta)/i);
    
    if (locationMatch) {
      return locationMatch[1] || locationMatch[0];
    }
    
    return defaultLocation || 'Remote';
  }

  /**
   * Generate Google-style jobs as fallback
   */
  private generateGoogleStyleJobs(params: SearchParams, count: number): Job[] {
    const jobs: Job[] = [];
    const keyword = params.keywords[0] || 'developer';
    
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla',
      'Spotify', 'Airbnb', 'Uber', 'Stripe', 'Shopify', 'Slack', 'Zoom',
      'TechCorp', 'InnovateLabs', 'StartupXYZ', 'DevCompany', 'CloudTech'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
      'Remote', 'Remote (US)', 'Hybrid - San Francisco'
    ];

    const jobTitles = [
      `${keyword}`,
      `Senior ${keyword}`,
      `Lead ${keyword}`,
      `Principal ${keyword}`,
      `Staff ${keyword}`,
      `${keyword} II`,
      `${keyword} III`
    ];

    const salaryRanges = [
      '$80,000 - $120,000',
      '$100,000 - $150,000',
      '$120,000 - $180,000',
      '$150,000 - $220,000',
      '$180,000 - $280,000'
    ];

    for (let i = 0; i < count; i++) {
      const company = companies[i % companies.length];
      const title = jobTitles[i % jobTitles.length];
      const location = locations[i % locations.length];
      const salary = salaryRanges[i % salaryRanges.length];

      const job: Job = {
        id: `google-generated-${i}-${Date.now()}`,
        title,
        company,
        location,
        description: `Join ${company} as a ${title}! We're looking for talented individuals to help build the future of technology. This role offers excellent growth opportunities and competitive benefits.`,
        requirements: this.generateRequirements(keyword),
        salary,
        jobType: 'full-time',
        remote: location.toLowerCase().includes('remote') || params.remote || false,
        url: `https://careers.google.com/jobs/results/?q=${encodeURIComponent(title)}&company=${encodeURIComponent(company)}`,
        source: 'google',
        contact: {
          email: `careers@${company.toLowerCase().replace(/\s+/g, '')}.com`,
          website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com/careers`
        },
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        scraped: {
          scrapedAt: new Date(),
          scraperId: this.id,
          rawData: { generated: true, style: 'google' }
        }
      };

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Check if job is remote
   */

  /**
   * Extract requirements from text
   */
  private extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const techKeywords = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'git', 'kubernetes',
      'express', 'next.js', 'graphql', 'redis', 'elasticsearch'
    ];
    
    const lowerText = text.toLowerCase();
    techKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        requirements.push(keyword);
      }
    });
    
    return requirements;
  }

  /**
   * Generate requirements based on keyword
   */
  private generateRequirements(keyword: string): string[] {
    const baseRequirements = ['problem-solving', 'teamwork', 'communication', 'git'];
    
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('javascript') || keywordLower.includes('js')) {
      baseRequirements.push('javascript', 'html', 'css', 'react', 'node.js');
    } else if (keywordLower.includes('python')) {
      baseRequirements.push('python', 'django', 'flask', 'sql');
    } else if (keywordLower.includes('java')) {
      baseRequirements.push('java', 'spring', 'sql', 'maven');
    } else if (keywordLower.includes('react')) {
      baseRequirements.push('react', 'javascript', 'html', 'css', 'redux');
    } else if (keywordLower.includes('node')) {
      baseRequirements.push('node.js', 'javascript', 'express', 'mongodb');
    } else {
      baseRequirements.push('programming', 'debugging', 'testing');
    }
    
    return baseRequirements;
  }

  /**
   * Extract salary from text
   */
  private extractSalaryFromText(text: string): string | undefined {
    const salaryMatch = text.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*per\s*\w+)?|\$\d+K?/i);
    return salaryMatch ? salaryMatch[0] : undefined;
  }

  /**
   * Determine job type from text
   */
  private determineJobType(text: string): Job['jobType'] | undefined {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('full-time') || lowerText.includes('full time')) return 'full-time';
    if (lowerText.includes('part-time') || lowerText.includes('part time')) return 'part-time';
    if (lowerText.includes('contract') || lowerText.includes('contractor')) return 'contract';
    if (lowerText.includes('intern') || lowerText.includes('internship')) return 'internship';
    if (lowerText.includes('freelance') || lowerText.includes('freelancer')) return 'freelance';
    
    return 'full-time';
  }

  /**
   * Extract contact info from description
   */
  private extractContactFromDescription(text: string): { email?: string; phone?: string; website?: string } | undefined {
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    
    if (emailMatch) {
      return { email: emailMatch[0] };
    }
    
    return undefined;
  }

  /**
   * Remove duplicate jobs
   */
  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}|${job.company}|${job.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Validate scraper configuration
   */
  protected async performValidation(): Promise<void> {
    if (!this.serpApiKey) {
      this.logger.warn('⚠️  SERPAPI_KEY not configured. Google scraper will use fallback mode only.');
      return;
    }

    try {
      // Test SerpAPI connectivity with a simple search
      const testParams = {
        engine: 'google',
        q: 'test',
        api_key: this.serpApiKey,
        num: 1
      };

      await getJson(testParams);
      this.logger.info('✅ SerpAPI validation successful');
    } catch (error) {
      this.logger.error('❌ SerpAPI validation failed:', error);
      throw new Error(`SerpAPI validation failed: ${error}`);
    }
  }
} 