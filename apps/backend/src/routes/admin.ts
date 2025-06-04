import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Admin middleware
const adminAuth = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    // First check if user is authenticated
    await auth(req, res, () => {});
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '🚫 Authentication required for admin access'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '🛡️ Admin access required. This area is for the command center only!'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '🔒 Invalid admin credentials'
    });
  }
};

// Apply admin auth to all routes
router.use(adminAuth);

// Get all users
router.get('/users', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: '👥 Hunter roster retrieved! All crew members accounted for.',
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: '📊 Hunter database is taking a coffee break! Try again shortly.'
    });
  }
});

// Update user
router.put('/users/:id', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: '✅ Hunter profile updated! They\'re looking more professional already.',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: '⚙️ Profile update servers are having a moment! Try again.'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.id) {
      return res.status(400).json({
        success: false,
        message: '🚫 You can\'t fire yourself from the command center! That would be career suicide.'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '🗑️ Hunter removed from the crew. They\'ve been sent back to traditional job hunting!'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: '💥 Deletion servers are jammed! Even our AI can\'t process this request right now.'
    });
  }
});

// Get analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    const regularUsers = totalUsers - adminUsers;

    // Get user registrations in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get user registrations in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      message: '📊 Command center analytics ready! The hunting statistics are in.',
      data: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          hunters: regularUsers,
          recentSignups: recentUsers,
          weeklySignups: weeklyUsers
        },
        // Placeholder data for future features
        applications: {
          total: 0,
          successful: 0,
          pending: 0,
          thisWeek: 0
        },
        scraping: {
          jobsFound: 0,
          emailsDiscovered: 0,
          successRate: 0,
          activeScrapers: 0
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: '📈 Analytics servers are crunching too many numbers! Give them a moment to catch up.'
    });
  }
});

// Get system settings
router.get('/settings', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // For now, return default settings
    // In the future, this would come from a settings table
    const settings = {
      platform: {
        name: 'JobHonter',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      features: {
        userRegistration: true,
        emailVerification: false,
        socialLogin: false,
        aiAgent: false // Will be enabled in SaaS version
      },
      limits: {
        maxUsersPerPlan: 1000,
        maxApplicationsPerDay: 50,
        maxScrapingRequests: 100
      }
    };

    res.json({
      success: true,
      message: '⚙️ Command center settings loaded! All systems operational.',
      data: { settings }
    });

  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({
      success: false,
      message: '🔧 Settings database is being recalibrated! Try again in a moment.'
    });
  }
});

// Update system settings
router.put('/settings', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { settings } = req.body;
    
    // For now, just return success
    // In the future, this would update a settings table
    res.json({
      success: true,
      message: '✅ Command center settings updated! The hunting operation has been reconfigured.',
      data: { settings }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: '⚙️ Settings update failed! Our configuration servers need a moment.'
    });
  }
});

// Get scraper jobs (placeholder for future implementation)
router.get('/scraper/jobs', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // Placeholder data - will be implemented when scraper module is built
    const scraperJobs: any[] = [];

    res.json({
      success: true,
      message: '🤖 Scraper status report ready! All hunting bots are standing by.',
      data: { jobs: scraperJobs }
    });

  } catch (error) {
    console.error('Scraper jobs error:', error);
    res.status(500).json({
      success: false,
      message: '🤖 Scraper command center is offline! The bots need a reboot.'
    });
  }
});

// Create scraper job (placeholder)
router.post('/scraper/jobs', async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { platform, keywords, location } = req.body;
    
    // Placeholder - will be implemented with actual scraper
    const job = {
      id: Date.now().toString(),
      platform,
      keywords,
      location,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: '🚀 Scraper job launched! The hunting bots are on the prowl.',
      data: { job }
    });

  } catch (error) {
    console.error('Create scraper job error:', error);
    res.status(500).json({
      success: false,
      message: '🤖 Scraper deployment failed! The bots are having technical difficulties.'
    });
  }
});

export default router; 