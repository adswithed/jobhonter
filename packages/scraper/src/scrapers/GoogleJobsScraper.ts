import axios, { AxiosInstance } from 'axios';
import { format, subDays } from 'date-fns';
import puppeteer, { Browser, Page } from 'puppeteer';
import {
  SearchParams,
  ScraperResult,
  Job,
  PlatformConfigs,
  JOB_KEYWORDS
} from '../types';
import { BaseScraper } from '../base/BaseScraper';

export class GoogleJobsScraper extends BaseScraper {
  private httpClient: AxiosInstance;
  private browser: Browser | null = null;

  constructor() {
    super(
      'google-jobs-scraper',
      'Google Jobs Scraper',
      'google',
      PlatformConfigs.google
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
      this.logger.info('Starting Google Jobs scraping with Puppeteer', { params });

      // Initialize Puppeteer browser
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
      }

      // Build search queries
      const queries = this.buildSearchQueries(params);
      
      for (const query of queries) {
        try {
          const searchResults = await this.searchGoogleJobs(query, params);
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

      this.logger.info('Google Jobs scraping completed', {
        totalQueries: queries.length,
        jobsFound: uniqueJobs.length,
        errors: errors.length
      });

      return {
        jobs: uniqueJobs,
        totalFound,
        hasMore: false,
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
      this.logger.error('Google Jobs scraping failed', { error, params });
      throw error;
    }
  }

  private buildSearchQueries(params: SearchParams): string[] {
    const queries: string[] = [];
    const keywords = params.keywords.length > 0 ? params.keywords : JOB_KEYWORDS.slice(0, 3);
    
    // Create Google Jobs queries
    for (const keyword of keywords) {
      let query = keyword;
      
      // Add location if provided
      if (params.location) {
        query += ` in ${params.location}`;
      }
      
      // Add remote if requested
      if (params.remote) {
        query += ' remote';
      }
      
      queries.push(query);
    }

    return queries.slice(0, 3); // Limit to 3 queries to avoid rate limits
  }

  private async searchGoogleJobs(query: string, params: SearchParams): Promise<{ jobs: Job[]; totalFound: number }> {
    const jobs: Job[] = [];
    let page: Page | null = null;
    
    try {
      console.log(`🔍 Searching Google Jobs with query: "${query}"`);
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // Navigate to Google Jobs search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' jobs')}&udm=8`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for job results to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Debug: Check page info
      const pageTitle = await page.title();
      console.log(`📄 Page title: ${pageTitle}`);

      // Debug: Take a screenshot and check content
      await page.screenshot({ path: '/tmp/google-jobs-debug.png', fullPage: false });
      const pageUrl = page.url();
      console.log(`📍 Final URL: ${pageUrl}`);
      
      // Check if Google is showing different content
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log(`📄 Page content length: ${bodyText.length}`);
      console.log(`📄 Content preview: ${bodyText.substring(0, 300)}...`);

      // Check for specific Google elements
      const hasJobsSection = await page.evaluate(() => {
        return Boolean(
          document.querySelector('[role="main"]') || 
          document.querySelector('#search') ||
          document.querySelector('.g') ||
          document.querySelector('[data-ved]')
        );
      });
      console.log(`🔍 Has search results section: ${hasJobsSection}`);

      // Extract job listings
      const jobListings = await page.evaluate(() => {
        // First, let's find all elements with substantial content
        const allElements = document.querySelectorAll('*');
        const elementsWithText = Array.from(allElements).filter(el => {
          const text = el.textContent || '';
          return text.length > 50 && text.length < 2000; // Reasonable job post length
        });

        console.log(`Found ${elementsWithText.length} elements with substantial text`);

        // Look for elements that mention job-related keywords
        const jobKeywords = ['developer', 'engineer', 'programmer', 'job', 'position', 'role', 'hiring', 'career'];
        const potentialJobs = elementsWithText.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return jobKeywords.some(keyword => text.includes(keyword));
        });

        console.log(`Found ${potentialJobs.length} elements with job keywords`);

        // Process the first few potential job elements
        const results = potentialJobs.slice(0, 10).map((element, index) => {
          try {
            const text = element.textContent || '';
            
            // Look for title patterns in the text
            const titleMatches = text.match(/(software\s+engineer|developer|programmer|frontend|backend|full\s*stack|data\s+scientist|product\s+manager)[^.]*?(?:at|@|\s-\s)/i);
            const title = titleMatches ? titleMatches[0].replace(/\s*(at|@|\s-\s).*$/i, '').trim() : '';

            // Look for company patterns
            const companyMatches = text.match(/(?:at|@)\s+([A-Za-z][A-Za-z0-9\s&.,'-]+?)(?:\s+in|\s+\||$)/i);
            const company = companyMatches ? companyMatches[1].trim() : '';

            // Look for location patterns
            const locationMatches = text.match(/(?:in|located\s+in)\s+([A-Za-z\s,]+?)(?:\s|$)/i) || 
                                   text.match(/([A-Za-z\s]+,\s*[A-Z]{2})/i) ||
                                   text.match(/(San Francisco|New York|Los Angeles|Seattle|Austin|Boston|Remote)/i);
            const location = locationMatches ? locationMatches[1] || locationMatches[0] : '';

            // Look for salary
            const salaryMatches = text.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*per\s*\w+)?|\$\d+K?/i);
            const salary = salaryMatches ? salaryMatches[0] : '';

            // Find links within this element
            const linkEl = element.querySelector('a[href]');
            let link = '';
            if (linkEl) {
              link = linkEl.getAttribute('href') || '';
              if (link.startsWith('/')) {
                link = 'https://www.google.com' + link;
              }
            }

            // Only return if we found at least a title or company
            if (title || company || text.includes('developer')) {
              console.log(`Potential job ${index}: "${title}" at "${company}" in "${location}"`);
              return {
                title: title || 'Developer Position',
                company: company || 'Company Name',
                location: location || 'Location not specified',
                description: text.substring(0, 500),
                link: link,
                salary: salary,
                index: index
              };
            }

            return null;
          } catch (error) {
            console.error(`Error parsing element ${index}:`, error);
            return null;
          }
        }).filter(job => job !== null);

        console.log(`Extracted ${results.length} job listings`);
        return results;
      });

      // Process each job listing
      for (const jobData of jobListings) {
        try {
          const job = this.createJobFromListing(jobData, query);
          if (job) {
            jobs.push(job);
            console.log(`✅ Created job: ${job.title} at ${job.company}`);
          }
        } catch (error) {
          console.error('Error processing job listing:', error);
        }
      }

      console.log(`🎯 Final result: ${jobs.length} jobs found from ${jobListings.length} listings`);
      return { jobs, totalFound: jobs.length };

    } catch (error) {
      console.error('❌ Google Jobs search failed:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private createJobFromListing(jobData: any, query: string): Job | null {
    if (!jobData.title || !jobData.company) {
      return null;
    }

    // Create a Google Jobs URL if no direct link
    let jobUrl = jobData.link;
    if (!jobUrl || !jobUrl.startsWith('http')) {
      jobUrl = `https://www.google.com/search?q=${encodeURIComponent(jobData.title + ' ' + jobData.company)}&ibp=htl;jobs`;
    }

    const job: Job = {
      id: this.generateJobId({
        title: jobData.title,
        company: jobData.company,
        url: jobUrl
      }),
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      requirements: this.extractRequirements(jobData.description),
      salary: jobData.salary,
      jobType: this.extractJobType(jobData.description),
      remote: this.isRemoteJob(jobData.description, jobData.location),
      url: jobUrl,
      source: 'google',
      contact: {
        email: this.extractEmail(jobData.description),
        website: this.extractWebsite(jobData.description)
      },
      postedAt: new Date(), // Google doesn't always provide posting dates
      scraped: {
        scrapedAt: new Date(),
        scraperId: this.id,
        rawData: {
          originalListing: jobData,
          query
        }
      }
    };

    return job;
  }

  private extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const skillPatterns = [
      /(?:skills?|experience|requirements?):\s*([\w\s,.-]+?)(?:\n|$)/i,
      /(?:must have|should have|looking for):\s*([\w\s,.-]+?)(?:\n|$)/i
    ];

    for (const pattern of skillPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        requirements.push(...match[1].split(',').map(s => s.trim()).filter(Boolean));
        break;
      }
    }

    return requirements;
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

  private extractWebsite(text: string): string | undefined {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlPattern);
    return matches ? matches[0] : undefined;
  }

  private removeDuplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Clean up browser when done
  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async performValidation(): Promise<void> {
    try {
      // Test Google accessibility
      const response = await this.httpClient.get('https://www.google.com', { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error('Cannot reach Google');
      }
      this.logger.info('Google Jobs scraper validation passed');
    } catch (error) {
      throw new Error('Google Jobs scraper validation failed');
    }
  }
}

export default GoogleJobsScraper; 