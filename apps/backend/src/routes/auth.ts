import express, { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Input validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 }).trim().escape(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

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

// Register endpoint
router.post('/register', registerValidation, async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '📋 Some fields need attention! Fill them all out correctly.',
        errors: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'That email is already in our recruitment database!'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' // Default role
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Welcome to the job hunting crew!',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Our recruitment servers are taking a break! Try again in a moment.'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '📋 Please check your email and password fields.',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Our authentication servers are having a moment! Please try again.'
    });
  }
});

// Admin login endpoint
router.post('/admin/login', loginValidation, async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '📋 Admin credentials required. Check your fields.',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: '🛡️ Admin credentials not found. Access denied.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '🔑 Invalid admin credentials. Try again, chief!'
      });
    }

    // Generate JWT token with admin permissions
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Admin access granted! Welcome to the command center.',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Command center servers are temporarily down! Please try again.'
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found in our recruitment database!'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile servers are taking a quick break! Try again shortly.'
    });
  }
});

// Get admin profile (admin-only)
router.get('/admin/profile', adminAuth, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found!'
      });
    }

    res.json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin servers are temporarily unavailable!'
    });
  }
});

// Logout endpoint
router.post('/logout', auth, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'See you on the next hunt! Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout servers are busy! But you can close the app anyway.'
    });
  }
});

// Create admin user (for initial setup)
router.post('/admin/create', async (req: express.Request, res: express.Response) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: '🛡️ An admin already exists! The command center is secured.'
      });
    }

    const { email, password, name } = req.body;

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    });

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = adminUser;

    res.status(201).json({
      success: true,
      message: '🎉 Admin account created! Welcome to the command center, chief!',
      data: {
        user: adminWithoutPassword
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin creation servers are down! Try again later.'
    });
  }
});

export default router; 