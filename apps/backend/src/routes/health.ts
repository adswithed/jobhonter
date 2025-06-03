import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';

const router: Router = Router();

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'JobHonter Backend API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
}));

// Detailed health check with database
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Test database connection
  let dbStatus = 'disconnected';
  let dbLatency = 0;
  
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    dbStatus = 'error';
  }
  
  const totalLatency = Date.now() - startTime;
  
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    success: dbStatus === 'connected',
    message: 'JobHonter Backend API detailed health check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latency: `${dbLatency}ms`,
    },
    performance: {
      totalLatency: `${totalLatency}ms`,
    },
    version: process.env.npm_package_version || '0.1.0',
  });
}));

export default router; 