import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = Router();

// Validation rules
const createJobValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Job title is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('salary').optional().isNumeric().withMessage('Salary must be a number'),
  body('source').optional().trim(),
  body('sourceUrl').optional().isURL().withMessage('Source URL must be valid'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be valid'),
];

const updateJobValidation = [
  param('id').isUUID().withMessage('Invalid job ID'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Job title cannot be empty'),
  body('company').optional().trim().isLength({ min: 1 }).withMessage('Company name cannot be empty'),
  body('description').optional().trim(),
  body('location').optional().trim(),
  body('salary').optional().isNumeric().withMessage('Salary must be a number'),
  body('source').optional().trim(),
  body('sourceUrl').optional().isURL().withMessage('Source URL must be valid'),
  body('contactEmail').optional().isEmail().withMessage('Contact email must be valid'),
];

const jobIdValidation = [
  param('id').isUUID().withMessage('Invalid job ID'),
];

// Get all jobs
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  
  const jobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      applications: {
        select: {
          id: true,
          status: true,
          appliedAt: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: { jobs },
  });
}));

// Get single job
router.get('/:id', authenticateToken, validate(jobIdValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const job = await prisma.job.findFirst({
    where: { 
      id,
      userId,
    },
    include: {
      applications: {
        select: {
          id: true,
          status: true,
          appliedAt: true,
          coverLetter: true,
          notes: true,
        },
      },
    },
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { job },
  });
}));

// Create new job
router.post('/', authenticateToken, validate(createJobValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const jobData = req.body;

  const job = await prisma.job.create({
    data: {
      ...jobData,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job },
  });
}));

// Update job
router.put('/:id', authenticateToken, validate(updateJobValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  // Check if job exists and belongs to user
  const existingJob = await prisma.job.findFirst({
    where: { 
      id,
      userId,
    },
  });

  if (!existingJob) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
    });
  }

  const job = await prisma.job.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: { job },
  });
}));

// Delete job
router.delete('/:id', authenticateToken, validate(jobIdValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if job exists and belongs to user
  const existingJob = await prisma.job.findFirst({
    where: { 
      id,
      userId,
    },
  });

  if (!existingJob) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
    });
  }

  await prisma.job.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
  });
}));

export default router; 