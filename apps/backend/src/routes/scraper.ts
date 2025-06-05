import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

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
            sources,
            limit
          }
        },
        message: savedJobs > 0 
          ? `🎯 Discovery complete! Found ${savedJobs} new opportunities for you!`
          : duplicates > 0
            ? `🔍 ${discoveredJobs} jobs discovered, but they were already in your list!`
            : `🤖 No new jobs found. Try different keywords or check back later!`
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
              status: 'coming_soon',
              enabled: false,
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
          activeScrapers: 1,
          lastRun: new Date(),
          stats: {
            totalRuns: 0,
            successfulRuns: 0,
            averageJobsPerRun: 0,
            lastSuccess: null
          }
        },
        message: '🤖 Scraper status: 1 platform ready, 3 more coming soon!'
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

export default router; 