# JobHonter Backend API

This is the backend API server for the JobHonter platform, built with Express.js, TypeScript, and Prisma ORM.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (package manager)

### Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push schema to database (for development)
   pnpm db:push
   
   # Or run migrations (for production)
   pnpm db:migrate
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

The server will start on `http://localhost:3001`

## 📋 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jobhonter_db"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

## 🛠️ Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the TypeScript code
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database (development)
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## 🔗 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with database status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile (requires auth)

### Jobs
- `GET /api/jobs` - Get user's jobs (requires auth)
- `GET /api/jobs/:id` - Get specific job (requires auth)
- `POST /api/jobs` - Create new job (requires auth)
- `PUT /api/jobs/:id` - Update job (requires auth)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

### Applications
- `GET /api/applications` - Get user's applications (requires auth)
- `POST /api/applications` - Create new application (requires auth)
- `PATCH /api/applications/:id` - Update application (requires auth)
- `DELETE /api/applications/:id` - Delete application (requires auth)

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with 12 salt rounds
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured for frontend domain
- **Helmet.js** - Security headers middleware
- **Input Validation** - express-validator for all inputs
- **SQL Injection Protection** - Prisma ORM with parameterized queries

## 📊 Database Schema

The database uses PostgreSQL with the following main models:

- **User** - User accounts and authentication
- **Job** - Job listings discovered by scrapers
- **Application** - Job applications sent by users
- **Contact** - Contact information extracted from jobs
- **EmailTemplate** - Email templates for applications
- **UserPreferences** - User settings and preferences
- **ScrapingJob** - Scraping task management
- **UserAnalytics** - User performance metrics

## 🧪 Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build to verify compilation
pnpm build
```

## 🚀 Production Deployment

1. **Set production environment variables**
2. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```
3. **Build the application:**
   ```bash
   pnpm build
   ```
4. **Start the server:**
   ```bash
   pnpm start
   ```

## 📁 Project Structure

```
apps/backend/
├── src/
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── requestLogger.ts # Request logging
│   │   └── validation.ts   # Input validation
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication routes
│   │   ├── applications.ts # Application routes
│   │   ├── health.ts       # Health check routes
│   │   └── jobs.ts         # Job routes
│   └── index.ts           # Main server file
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development Tips

- **Database Changes**: Always create migrations for schema changes
- **Environment**: Use `.env` for local development, never commit secrets
- **Logging**: Check server logs for request/response information
- **Error Handling**: All routes use `asyncHandler` for automatic error catching
- **Validation**: All inputs are validated using express-validator
- **Authentication**: Use `authenticateToken` middleware for protected routes

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Prisma for all database operations
3. Validate all inputs with express-validator
4. Handle errors with asyncHandler wrapper
5. Add proper TypeScript types
6. Test with real database before committing

---

**Last Updated**: December 2024  
**Node.js Version**: 18+  
**Database**: PostgreSQL 14+ 