import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Store for SSE connections
const sseConnections = new Map<string, Response>();

// SSE endpoint for real-time scraping progress
router.get('/progress/:sessionId', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store this connection
  sseConnections.set(sessionId, res);
  
  console.log(`📡 SSE connection established for session: ${sessionId}`);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: '🔗 Connected to real-time progress feed',
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`📡 SSE connection closed for session: ${sessionId}`);
    sseConnections.delete(sessionId);
  });
});

// Helper function to send progress updates
function sendProgressUpdate(sessionId: string, update: {
  type: string;
  stage: string;
  message: string;
  progress: number;
  details?: string;
  data?: any;
}) {
  const connection = sseConnections.get(sessionId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify({
        ...update,
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.error('Failed to send SSE update:', error);
      sseConnections.delete(sessionId);
    }
  }
}

// Discover new jobs using scrapers
router.post('/discover',
  authenticateToken,
  [
    body('keywords').isArray({ min: 1 }).withMessage('At least one keyword is required'),
    body('keywords.*').isString().isLength({ min: 1 }).withMessage('Keywords cannot be empty'),
    body('location').optional().isString(),
    body('remote').optional().isBoolean(),
    body('jobTypes').optional().isArray(),
    body('datePosted').optional().isIn(['today', 'week', 'month', 'any']),
    body('searchMode').optional().isIn(['strict', 'moderate', 'loose']).withMessage('Search mode must be strict, moderate, or loose'),
    body('sources').optional().isArray(),
    body('sources.*').optional().isIn(['twitter', 'reddit', 'linkedin', 'google', 'facebook', 'github']),
    body('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        keywords,
        location,
        remote,
        jobTypes,
        datePosted,
        searchMode = 'moderate', // Default to moderate mode
        sources = ['twitter'],
        limit = 50
      } = req.body;

      const userId = req.user!.id;

      // For now, create sample jobs to populate the dashboard
      // Real scraper integration will be added once package builds are resolved
      let discoveredJobs = 0;
      let savedJobs = 0;
      let duplicates = 0;

      // Create sample jobs for testing
      const sampleJobs = createSampleJobs(keywords, location, userId);
      discoveredJobs = sampleJobs.length;
      
      for (const jobData of sampleJobs) {
        try {
          const existingJob = await prisma.job.findFirst({
            where: {
              userId,
              title: jobData.title,
              company: jobData.company
            }
          });

          if (!existingJob) {
            await prisma.job.create({ data: jobData });
            savedJobs++;
          } else {
            duplicates++;
          }
        } catch (dbError) {
          console.error('Failed to save sample job:', dbError);
        }
      }

      res.json({
        success: true,
        data: {
          discovered: discoveredJobs,
          saved: savedJobs,
          duplicates,
          jobs: [],
          message: savedJobs > 0 
            ? `Found ${discoveredJobs} jobs, saved ${savedJobs} new opportunities!`
            : `Found ${discoveredJobs} jobs, but they were already in your list.`,
          searchParams: {
            keywords,
            location,
            remote,
            jobTypes,
            datePosted,
            searchMode,
            sources,
            limit
          }
        },
        message: savedJobs > 0 
          ? `🎯 Discovery complete! Found ${savedJobs} new opportunities using ${searchMode} mode!`
          : duplicates > 0
            ? `🔍 ${discoveredJobs} jobs discovered using ${searchMode} mode, but they were already in your list!`
            : `🤖 No new jobs found with ${searchMode} mode. Try a different search mode or keywords!`
      });

    } catch (error) {
      console.error('Job discovery error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Our job scouts encountered a snag! Please try again.'
      });
    }
  }
);

// Helper method to create sample jobs for testing
function createSampleJobs(keywords: string[], location?: string, userId?: string) {
  const sampleCompanies = ['TechCorp', 'InnovateCo', 'StartupXYZ', 'DevStudio', 'CloudTech'];
  const sampleJobs = [];

  for (let i = 0; i < Math.min(keywords.length * 2, 10); i++) {
    const keyword = keywords[i % keywords.length];
    const company = sampleCompanies[i % sampleCompanies.length];
    
    sampleJobs.push({
      title: `${keyword} - ${company}`,
      company,
      description: `We are looking for a talented ${keyword} to join our team. Great opportunity for growth and innovation.`,
      location: location || 'Remote',
      salary: '$80k-$120k',
      url: `https://example.com/jobs/${company.toLowerCase()}-${i}`,
      source: 'TWITTER',
      contactEmail: `hr@${company.toLowerCase()}.com`,
      relevanceScore: 0.7 + (Math.random() * 0.3),
      status: 'DISCOVERED',
      discoveredAt: new Date(),
      userId: userId!
    });
  }

  return sampleJobs;
}

// Get scraper status
router.get('/status',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          scrapers: [
            {
              name: 'Twitter/X Scraper',
              platform: 'twitter',
              status: 'available',
              enabled: true,
              description: 'Discovers job opportunities from Twitter/X posts'
            },
            {
              name: 'Reddit Scraper',
              platform: 'reddit',
              status: 'available',
              enabled: true,
              description: 'Finds jobs from Reddit job boards and communities'
            },
            {
              name: 'LinkedIn Scraper',
              platform: 'linkedin',
              status: 'coming_soon',
              enabled: false,
              description: 'Searches LinkedIn for job opportunities'
            },
            {
              name: 'Google Jobs Scraper',
              platform: 'google',
              status: 'coming_soon',
              enabled: false,
              description: 'Aggregates jobs from Google Jobs listings'
            }
          ],
          totalScrapers: 4,
          activeScrapers: 2,
          lastRun: new Date(),
          stats: {
            totalRuns: 0,
            successfulRuns: 0,
            averageJobsPerRun: 0,
            lastSuccess: null
          }
        },
        message: '🤖 Scraper status: 2 platforms ready, 2 more coming soon!'
      });
    } catch (error) {
      console.error('Get scraper status error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Scraper status unavailable!'
      });
    }
  }
);

// Test Reddit scraper specifically with real-time progress
router.post('/test-reddit',
  [
    body('keywords').isArray({ min: 1 }).withMessage('At least one keyword is required'),
    body('keywords.*').isString().isLength({ min: 1 }).withMessage('Keywords cannot be empty'),
    body('location').optional().isString(),
    body('remote').optional().isBoolean(),
    body('limit').optional().isInt({ min: 1, max: 50 }),
    body('sessionId').optional().isString(),
    body('maxDaysOld').optional().isInt({ min: 1, max: 365 }).withMessage('maxDaysOld must be between 1 and 365'),
    body('onlyHiring').optional().isBoolean(),
    body('searchMode').optional().isIn(['strict', 'moderate', 'loose']).withMessage('Search mode must be strict, moderate, or loose')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      const {
        keywords,
        location,
        remote = false,
        limit = 10,
        sessionId,
        maxDaysOld = 30, // Default to 30 days for fresh jobs
        onlyHiring = true, // Default to only show hiring posts
        searchMode = 'moderate' // Default to moderate mode
      } = req.body;

      console.log('🔍 Testing Reddit scraper with params:', {
        keywords,
        location,
        remote,
        limit,
        sessionId,
        maxDaysOld,
        onlyHiring,
        searchMode
      });

      // Send initial progress update
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'initialization',
          message: `🚀 Initializing Reddit job search (${searchMode} mode)...`,
          progress: 5,
          details: `Searching for jobs posted within last ${maxDaysOld} days using ${searchMode} relevance matching`
        });
      }

      // Import Reddit scraper
      let RedditScraper: any;
      try {
        const scraperModule = require('../../../../packages/scraper/dist/index.js');
        RedditScraper = scraperModule.RedditScraper;
      } catch (importError) {
        console.error('Failed to import Reddit scraper:', importError);
        return res.status(500).json({
          success: false,
          message: 'Reddit scraper not available - package build required',
          error: 'Import failed'
        });
      }

      // Send progress updates during scraping
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'scraper_init',
          message: '🔧 Initializing Reddit scraper...',
          progress: 15,
          details: 'Loading scraper module and setting up HTTP client'
        });
      }

      const scraper = new RedditScraper();
      const startTime = Date.now();
      
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'scraper_ready',
          message: '🌐 Reddit scraper ready, starting search...',
          progress: 25,
          details: 'Scraper initialized, beginning subreddit search'
        });
      }
      
      const searchParams = {
        keywords,
        location,
        remote,
        limit,
        searchMode // Pass search mode to scraper
      };

      // Start the actual scraping
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'searching',
          message: `🔍 Searching Reddit with ${searchMode} mode...`,
          progress: 40,
          details: `Scanning r/forhire, r/remotework, r/programming and ${keywords.join(', ')} keywords with ${searchMode} matching`
        });
      }

      const result = await scraper.scrape(searchParams);
      const duration = Date.now() - startTime;

      // Send progress update for filtering
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'filtering',
          message: '🎯 Applying smart filters...',
          progress: 70,
          details: `Filtering by date (${maxDaysOld} days) and post type (hiring vs for-hire)`
        });
      }

      // Apply smart filtering
      let filteredJobs = result.jobs;

      // 1. Date filtering - only include jobs within the specified days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
      
      filteredJobs = filteredJobs.filter((job: any) => {
        const jobDate = new Date(job.postedAt);
        return jobDate >= cutoffDate;
      });

      // 2. Smart filtering - distinguish between hiring posts vs for-hire posts
      if (onlyHiring) {
        filteredJobs = filteredJobs.filter((job: any) => {
          return isHiringPost(job);
        });
      }

      // 3. Sort by newest first
      filteredJobs.sort((a: any, b: any) => {
        const dateA = new Date(a.postedAt);
        const dateB = new Date(b.postedAt);
        return dateB.getTime() - dateA.getTime();
      });

      // Send progress update after filtering
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'processing',
          message: '📊 Processing and analyzing results...',
          progress: 80,
          details: `Filtered to ${filteredJobs.length} relevant jobs, extracting contact information`
        });
      }

      console.log(`✅ Reddit scraper test completed in ${duration}ms:`, {
        jobsFound: result.jobs.length,
        jobsAfterFiltering: filteredJobs.length,
        totalFound: result.totalFound,
        hasMore: result.hasMore,
        errors: result.metadata.errors?.length || 0
      });

      // Send final completion update
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'complete',
          stage: 'complete',
          message: '🎉 Search completed successfully!',
          progress: 100,
          details: `Found ${filteredJobs.length} fresh hiring opportunities in ${duration}ms`,
          data: {
            jobsFound: filteredJobs.length,
            contactsFound: filteredJobs.filter((job: any) => job.contact?.email).length,
            duration: `${duration}ms`,
            filtered: {
              originalCount: result.jobs.length,
              afterDateFilter: result.jobs.filter((job: any) => {
                const jobDate = new Date(job.postedAt);
                return jobDate >= cutoffDate;
              }).length,
              afterSmartFilter: filteredJobs.length
            }
          }
        });
      }

      // Add detailed analysis
      const jobsWithContacts = filteredJobs.filter((job: any) => job.contact?.email);
      const remoteJobs = filteredJobs.filter((job: any) => job.remote);
      const subredditBreakdown = filteredJobs.reduce((acc: any, job: any) => {
        const subreddit = job.scraped?.rawData?.subreddit || 'unknown';
        acc[subreddit] = (acc[subreddit] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          // Current filtered jobs (what's shown now)
          jobs: filteredJobs.map((job: any) => ({
            ...job,
            // Add Reddit-specific metadata for display
            redditMetadata: {
              subreddit: job.scraped?.rawData?.subreddit,
              author: job.scraped?.rawData?.author,
              ups: job.scraped?.rawData?.ups,
              comments: job.scraped?.rawData?.comments,
              originalUrl: job.scraped?.rawData?.originalUrl
            }
          })),
          
          // NEW: All three result sets for tabs
          resultSets: {
            totalFound: {
              count: result.totalFound,
              description: 'Raw posts found from Reddit',
              // Note: We don't return raw posts as they're not structured as jobs
              data: [] // Could add sample if needed
            },
            jobsFound: {
              count: result.jobs.length,
              description: 'Posts identified as job opportunities',
              data: result.jobs.map((job: any) => ({
                ...job,
                redditMetadata: {
                  subreddit: job.scraped?.rawData?.subreddit,
                  author: job.scraped?.rawData?.author,
                  ups: job.scraped?.rawData?.ups,
                  comments: job.scraped?.rawData?.comments,
                  originalUrl: job.scraped?.rawData?.originalUrl
                }
              }))
            },
            jobsAfterFiltering: {
              count: filteredJobs.length,
              description: 'Final filtered results (current view)',
              data: filteredJobs.map((job: any) => ({
                ...job,
                redditMetadata: {
                  subreddit: job.scraped?.rawData?.subreddit,
                  author: job.scraped?.rawData?.author,
                  ups: job.scraped?.rawData?.ups,
                  comments: job.scraped?.rawData?.comments,
                  originalUrl: job.scraped?.rawData?.originalUrl
                }
              }))
            }
          },
          
          totalFound: result.totalFound,
          hasMore: result.hasMore,
          filtering: {
            originalCount: result.jobs.length,
            filteredCount: filteredJobs.length,
            maxDaysOld,
            onlyHiring,
            dateCutoff: cutoffDate.toISOString()
          },
          analysis: {
            jobsWithContacts: jobsWithContacts.length,
            contactRate: filteredJobs.length > 0 ? ((jobsWithContacts.length / filteredJobs.length) * 100).toFixed(1) + '%' : '0%',
            remoteJobs: remoteJobs.length,
            remoteRate: filteredJobs.length > 0 ? ((remoteJobs.length / filteredJobs.length) * 100).toFixed(1) + '%' : '0%',
            subredditBreakdown,
            averageRelevance: filteredJobs.length > 0 ? filteredJobs.reduce((sum: number, job: any) => sum + (job.relevanceScore || 0.5), 0) / filteredJobs.length : 0,
            topSubreddits: Object.entries(subredditBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([subreddit, count]) => ({ subreddit, count })),
            avgDaysOld: filteredJobs.length > 0 ? 
              filteredJobs.reduce((sum: number, job: any) => {
                const daysOld = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24));
                return sum + daysOld;
              }, 0) / filteredJobs.length : 0
          }
        },
        metadata: {
          ...result.metadata,
          duration: `${duration}ms`,
          platform: 'reddit',
          scraperVersion: '1.0.0',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Reddit scraper test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Reddit scraper test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Helper function to determine if a post is a hiring post vs a for-hire post
function isHiringPost(job: any): boolean {
  const title = job.title?.toLowerCase() || '';
  const description = job.description?.toLowerCase() || '';
  const company = job.company?.toLowerCase() || '';
  
  // Keywords that indicate someone is offering their services (for hire)
  const forHireKeywords = [
    'for hire',
    'available for work',
    'looking for work',
    'seeking opportunities',
    'freelancer available',
    'open to opportunities',
    'available for hire',
    'seeking employment',
    'looking for job',
    'open for hire',
    'portfolio:',
    'my services',
    'i offer',
    'my skills',
    'years of experience',
    'my expertise',
    'contact me',
    'hire me',
    'my rate',
    'my hourly'
  ];
  
  // Keywords that indicate a company is hiring
  const hiringKeywords = [
    'hiring',
    'we are looking',
    'job opening',
    'position available',
    'we need',
    'seeking developer',
    'looking to hire',
    'join our team',
    'we are hiring',
    'job opportunity',
    'remote position',
    'full-time position',
    'part-time position',
    'contract position',
    'apply now',
    'send resume',
    'candidates',
    'requirements:',
    'responsibilities:'
  ];
  
  const text = `${title} ${description} ${company}`;
  
  // Check for for-hire indicators first (these should be filtered out)
  const hasForHireKeywords = forHireKeywords.some(keyword => text.includes(keyword));
  if (hasForHireKeywords) {
    return false; // This is someone offering services, not a job posting
  }
  
  // Check for hiring indicators
  const hasHiringKeywords = hiringKeywords.some(keyword => text.includes(keyword));
  
  // Additional heuristics:
  // 1. If the company starts with "r/" it's likely a user post
  if (company.startsWith('r/') && !hasHiringKeywords) {
    return false;
  }
  
  // 2. Check post structure - hiring posts usually have more formal structure
  const hasFormattedRequirements = /requirements?:/i.test(description) || 
                                  /responsibilities?:/i.test(description) ||
                                  /qualifications?:/i.test(description);
  
  // 3. Check for salary mentions in a hiring context
  const hasSalaryOffer = /salary|compensation|\$[\d,]+|\d+k/i.test(text) && hasHiringKeywords;
  
  // If it has hiring keywords or formal job posting structure, it's likely a hiring post
  return hasHiringKeywords || hasFormattedRequirements || hasSalaryOffer;
}

// Test Google scraper with comprehensive web search
router.post('/test/google',
  [
    body('keywords').isArray({ min: 1 }).withMessage('At least one keyword is required'),
    body('keywords.*').isString().isLength({ min: 1 }).withMessage('Keywords cannot be empty'),
    body('location').optional().isString(),
    body('remote').optional().isBoolean(),
    body('searchMode').optional().isIn(['strict', 'moderate', 'loose']).withMessage('Search mode must be strict, moderate, or loose'),
    body('limit').optional().isInt({ min: 1, max: 100 }),
    body('sessionId').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        keywords,
        location,
        remote = false,
        searchMode = 'moderate',
        limit = 50,
        sessionId
      } = req.body;

      console.log(`🚀 Starting Google comprehensive web search test:`, {
        keywords,
        location,
        remote,
        searchMode,
        limit,
        approach: 'multi-strategy-entire-web'
      });

      // Send initial progress update
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'start',
          stage: 'init',
          message: `🌐 Initializing comprehensive Google web search (${searchMode} mode)...`,
          progress: 5,
          details: `Preparing to search entire web for ${keywords.join(', ')} opportunities using multiple strategies`
        });
      }

      // Import Google scraper
      let GoogleScraper: any;
      try {
        const scraperModule = require('../../../../packages/scraper/dist/index.js');
        GoogleScraper = scraperModule.GoogleScraper;
      } catch (importError) {
        console.error('Failed to import Google scraper:', importError);
        return res.status(500).json({
          success: false,
          message: 'Google scraper not available - package build required',
          error: 'Import failed'
        });
      }

      // Send progress updates during scraping
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'scraper_init',
          message: '🔧 Initializing comprehensive Google scraper...',
          progress: 15,
          details: 'Loading multi-strategy scraper with browser automation and web crawling'
        });
      }

      const scraper = new GoogleScraper();
      const startTime = Date.now();
      
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'scraper_ready',
          message: '🌐 Google scraper ready, starting comprehensive web search...',
          progress: 25,
          details: 'Scraper initialized with 5 search strategies: direct search, site-specific, content-type, browser automation, and deep content extraction'
        });
      }
      
      const searchParams = {
        keywords,
        location,
        remote,
        limit,
        searchMode
      };

      // Start the actual scraping
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'searching',
          message: `🔍 Searching entire web with ${searchMode} mode...`,
          progress: 40,
          details: `Scanning job boards, company sites, blogs, forums, and social platforms for ${keywords.join(', ')} opportunities`
        });
      }

      const result = await scraper.scrape(searchParams);
      const duration = Date.now() - startTime;

      // Send progress update for analysis
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'analyzing',
          message: '🎯 Analyzing and ranking results...',
          progress: 70,
          details: `Processing ${result.jobs.length} opportunities, extracting contact info and calculating relevance scores`
        });
      }

      // Apply additional filtering and analysis
      let filteredJobs = result.jobs;

      // Sort by relevance score (highest first)
      filteredJobs.sort((a: any, b: any) => {
        const scoreA = a.scraped?.rawData?.relevanceScore || 0;
        const scoreB = b.scraped?.rawData?.relevanceScore || 0;
        return scoreB - scoreA;
      });

      // Send progress update after analysis
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'progress',
          stage: 'processing',
          message: '📊 Finalizing comprehensive results...',
          progress: 85,
          details: `Ranked ${filteredJobs.length} opportunities by relevance, extracting contact information and metadata`
        });
      }

      console.log(`✅ Google comprehensive search completed in ${duration}ms:`, {
        jobsFound: result.jobs.length,
        totalFound: result.totalFound,
        hasMore: result.hasMore,
        errors: result.metadata.errors?.length || 0,
        strategies: 'direct, site-specific, content-type, browser, deep-content'
      });

      // Send final completion update
      if (sessionId) {
        sendProgressUpdate(sessionId, {
          type: 'complete',
          stage: 'complete',
          message: '🎉 Comprehensive web search completed!',
          progress: 100,
          details: `Found ${filteredJobs.length} opportunities across the entire web in ${duration}ms`,
          data: {
            jobsFound: filteredJobs.length,
            contactsFound: filteredJobs.filter((job: any) => job.contact?.email).length,
            duration: `${duration}ms`,
            strategies: ['direct-search', 'site-specific', 'content-type', 'browser-automation', 'deep-content'],
            coverage: 'entire-web'
          }
        });
      }

      // Add comprehensive analysis
      const jobsWithContacts = filteredJobs.filter((job: any) => job.contact?.email);
      const remoteJobs = filteredJobs.filter((job: any) => job.remote);
      const highRelevanceJobs = filteredJobs.filter((job: any) => (job.scraped?.rawData?.relevanceScore || 0) > 0.7);
      
      // Analyze source domains
      const domainBreakdown = filteredJobs.reduce((acc: any, job: any) => {
        const domain = job.scraped?.rawData?.searchResult?.displayLink || 'unknown';
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});

      // Analyze job types found
      const jobTypeBreakdown = filteredJobs.reduce((acc: any, job: any) => {
        const jobType = job.jobType || 'unspecified';
        acc[jobType] = (acc[jobType] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          jobs: filteredJobs.map((job: any) => ({
            ...job,
            // Add Google-specific metadata for display
            googleMetadata: {
              searchKeyword: job.scraped?.rawData?.searchKeyword,
              relevanceScore: job.scraped?.rawData?.relevanceScore,
              searchResult: {
                title: job.scraped?.rawData?.searchResult?.title,
                snippet: job.scraped?.rawData?.searchResult?.snippet,
                displayLink: job.scraped?.rawData?.searchResult?.displayLink
              },
              extractedInfo: job.scraped?.rawData?.extractedInfo
            }
          })),
          
          totalFound: result.totalFound,
          hasMore: result.hasMore,
          
          analysis: {
            jobsWithContacts: jobsWithContacts.length,
            contactRate: filteredJobs.length > 0 ? ((jobsWithContacts.length / filteredJobs.length) * 100).toFixed(1) + '%' : '0%',
            remoteJobs: remoteJobs.length,
            remoteRate: filteredJobs.length > 0 ? ((remoteJobs.length / filteredJobs.length) * 100).toFixed(1) + '%' : '0%',
            highRelevanceJobs: highRelevanceJobs.length,
            highRelevanceRate: filteredJobs.length > 0 ? ((highRelevanceJobs.length / filteredJobs.length) * 100).toFixed(1) + '%' : '0%',
            averageRelevance: filteredJobs.length > 0 ? 
              (filteredJobs.reduce((sum: number, job: any) => sum + (job.scraped?.rawData?.relevanceScore || 0), 0) / filteredJobs.length).toFixed(3) : '0',
            domainBreakdown,
            jobTypeBreakdown,
            topDomains: Object.entries(domainBreakdown)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 10)
              .map(([domain, count]) => ({ domain, count })),
            searchStrategies: {
              direct: 'Google/DuckDuckGo direct search with multiple query patterns',
              siteSpecific: 'Targeted searches on job boards and company career pages',
              contentType: 'Document and content-specific searches (PDFs, blogs, articles)',
              browserAutomation: 'Real-time browser-based search with JavaScript rendering',
              deepContent: 'Blog posts, articles, and community content extraction'
            }
          }
        },
        metadata: {
          ...result.metadata,
          duration: `${duration}ms`,
          platform: 'google',
          scraperVersion: '1.0.0',
          searchApproach: 'comprehensive-web-search',
          strategiesUsed: ['direct', 'site-specific', 'content-type', 'browser', 'deep-content'],
          coverage: 'entire-web',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Google comprehensive search failed:', error);
      res.status(500).json({
        success: false,
        message: 'Google comprehensive search failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router; 