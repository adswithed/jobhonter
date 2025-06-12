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

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  created_utc: number;
  ups: number;
  num_comments: number;
  domain: string;
  is_self: boolean;
  post_hint?: string;
  preview?: any;
}

interface RedditSearchResult {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
    after?: string;
    before?: string;
  };
}

interface EmailContact {
  email: string;
  context: string;
  source: 'post' | 'link';
  confidence: number;
}

export class RedditScraper extends BaseScraper {
  private httpClient: AxiosInstance;
  private browser: Browser | null = null;

  // COMPREHENSIVE JOB SUBREDDITS for maximum coverage
  private readonly TARGET_SUBREDDITS = [
    // CORE JOB SUBREDDITS (highest priority)
    'forhire', 'remotework', 'RemoteJobs', 'jobs', 'hiring', 'WorkOnline',
    'freelance', 'JobsNoExperience', 'GetEmployed', 'careeradvice',
    
    // PROGRAMMING & TECH (expanded coverage)
    'programming', 'webdev', 'Frontend', 'Backend', 'FullStack',
    'javascript', 'reactjs', 'node', 'Python', 'java', 'golang', 'rust',
    'swift', 'kotlin', 'PHP', 'ruby', 'csharp', 'cpp', 'typescript',
    'vuejs', 'angular', 'django', 'flask', 'laravel', 'spring', 'dotnet',
    
    // SPECIALIZED TECH AREAS
    'MachineLearning', 'datascience', 'analytics', 'artificial', 'MLJobs',
    'dataengineering', 'businessintelligence', 'bigdata', 'DeepLearning',
    'DevOps', 'sysadmin', 'kubernetes', 'docker', 'aws', 'azure',
    'googlecloud', 'terraform', 'ansible', 'jenkins', 'cloudcomputing',
    
    // SECURITY & MOBILE
    'netsec', 'cybersecurity', 'InfoSec', 'androiddev', 'iOSProgramming',
    'reactnative', 'flutter', 'xamarin', 'ionic',
    
    // DESIGN & UX
    'web_design', 'userexperience', 'UI_Design', 'graphic_design',
    'webdesign', 'UXDesign', 'DesignJobs',
    
    // BUSINESS & MARKETING
    'entrepreneur', 'startups', 'smallbusiness', 'business', 'marketing',
    'sales', 'consulting', 'freelanceWriters', 'content_marketing', 'SEO',
    'digitalmarketing', 'socialmedia', 'ecommerce',
    
    // FINANCE & BLOCKCHAIN
    'finance', 'FinancialCareers', 'fintech', 'accounting', 'investing',
    'ethereum', 'bitcoin', 'cryptocurrency', 'blockchain',
    
    // LOCATION-BASED (major cities)
    'NYCjobs', 'BayAreaJobs', 'LAjobs', 'SeattleJobs', 'ChicagoJobs',
    'PhillyJobs', 'austinjobs', 'DenverJobs', 'atlantajobs', 'toronto',
    'londonjobs', 'berlinjobs', 'sydneyjobs', 'melbourne', 'vancouverjobs',
    
    // ADDITIONAL NICHE SUBREDDITS
    'digitalnomad', 'findapath', 'careerguidance', 'cscareerquestions',
    'ITCareerQuestions', 'ExperiencedDevs', 'gamedev', 'Unity3D',
    'unrealengine', 'IndieDev', 'freelance_forhire', 'HireaWriter',
    'jobboardsearch', 'remotejobr', 'workonline', 'OnlineJobs'
  ];

  private readonly JOB_KEYWORDS = [
    'developer', 'engineer', 'programmer', 'designer', 'marketer',
    'manager', 'analyst', 'consultant', 'specialist', 'coordinator',
    'assistant', 'writer', 'content creator', 'social media',
    'wordpress', 'react', 'javascript', 'python', 'java', 'php',
    'remote work', 'freelance', 'part-time', 'full-time', 'contract'
  ];

  private readonly EMAIL_PATTERNS = [
    /[\w\.-]+@[\w\.-]+\.\w+/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  ];

  constructor() {
    super(
      'reddit-scraper',
      'Reddit Job Scraper',
      'reddit',
      PlatformConfigs.reddit
    );
    
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'JobHonter/1.0 (job search research; reddit-compliant)'
      }
    });
  }

  /**
   * MAIN SCRAPE METHOD - Comprehensive Reddit search like manual search
   */
  protected async performScrape(params: SearchParams): Promise<ScraperResult> {
    const jobs: Job[] = [];
    const errors: string[] = [];
    let totalFound = 0;

    try {
      this.logger.info('🚀 COMPREHENSIVE Reddit job search (ALL OF REDDIT)', { 
        keywords: params.keywords,
        searchMode: params.searchMode,
        approach: 'global-comprehensive-like-manual-search'
      });

      // Search ALL of Reddit for each keyword (like manual search)
      for (const keyword of params.keywords) {
        try {
          // Build effective search query
          const searchQuery = this.buildEffectiveQuery(keyword, params.searchMode);
          
          // COMPREHENSIVE SEARCH: Multiple strategies to maximize coverage  
          const globalPosts = await this.searchAllReddit(searchQuery, params);
          const subredditPosts = await this.searchTargetSubreddits(keyword, params);
          
          // Combine and deduplicate results
          const allPosts = [...globalPosts, ...subredditPosts];
          const uniquePosts = this.deduplicatePosts(allPosts);
          
          totalFound += uniquePosts.length;
          this.logger.debug(`📊 Found ${uniquePosts.length} posts for: ${keyword}`);
          
          // Parse posts into jobs with relevance filtering
          for (const post of uniquePosts) {
            if (this.isJobRelatedPost(post)) {
              const job = await this.parsePostForJob(post, params);
              if (job) {
                jobs.push(job);
                this.logger.debug(`✅ Job found: ${job.title}`);
              }
            }
          }
          
          // Rate limiting between keywords
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (keywordError) {
          const errorMsg = `❌ Failed to search "${keyword}": ${keywordError}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Remove duplicate jobs and sort by relevance
      const uniqueJobs = this.removeDuplicateJobs(jobs);
      uniqueJobs.sort((a, b) => {
        const scoreA = a.scraped?.rawData?.relevanceScore || 0;
        const scoreB = b.scraped?.rawData?.relevanceScore || 0;
        return scoreB - scoreA;
      });

      this.logger.info('🎯 COMPREHENSIVE Reddit search completed', {
        totalFound,
        uniqueJobs: uniqueJobs.length,
        errors: errors.length,
        approach: 'Complete Reddit coverage like manual search'
      });

      return {
        jobs: uniqueJobs.slice(0, params.limit || 50),
        totalFound,
        hasMore: uniqueJobs.length > (params.limit || 50),
        metadata: {
          searchParams: params,
          scrapedAt: new Date(),
          scraperId: this.id,
          platform: 'reddit',
          took: Date.now(),
          errors
        }
      };

    } catch (error) {
      this.logger.error('❌ COMPREHENSIVE Reddit search failed', { error });
      throw error;
    }
  }

  /**
   * Search ALL of Reddit globally (FIXED - now works like manual search)
   */
  private async searchAllReddit(query: string, params: SearchParams): Promise<RedditPost[]> {
    try {
      this.logger.debug('🌍 Searching ALL Reddit globally (FIXED)...', { query });
      
      const allPosts: RedditPost[] = [];
      const baseUrl = 'https://www.reddit.com/search.json';
      
      // FIXED: Use working search queries like the manual test showed
      const workingQueries = this.buildWorkingQueries(query, params.searchMode);
      
      // FIXED: Use proven search strategies that actually work
      const workingStrategies = [
        { sort: 'new', limit: 50 },       // Fresh posts (works!)
        { sort: 'relevance', limit: 40 }, // Most relevant (works!)
        { sort: 'hot', limit: 30 },       // Popular posts (works!)
        { sort: 'top', limit: 20, t: 'week' } // Top this week (works!)
      ];
      
      for (const workingQuery of workingQueries) {
        for (const strategy of workingStrategies) {
          try {
            const response = await this.httpClient.get(baseUrl, {
              params: {
                q: workingQuery,
                ...strategy,
                t: strategy.t || this.getTimeFilter(params.datePosted),
                type: 'link,sr',
                raw_json: 1  // FIXED: Added this for better results
              },
              timeout: 15000
            });

            if (response.data?.data?.children) {
              const posts = response.data.data.children
                .map((child: any) => child.data)
                .filter((post: any) => post && post.title && post.subreddit);
              
              allPosts.push(...posts);
              this.logger.debug(`✅ ${strategy.sort} (${workingQuery}): ${posts.length} posts`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
          } catch (error) {
            this.logger.warn(`Search strategy ${strategy.sort} failed for: ${workingQuery}`, error);
          }
        }
      }
      
      this.logger.info(`🏆 Global search found: ${allPosts.length} total posts`);
      return allPosts;
      
    } catch (error) {
      this.logger.error('❌ Global Reddit search failed:', error);
      return [];
    }
  }

  /**
   * FIXED: Build working search queries that actually return results
   */
  private buildWorkingQueries(keyword: string, searchMode?: string): string[] {
    const mode = searchMode || 'moderate';
    
    // FIXED: Use simple effective queries that work (proven by manual test)
    const baseKeyword = keyword.toLowerCase();
    
    switch (mode) {
      case 'strict':
        return [
          `"${keyword}" hiring`,
          `"${keyword}" job`,
          `"${keyword}" "looking for"`
        ];
      case 'moderate':
        return [
          `${baseKeyword} hiring`,
          `${baseKeyword} job`,
          `${baseKeyword} position`,
          `${baseKeyword} opportunity`,
          `${baseKeyword} remote`,
          `${baseKeyword} freelance`
        ];
      case 'loose':
        return [
          `${baseKeyword} hiring`,
          `${baseKeyword} job`,
          `${baseKeyword} work`,
          `${baseKeyword} career`,
          `${baseKeyword} position`,
          `${baseKeyword} opportunity`,
          `${baseKeyword} looking`,
          `${baseKeyword} need`,
          `${baseKeyword} developer`,
          `${baseKeyword} engineer`
        ];
      default:
        return [
          `${baseKeyword} hiring`,
          `${baseKeyword} job`,
          `${baseKeyword} position`
        ];
    }
  }

  /**
   * Search targeted subreddits for additional coverage
   */
  private async searchTargetSubreddits(keyword: string, params: SearchParams): Promise<RedditPost[]> {
    const allPosts: RedditPost[] = [];
    const subreddits = this.getRelevantSubreddits([keyword]);
    
    this.logger.debug(`🎯 Searching ${subreddits.length} targeted subreddits...`);
    
    for (const subreddit of subreddits.slice(0, 25)) { // Increased limit for more coverage
      try {
        const posts = await this.searchSubreddit(subreddit, keyword, params);
        if (posts.length > 0) {
          allPosts.push(...posts);
          this.logger.debug(`✅ r/${subreddit}: ${posts.length} posts`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Faster rate limiting
        
      } catch (error) {
        this.logger.debug(`Failed r/${subreddit}:`, error);
      }
    }
    
    this.logger.debug(`🎯 Subreddit search found: ${allPosts.length} posts`);
    return allPosts;
  }

  /**
   * Search individual subreddit
   */
  private async searchSubreddit(subreddit: string, keyword: string, params: SearchParams): Promise<RedditPost[]> {
    try {
      const response = await this.httpClient.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
        params: {
          q: keyword,
          restrict_sr: 1,
          sort: 'new',
          limit: 20, // Increased for more results
          t: this.getTimeFilter(params.datePosted),
          raw_json: 1 // FIXED: Added for better results
        },
        timeout: 8000
      });

      if (response.data?.data?.children) {
        return response.data.data.children
          .map((child: any) => child.data)
          .filter((post: any) => post && post.title);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * FIXED: Date filter with proper 7-day maximum for fresh jobs
   */
  private getTimeFilter(datePosted?: string): string {
    switch (datePosted) {
      case 'today': 
      case '1day': 
        return 'day';
      case '3days':
      case '7days':
      case 'week': 
        return 'week'; // Reddit's closest option to 7 days
      case 'month': 
        return 'month';
      default: 
        return 'week'; // DEFAULT to 7 days maximum for fresh jobs (FIXED)
    }
  }

  /**
   * Build effective search query for comprehensive results
   */
  private buildEffectiveQuery(keyword: string, searchMode?: string): string {
    const mode = searchMode || 'moderate';
    
    // FIXED: Use simple working patterns
    switch (mode) {
      case 'strict':
        return `"${keyword}" AND hiring`;
      case 'moderate':
        return `${keyword} AND (hiring OR job OR position)`;
      case 'loose':
        return `${keyword} AND (hiring OR job OR work OR career OR position OR opportunity)`;
      default:
        return `${keyword} hiring`;
    }
  }

  // ... (rest of helper methods remain the same)
  
  private deduplicatePosts(posts: RedditPost[]): RedditPost[] {
    const seen = new Set<string>();
    return posts.filter(post => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }

  private isJobRelatedPost(post: RedditPost): boolean {
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    
    const jobIndicators = [
      'hiring', 'job', 'position', 'opportunity', 'looking for', 'we need',
      'seeking', 'recruit', 'apply', 'career', 'employment', 'work',
      'developer', 'engineer', 'designer', 'manager', 'specialist',
      'remote', 'freelance', 'contract', 'part-time', 'full-time'
    ];
    
    return jobIndicators.some(indicator => text.includes(indicator));
  }

  private getRelevantSubreddits(keywords: string[]): string[] {
    return this.TARGET_SUBREDDITS;
  }

  private async parsePostForJob(post: RedditPost, params: SearchParams): Promise<Job | null> {
    try {
      const fullText = `${post.title} ${post.selftext}`;
      
      const relevanceScore = this.calculateRelevanceScore(post, params);
      
      if (relevanceScore < 0.2) { // FIXED: Even more lenient for maximum coverage
        return null;
      }

      const jobInfo = this.extractJobInfo(fullText);
      const contacts = await this.extractContactInformation(post);
      
      if (contacts.length === 0 && !post.is_self) {
        const linkContacts = await this.extractContactsFromLink(post.url);
        contacts.push(...linkContacts);
      }

      const jobType = this.determineJobType(fullText);
      const isRemote = this.checkRemoteJob(fullText, params.remote);

      const job: Job = {
        id: `reddit-${post.id}`,
        title: jobInfo.title || this.extractTitleFromPost(post),
        company: jobInfo.company || this.extractCompanyFromPost(post),
        location: jobInfo.location || (isRemote ? 'Remote' : params.location || 'Not specified'),
        description: this.cleanDescription(fullText),
        requirements: jobInfo.requirements,
        salary: jobInfo.salary,
        jobType,
        remote: isRemote,
        url: `https://reddit.com${post.permalink}`,
        source: 'reddit',
        contact: this.formatContactInfo(contacts),
        postedAt: new Date(post.created_utc * 1000),
        scraped: {
          scrapedAt: new Date(),
          scraperId: this.id,
          rawData: {
            subreddit: post.subreddit,
            author: post.author,
            ups: post.ups,
            comments: post.num_comments,
            originalUrl: post.url,
            relevanceScore: relevanceScore
          }
        }
      };

      return job;

    } catch (error) {
      this.logger.error('Failed to parse Reddit post', { error, postId: post.id });
      return null;
    }
  }

  // Simplified helper methods for core functionality
  private calculateRelevanceScore(post: RedditPost, params: SearchParams): number {
    const fullText = `${post.title} ${post.selftext}`.toLowerCase();
    const keywords = params.keywords.map(k => k.toLowerCase());
    
    let score = 0;
    let maxScore = 0;

    for (const keyword of keywords) {
      maxScore += 100;
      if (fullText.includes(keyword)) {
        score += 100;
        continue;
      }
      const keywordWords = keyword.split(' ');
      const matches = keywordWords.filter(word => fullText.includes(word)).length;
      const partialScore = (matches / keywordWords.length) * 60;
      score += partialScore;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  private extractJobInfo(text: string): any {
    const requirements: string[] = [];
    const titleMatch = text.match(/(developer|engineer|designer|manager|analyst|specialist)/i);
    const companyMatch = text.match(/(?:at|@|for)\s+([A-Z][a-zA-Z\s&]{2,20})/);
    const salaryMatch = text.match(/(\$[\d,]+(?:k|K)?(?:\s*-\s*\$?[\d,]+(?:k|K)?)?)/);
    
    return {
      title: titleMatch?.[1],
      company: companyMatch?.[1]?.trim(),
      requirements,
      salary: salaryMatch?.[1],
      remote: this.checkRemoteJob(text)
    };
  }

  private extractTitleFromPost(post: RedditPost): string {
    return post.title.replace(/^\[.*?\]\s*/, '').replace(/\(.*?\)\s*/, '').trim();
  }

  private extractCompanyFromPost(post: RedditPost): string {
    const text = `${post.title} ${post.selftext}`;
    const companyMatch = text.match(/(?:at|@|for|company:)\s+([A-Z][a-zA-Z\s&]{2,30})/i);
    return companyMatch?.[1]?.trim() || 'Not specified';
  }

  private determineJobType(text: string): Job['jobType'] | undefined {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('full-time') || lowerText.includes('fulltime')) return 'full-time';
    if (lowerText.includes('part-time') || lowerText.includes('parttime')) return 'part-time';
    if (lowerText.includes('contract') || lowerText.includes('freelance')) return 'contract';
    if (lowerText.includes('intern')) return 'internship';
    return undefined;
  }

  private checkRemoteJob(text: string, remoteRequested?: boolean): boolean {
    const lowerText = text.toLowerCase();
    const remoteIndicators = ['remote', 'work from home', 'wfh', 'distributed', 'anywhere'];
    return remoteIndicators.some(indicator => lowerText.includes(indicator));
  }

  private async extractContactInformation(post: RedditPost): Promise<EmailContact[]> {
    const contacts: EmailContact[] = [];
    const text = `${post.title} ${post.selftext}`;
    
    for (const pattern of this.EMAIL_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(email => {
          const cleaned = this.cleanEmail(email);
          if (this.isValidEmail(cleaned) && this.isBusinessEmail(cleaned)) {
            contacts.push({
              email: cleaned,
              context: this.getEmailContext(text, email),
              source: 'post',
              confidence: 0.8
            });
          }
        });
      }
    }
    
    return contacts;
  }

  private async extractContactsFromLink(url: string): Promise<EmailContact[]> { return []; }
  private formatContactInfo(contacts: EmailContact[]) {
    if (contacts.length === 0) return undefined;
    const primary = contacts[0];
    return { email: primary.email, method: 'email', details: primary.context };
  }
  private cleanEmail(email: string): string { return email.toLowerCase().trim(); }
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  private isBusinessEmail(email: string): boolean {
    const commonPersonalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];
    return !commonPersonalDomains.includes(domain);
  }
  private getEmailContext(text: string, email: string): string {
    const index = text.indexOf(email);
    if (index === -1) return '';
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + email.length + 50);
    return text.substring(start, end).trim();
  }
  private cleanDescription(text: string): string {
    return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
  }
  private removeDuplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async performValidation(): Promise<void> {
    try {
      const response = await this.httpClient.get('https://www.reddit.com/.json', {
        timeout: 5000
      });
      
      if (response.status !== 200) {
        throw new Error(`Reddit API returned status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Reddit validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}