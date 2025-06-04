import express, { Request, Response, Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Get user's jobs with filtering and pagination
router.get('/', 
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['DISCOVERED', 'FILTERED', 'APPLIED', 'REJECTED', 'ARCHIVED']),
    query('source').optional().isIn(['TWITTER', 'REDDIT', 'LINKEDIN', 'GOOGLE', 'FACEBOOK', 'GITHUB']),
    query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
    query('sortBy').optional().isIn(['createdAt', 'relevanceScore', 'title', 'company']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const source = req.query.source as string;
      const search = req.query.search as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';
      const userId = req.user!.id;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { userId };
      if (status) where.status = status;
      if (source) where.source = source;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                appliedAt: true,
                emailSent: true
              }
            },
            contacts: {
              select: {
                id: true,
                email: true,
                name: true,
                verified: true
              }
            }
          }
        }),
        prisma.job.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        },
        message: `🎯 Found ${jobs.length} opportunities! Your job hunt is looking promising!`
      });

    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Oops! Our job hunters took a coffee break. Try again in a moment!'
      });
    }
  }
);

// Get specific job details
router.get('/:id',
  authenticateToken,
  [
    param('id').isString().withMessage('Job ID is required')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const jobId = req.params.id;
      const userId = req.user!.id;

      const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
        include: {
          applications: {
            include: {
              responses: true
            }
          },
          contacts: true
        }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: '🕵️ Job not found! It might have escaped to another dimension.'
        });
      }

      res.json({
        success: true,
        data: job,
        message: '🎯 Job details loaded! Time to strategize your approach!'
      });

    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Something went wrong fetching job details!'
      });
    }
  }
);

// Create new job manually
router.post('/',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Job title is required'),
    body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('salary').optional().isString(),
    body('url').optional().isURL().withMessage('Must be a valid URL'),
    body('source').optional().isIn(['TWITTER', 'REDDIT', 'LINKEDIN', 'GOOGLE', 'FACEBOOK', 'GITHUB', 'MANUAL']),
    body('contactEmail').optional().isEmail().withMessage('Must be a valid email')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        company,
        description,
        location,
        salary,
        url,
        source = 'MANUAL',
        contactEmail
      } = req.body;

      const userId = req.user!.id;

      // Check if job already exists for this user
      const existingJob = await prisma.job.findFirst({
        where: {
          userId,
          OR: [
            { url: url },
            {
              AND: [
                { title: title },
                { company: company }
              ]
            }
          ]
        }
      });

      if (existingJob) {
        return res.status(409).json({
          success: false,
          message: '🔍 This job is already in your hunt list! Great minds think alike.'
        });
      }

      const job = await prisma.job.create({
        data: {
          title,
          company,
          description,
          location,
          salary,
          url,
          source,
          contactEmail,
          userId,
          relevanceScore: 0.5 // Default relevance score for manual jobs
        }
      });

      // Create contact if email provided
      if (contactEmail) {
        await prisma.contact.create({
          data: {
            email: contactEmail,
            company,
            source,
            jobId: job.id
          }
        });
      }

      res.status(201).json({
        success: true,
        data: job,
        message: '🎯 Job added to your hunt list! Ready to make your move?'
      });

    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Failed to add job! Our system had a hiccup.'
      });
    }
  }
);

// Update job status
router.patch('/:id/status',
  authenticateToken,
  [
    param('id').isString().withMessage('Job ID is required'),
    body('status').isIn(['DISCOVERED', 'FILTERED', 'APPLIED', 'REJECTED', 'ARCHIVED'])
      .withMessage('Invalid status'),
    body('notes').optional().isString()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const jobId = req.params.id;
      const { status, notes } = req.body;
      const userId = req.user!.id;

      const job = await prisma.job.findFirst({
        where: { id: jobId, userId }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: '🕵️ Job not found! It might have been snatched by another hunter.'
        });
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { status }
      });

      // Get status-specific messages
      const statusMessages = {
        DISCOVERED: '🔍 Job marked as discovered! Ready for your next move!',
        FILTERED: '🎯 Job filtered and ready for action!',
        APPLIED: '📤 Congrats! Another application in the wild!',
        REJECTED: '🚫 Job archived as rejected. Onward to better opportunities!',
        ARCHIVED: '📁 Job safely archived. Keeping your hunt organized!'
      };

      res.json({
        success: true,
        data: updatedJob,
        message: statusMessages[status as keyof typeof statusMessages] || '✅ Job status updated!'
      });

    } catch (error) {
      console.error('Update job status error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Failed to update job status! Our system had a hiccup.'
      });
    }
  }
);

// Delete job
router.delete('/:id',
  authenticateToken,
  [
    param('id').isString().withMessage('Job ID is required')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const jobId = req.params.id;
      const userId = req.user!.id;

      const job = await prisma.job.findFirst({
        where: { id: jobId, userId }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: '🕵️ Job not found! It might have already vanished.'
        });
      }

      await prisma.job.delete({
        where: { id: jobId }
      });

      res.json({
        success: true,
        message: '🗑️ Job deleted! One less distraction from your perfect opportunity hunt!'
      });

    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Failed to delete job! It\'s holding on tight.'
      });
    }
  }
);

// Get job statistics
router.get('/stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const [
        totalJobs,
        discoveredJobs,
        appliedJobs,
        rejectedJobs,
        archivedJobs,
        totalApplications,
        pendingApplications,
        recentJobs
      ] = await Promise.all([
        prisma.job.count({ where: { userId } }),
        prisma.job.count({ where: { userId, status: 'DISCOVERED' } }),
        prisma.job.count({ where: { userId, status: 'APPLIED' } }),
        prisma.job.count({ where: { userId, status: 'REJECTED' } }),
        prisma.job.count({ where: { userId, status: 'ARCHIVED' } }),
        prisma.application.count({
          where: { job: { userId } }
        }),
        prisma.application.count({
          where: { job: { userId }, status: 'PENDING' }
        }),
        prisma.job.count({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      const applicationRate = totalJobs > 0 ? (appliedJobs / totalJobs) * 100 : 0;

      res.json({
        success: true,
        data: {
          jobs: {
            total: totalJobs,
            discovered: discoveredJobs,
            applied: appliedJobs,
            rejected: rejectedJobs,
            archived: archivedJobs,
            recentlyDiscovered: recentJobs
          },
          applications: {
            total: totalApplications,
            pending: pendingApplications,
            rate: Math.round(applicationRate * 100) / 100
          },
          insights: {
            applicationRate: `${Math.round(applicationRate)}%`,
            weeklyDiscovery: recentJobs,
            activityLevel: recentJobs > 10 ? 'High' : recentJobs > 5 ? 'Medium' : 'Low'
          }
        },
        message: `📊 Your job hunt dashboard! ${totalJobs} opportunities tracked, ${appliedJobs} applications sent. Keep hunting! 🎯`
      });

    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({
        success: false,
        message: '💥 Stats temporarily unavailable! Our analytics team is debugging.'
      });
    }
  }
);

export default router; 