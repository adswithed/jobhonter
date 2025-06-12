import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { format, subDays } from 'date-fns';
import { chromium, Browser, Page } from 'playwright';
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
  private browser: Browser | null = null;

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
      this.logger.info('Starting direct Twitter job scraping with Puppeteer', { params });

      // Initialize Puppeteer browser
      if (!this.browser) {
        this.browser = await chromium.launch({
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
          const searchResults = await this.searchTwitterDirect(query, params);
          jobs.push(...searchResults.jobs);
          totalFound += searchResults.totalFound;
          
          // Add delay between queries to be respectful
          await this.createDelay(3000);
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
      // Basic job search (with -retweet to exclude retweets as you asked)
      queries.push(`"${keyword}" (hiring OR job OR opportunity)${locationFilter}${dateFilter} -is:retweet`);
      
      // Remote-specific search if remote is requested
      if (params.remote) {
        queries.push(`"${keyword}" remote (hiring OR job)${dateFilter} -is:retweet`);
      }
    }

    // Add location-specific queries if location is provided
    if (params.location) {
      queries.push(`"hiring" "${params.location}" (developer OR engineer OR programmer)${dateFilter} -is:retweet`);
    }

    return queries.slice(0, 5); // Limit to 5 queries to avoid rate limits
  }

  private async searchTwitterDirect(query: string, params: SearchParams): Promise<{ jobs: Job[]; totalFound: number }> {
    const jobs: Job[] = [];
    let page: Page | null = null;
    
    try {
      console.log(`🔍 Searching Twitter directly with query: "${query}"`);
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      page = await this.browser.newPage();
      
      // Set user agent and viewport
      await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
      await page.setViewportSize({ width: 1366, height: 768 });

      // Navigate to Twitter search
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
      console.log(`🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for tweets to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Debug: Take a screenshot and save HTML to see what we're getting
      await page.screenshot({ path: '/tmp/twitter-debug.png', fullPage: true });
      const html = await page.content();
      console.log('📄 Page HTML length:', html.length);
      console.log('📄 Page title:', await page.title());
      
      // Check if we're being asked to log in
      const loginRequired = await page.$('input[name="text"]') || await page.$('input[autocomplete="username"]');
      if (loginRequired) {
        console.log('🚫 Twitter is requiring login - this is why we get 0 tweets');
      }

      // Extract tweets
      const tweets = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        console.log(`Found ${tweetElements.length} tweet elements`);
        
        // Debug: Log the page content to see what we're getting
        if (tweetElements.length === 0) {
          console.log('No tweets found. Page title:', document.title);
          console.log('Page URL:', window.location.href);
          const body = document.body.innerText;
          console.log('Page content preview:', body.substring(0, 500));
        }
        
        return Array.from(tweetElements).map((tweet, index) => {
          try {
            // Extract tweet text
            const tweetTextElement = tweet.querySelector('[data-testid="tweetText"]');
            const tweetText = tweetTextElement ? tweetTextElement.textContent || '' : '';
            
            // Extract author info
            const userNameElement = tweet.querySelector('[data-testid="User-Name"]');
            const userName = userNameElement ? userNameElement.textContent || '' : '';
            
            // Extract tweet link
            const timeElement = tweet.querySelector('time');
            const tweetLink = timeElement ? timeElement.closest('a')?.href || '' : '';
            
            // Extract timestamp
            const timestamp = timeElement ? timeElement.getAttribute('datetime') || '' : '';

            console.log(`Tweet ${index}: ${tweetText.substring(0, 100)}...`);

            return {
              text: tweetText,
              author: userName,
              link: tweetLink,
              timestamp: timestamp,
              index: index
            };
          } catch (error) {
            console.error(`Error parsing tweet ${index}:`, error);
            return null;
          }
        }).filter(tweet => tweet !== null);
      });

      console.log(`📊 Extracted ${tweets.length} tweets from Twitter`);

      // Process each tweet for job content
      for (const tweet of tweets) {
        try {
          if (!tweet || !tweet.text || !tweet.author || !tweet.link) {
            console.log('Skipping tweet: missing required fields');
            continue;
          }

          console.log(`🔍 Analyzing tweet: "${tweet.text.substring(0, 100)}..."`);
          
          const job = this.parseTweetForJob(tweet, query);
          if (job) {
            jobs.push(job);
            console.log(`✅ Found job: ${job.title} at ${job.company}`);
          } else {
            console.log(`❌ Tweet not job-related or missing info`);
          }
        } catch (error) {
          console.error('Error processing tweet:', error);
        }
      }

      console.log(`🎯 Final result: ${jobs.length} jobs found from ${tweets.length} tweets`);
      return { jobs, totalFound: jobs.length };

    } catch (error) {
      console.error('❌ Direct Twitter search failed:', error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private parseTweetForJob(tweet: any, query: string): Job | null {
    const tweetText = tweet.text;
    const username = tweet.author.split('\n')[0]; // Get username (first line)
    const fullName = tweet.author.split('\n')[1] || username; // Get display name (second line)
    const tweetLink = tweet.link;
    
    if (!tweetText || !username || !tweetLink) {
      return null;
    }

    // Check if this looks like a job posting
    if (!this.isJobRelated(tweetText)) {
      return null;
    }

    // Extract job information
    const jobInfo = this.extractJobInfo(tweetText);
    
    // Set defaults if extraction failed
    if (!jobInfo.title) {
      jobInfo.title = this.extractTitleFromKeywords(tweetText, query);
    }
    
    if (!jobInfo.company) {
      jobInfo.company = fullName || username;
    }

    // Ensure we have a title (required field)
    const finalTitle = jobInfo.title || 'Software Developer';
    const finalCompany = jobInfo.company || fullName || username;

    // Parse posting date
    const postedAt = tweet.timestamp ? new Date(tweet.timestamp) : new Date();

    const job: Job = {
      id: this.generateJobId({
        title: finalTitle,
        company: finalCompany,
        url: tweetLink
      }),
      title: finalTitle,
      company: finalCompany,
      location: jobInfo.location,
      description: tweetText,
      requirements: jobInfo.requirements,
      salary: jobInfo.salary,
      jobType: jobInfo.jobType,
      remote: jobInfo.remote || this.isRemoteJob(tweetText, jobInfo.location || ''),
      url: tweetLink,
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
          query,
          originalTweet: tweet
        }
      }
    };

    return job;
  }

  private extractTitleFromKeywords(text: string, query: string): string {
    // Extract job title from search keywords
    const queryWords = query.toLowerCase().split(' ');
    const jobTitleWords = queryWords.filter(word => 
      ['developer', 'engineer', 'programmer', 'designer', 'manager', 'analyst', 'specialist'].includes(word)
    );
    
    if (jobTitleWords.length > 0) {
      return jobTitleWords.join(' ').replace(/"/g, '');
    }
    
    // Fallback to generic title
    return 'Software Developer';
  }

  // Clean up browser when done
  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private isJobRelated(text: string): boolean {
    const jobKeywords = [
      'hiring', 'job', 'opportunity', 'position', 'role', 'career',
      'looking for', 'seeking', 'join our team', 'we are hiring',
      'software engineer', 'developer', 'programmer', 'frontend', 'backend'
    ];

    const textLower = text.toLowerCase();
    const foundKeywords = jobKeywords.filter(keyword => textLower.includes(keyword));
    
    console.log(`Job detection for: "${text.substring(0, 100)}..."`);
    console.log(`Found keywords: [${foundKeywords.join(', ')}]`);
    
    const isJobRelated = foundKeywords.length > 0;
    console.log(`Is job related: ${isJobRelated}`);
    
    return isJobRelated;
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