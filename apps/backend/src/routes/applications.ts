import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = Router();

// Validation rules
const createApplicationValidation = [
  body('jobId').isUUID().withMessage('Valid job ID is required'),
  body('status').optional().isIn(['pending', 'applied', 'interviewing', 'rejected', 'accepted']).withMessage('Invalid status'),
  body('coverLetter').optional().trim(),
  body('notes').optional().trim(),
  body('appliedAt').optional().isISO8601().withMessage('Applied date must be valid ISO date'),
];

const updateApplicationValidation = [
  param('id').isUUID().withMessage('Invalid application ID'),
  body('status').optional().isIn(['pending', 'applied', 'interviewing', 'rejected', 'accepted']).withMessage('Invalid status'),
  body('coverLetter').optional().trim(),
  body('notes').optional().trim(),
  body('appliedAt').optional().isISO8601().withMessage('Applied date must be valid ISO date'),
];

const applicationIdValidation = [
  param('id').isUUID().withMessage('Invalid application ID'),
];

// Get all applications
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  
  const applications = await prisma.application.findMany({
    where: { 
      job: {
        userId,
      },
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          salary: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    data: { applications },
  });
}));

// Create new application
router.post('/', authenticateToken, validate(createApplicationValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { jobId, ...applicationData } = req.body;

  // Verify job belongs to user
  const job = await prisma.job.findFirst({
    where: { 
      id: jobId,
      userId,
    },
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
    });
  }

  // Check if application already exists for this job
  const existingApplication = await prisma.application.findFirst({
    where: { jobId },
  });

  if (existingApplication) {
    return res.status(409).json({
      success: false,
      message: 'Application already exists for this job',
    });
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      status: 'pending',
      appliedAt: new Date(),
      ...applicationData,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          salary: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Application created successfully',
    data: { application },
  });
}));

// Update application
router.patch('/:id', authenticateToken, validate(updateApplicationValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  // Check if application exists and belongs to user
  const existingApplication = await prisma.application.findFirst({
    where: { 
      id,
      job: {
        userId,
      },
    },
  });

  if (!existingApplication) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  const application = await prisma.application.update({
    where: { id },
    data: updateData,
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          salary: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Application updated successfully',
    data: { application },
  });
}));

// Delete application
router.delete('/:id', authenticateToken, validate(applicationIdValidation), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  // Check if application exists and belongs to user
  const existingApplication = await prisma.application.findFirst({
    where: { 
      id,
      job: {
        userId,
      },
    },
  });

  if (!existingApplication) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  await prisma.application.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully',
  });
}));

export default router; 