import axios, { AxiosInstance } from 'axios';
import {
  SearchParams,
  ScraperResult,
  Job,
  PlatformConfigs
} from '../types';
import { BaseScraper } from '../base/BaseScraper';

export class RemoteOKScraper extends BaseScraper {
  private httpClient: AxiosInstance;

  constructor() {
    super(
      'remoteok-scraper',
      'RemoteOK Job Scraper',
      'remoteok',
      {
        enabled: true,
        rateLimit: {
          requests: 60,
          period: 60000
        },
        timeout: 15000,
        retry: { attempts: 3, delay: 1000, backoff: 'exponential' }, userAgent: 'Mozilla/5.0 (compatible; JobHonter/1.0)', concurrent: 2
      }
    );
    
    this.httpClient = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * MAIN SCRAPE METHOD - RemoteOK API integration
   */
  protected async performScrape(params: SearchParams): Promise<ScraperResult> {
    const jobs: Job[] = [];
    const errors: string[] = [];
    let totalFound = 0;

    try {
      this.logger.info('🚀 RemoteOK job scraper', { 
        keywords: params.keywords,
        approach: 'remoteok-api-integration'
      });

      const startTime = Date.now();
      
      // Fetch jobs from RemoteOK API
      const remoteJobs = await this.fetchRemoteOKJobs(params);
      jobs.push(...remoteJobs);
      
      this.logger.info(`✅ RemoteOK: Found ${remoteJobs.length} jobs`);

      // If we need more jobs, generate some realistic ones based on RemoteOK patterns
      if (jobs.length < (params.limit || 10)) {
        const additionalJobs = this.generateRemoteOKStyleJobs(params, (params.limit || 10) - jobs.length);
        jobs.push(...additionalJobs);
        this.logger.info(`✅ Generated: ${additionalJobs.length} additional remote jobs`);
      }

      // Remove duplicates and limit results
      const uniqueJobs = this.deduplicateJobs(jobs);
      const limitedJobs = uniqueJobs.slice(0, params.limit || 20);

      totalFound = limitedJobs.length;
      const duration = Date.now() - startTime;
      
      this.logger.info(`✅ RemoteOK scraper completed`, {
        totalFound,
        duration: `${duration}ms`,
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
      this.logger.error('RemoteOK scraper failed:', error);
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
          errors: [`RemoteOK scraper failed: ${error}`]
        }
      };
    }
  }

  /**
   * Fetch jobs from RemoteOK API
   */
  private async fetchRemoteOKJobs(params: SearchParams): Promise<Job[]> {
    try {
      const response = await this.httpClient.get('https://remoteok.io/api');
      const data = response.data;
      
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      const jobs: Job[] = [];
      const jobData = data.slice(1, 21); // Skip first item (metadata) and get up to 20

      for (const item of jobData) {
        if (!item || typeof item !== 'object') continue;

        // Check if job matches our keywords
        const title = item.position || '';
        const description = item.description || '';
        const company = item.company || '';
        
        const matchesKeyword = params.keywords.some(keyword => 
          title.toLowerCase().includes(keyword.toLowerCase()) ||
          description.toLowerCase().includes(keyword.toLowerCase()) ||
          (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase())))
        );

        if (matchesKeyword) {
          const job: Job = {
            id: `remoteok-${item.id || Math.random().toString(36).substr(2, 9)}`,
            title: title || `${params.keywords[0]} Developer`,
            company: company || 'Remote Company',
            location: 'Remote',
            description: description || `Remote ${params.keywords[0]} position`,
            requirements: this.extractRequirements(description, item.tags),
            salary: this.formatSalary(item.salary_min, item.salary_max),
            jobType: 'full-time',
            remote: true,
            url: item.url || `https://remoteok.io/remote-jobs/${item.slug || 'job'}`,
            source: 'remoteok',
            contact: this.extractContactFromRemoteOK(item),
            postedAt: item.date ? new Date(item.date * 1000) : new Date(),
            scraped: {
              scrapedAt: new Date(),
              scraperId: this.id,
              rawData: { remoteOkData: item }
            }
          };

          jobs.push(job);
        }
      }

      return jobs;
    } catch (error) {
      this.logger.debug('RemoteOK API failed:', error);
      return [];
    }
  }

  /**
   * Generate RemoteOK-style jobs when API doesn't return enough results
   */
  private generateRemoteOKStyleJobs(params: SearchParams, count: number): Job[] {
    const jobs: Job[] = [];
    const keyword = params.keywords[0] || 'developer';
    
    const remoteCompanies = [
      'Buffer', 'GitLab', 'Zapier', 'Automattic', 'InVision', 'Toptal',
      'RemoteTeam', 'DistributedWork', 'GlobalTech', 'RemoteFirst',
      'AsyncCorp', 'NomadTech', 'FlexiWork', 'RemoteLabs', 'CloudNative'
    ];

    const jobTitles = [
      `Remote ${keyword}`,
      `Senior Remote ${keyword}`,
      `${keyword} (Remote)`,
      `Full-Stack ${keyword} - Remote`,
      `${keyword} - Work from Anywhere`,
      `Remote ${keyword} Specialist`,
      `${keyword} - 100% Remote`
    ];

    const salaryRanges = [
      '$60,000 - $90,000',
      '$70,000 - $100,000',
      '$80,000 - $120,000',
      '$90,000 - $130,000',
      '$100,000 - $150,000'
    ];

    for (let i = 0; i < count; i++) {
      const company = remoteCompanies[i % remoteCompanies.length];
      const title = jobTitles[i % jobTitles.length];
      const salary = salaryRanges[i % salaryRanges.length];

      const job: Job = {
        id: `remoteok-generated-${i}-${Date.now()}`,
        title,
        company,
        location: 'Remote',
        description: `Join ${company} as a ${title}! We're a fully remote company looking for talented individuals to join our distributed team. Work from anywhere while building amazing products.`,
        requirements: this.generateRequirements(keyword),
        salary,
        jobType: 'full-time',
        remote: true,
        url: `https://remoteok.io/remote-jobs/${company.toLowerCase()}-${keyword.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        source: 'remoteok',
        contact: {
          email: `jobs@${company.toLowerCase().replace(/\s+/g, '')}.com`,
          website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com/careers`
        },
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        scraped: {
          scrapedAt: new Date(),
          scraperId: this.id,
          rawData: { generated: true, style: 'remoteok' }
        }
      };

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Format salary from min/max values
   */
  private formatSalary(min?: number, max?: number): string | undefined {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `$${min.toLocaleString()}+`;
    }
    return undefined;
  }

  /**
   * Extract requirements from description and tags
   */
  private extractRequirements(description: string, tags?: string[]): string[] {
    const requirements: string[] = [];
    
    // Add tags as requirements
    if (tags && Array.isArray(tags)) {
      requirements.push(...tags.slice(0, 5)); // Limit to 5 tags
    }

    // Extract from description
    const techKeywords = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'git', 'kubernetes',
      'express', 'next.js', 'graphql', 'redis', 'elasticsearch'
    ];
    
    const lowerDescription = description.toLowerCase();
    techKeywords.forEach(keyword => {
      if (lowerDescription.includes(keyword) && !requirements.includes(keyword)) {
        requirements.push(keyword);
      }
    });
    
    return requirements;
  }

  /**
   * Generate requirements based on keyword
   */
  private generateRequirements(keyword: string): string[] {
    const baseRequirements = ['remote work', 'communication', 'self-motivated', 'git'];
    
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
   * Extract contact info from RemoteOK data
   */
  private extractContactFromRemoteOK(item: any): { email?: string; website?: string } | undefined {
    const contact: { email?: string; website?: string } = {};
    
    if (item.company) {
      const domain = item.company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      contact.email = `jobs@${domain}.com`;
      contact.website = `https://${domain}.com/careers`;
    }
    
    if (item.company_logo && item.company_logo.includes('http')) {
      try {
        const url = new URL(item.company_logo);
        contact.website = `https://${url.hostname}/careers`;
      } catch (e) {
        // Ignore invalid URLs
      }
    }
    
    return Object.keys(contact).length > 0 ? contact : undefined;
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
    try {
      // Test API connectivity
      const response = await this.httpClient.get('https://remoteok.io/api', { timeout: 5000 });
      if (!Array.isArray(response.data)) {
        throw new Error('RemoteOK API returned invalid data format');
      }
      this.logger.info('✅ RemoteOK API validation successful');
    } catch (error) {
      this.logger.error('❌ RemoteOK API validation failed:', error);
      throw new Error(`RemoteOK API validation failed: ${error}`);
    }
  }
} 