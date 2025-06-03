# JobHonter Setup Guide

This guide will help you set up JobHonter locally for development or self-hosting.

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** ([Download here](https://nodejs.org/))
- **PostgreSQL 14+** ([Download here](https://www.postgresql.org/download/))
- **pnpm** (recommended) or npm
  ```bash
  npm install -g pnpm
  ```

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/jobhonter.git
cd jobhonter
pnpm install
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb jobhonter_dev

# Set DATABASE_URL in apps/backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/jobhonter_dev"
```

**Option B: Docker PostgreSQL**
```bash
docker run --name jobhonter-postgres \
  -e POSTGRES_DB=jobhonter_dev \
  -e POSTGRES_USER=jobhonter \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Environment Configuration

```bash
# Backend environment
cp apps/backend/env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```env
DATABASE_URL="postgresql://jobhonter:password@localhost:5432/jobhonter_dev"
JWT_SECRET="your-super-secure-jwt-secret-here"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 4. Initialize Database

```bash
cd apps/backend
pnpm db:push
```

### 5. Start Development

```bash
# From root directory
pnpm dev
```

🎉 **Done!** Visit:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 📋 Detailed Setup

### Environment Variables

#### Backend (.env)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | ✅ | Secret for JWT tokens | `your-super-secure-secret` |
| `PORT` | ❌ | Backend port (default: 3001) | `3001` |
| `NODE_ENV` | ❌ | Environment (default: development) | `development` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | `http://localhost:3000` |

#### Optional Email Providers
```env
# SMTP (Generic)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain

# Resend
RESEND_API_KEY=your-resend-api-key
```

### Database Migration vs Push

**Development (db:push)**
```bash
pnpm db:push
```
- Faster for development
- Syncs schema without migrations
- Good for rapid prototyping

**Production (db:migrate)**
```bash
pnpm db:migrate
```
- Creates migration files
- Version controlled schema changes
- Required for production

### Project Structure Deep Dive

```
jobhonter/
├── apps/
│   ├── frontend/                    # Next.js 15 Frontend
│   │   ├── app/                    # App router pages
│   │   ├── components/             # Reusable components
│   │   ├── lib/                    # Utility functions
│   │   └── public/                 # Static assets
│   └── backend/                     # Express.js Backend
│       ├── src/
│       │   ├── routes/             # API routes
│       │   ├── middleware/         # Express middleware
│       │   └── index.ts           # Server entry point
│       └── prisma/
│           └── schema.prisma       # Database schema
├── packages/
│   ├── core/                       # Shared utilities
│   ├── scraper/                    # Job scraping (Open Source)
│   ├── email-discovery/            # Email extraction (Open Source)
│   ├── email-sender/               # Email automation (Open Source)
│   ├── ai-agent/                   # AI features (SaaS Premium)
│   └── admin-tools/                # Analytics (SaaS Premium)
├── docs/                           # Documentation
├── .github/                        # CI/CD workflows
└── package.json                    # Root package.json
```

---

## 🛠️ Development Workflow

### Available Scripts

**Root Level Commands:**
```bash
pnpm dev          # Start all development servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript type checking
pnpm clean        # Clean build artifacts
```

**Package-Specific Commands:**
```bash
# Frontend
pnpm --filter @jobhonter/frontend dev
pnpm --filter @jobhonter/frontend build

# Backend
pnpm --filter @jobhonter/backend dev
pnpm --filter @jobhonter/backend build
pnpm --filter @jobhonter/backend db:push
```

### Hot Reload

- **Frontend**: Automatic reload on file changes
- **Backend**: Uses `tsx` for TypeScript hot reload
- **Database**: Schema changes require `pnpm db:push`

---

## 🚀 Production Setup

### 1. Environment Preparation

```bash
# Production environment
cp apps/backend/env.example apps/backend/.env.production
```

Edit production variables:
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/jobhonter_prod"
JWT_SECRET="super-secure-production-secret"
NODE_ENV=production
FRONTEND_URL="https://your-domain.com"
```

### 2. Database Migration

```bash
cd apps/backend
pnpm db:migrate
```

### 3. Build Application

```bash
pnpm build
```

### 4. Start Production

```bash
# Frontend (Next.js)
cd apps/frontend
pnpm start

# Backend (Express.js)
cd apps/backend
pnpm start
```

---

## 🐳 Docker Setup

### Development with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: jobhonter_dev
      POSTGRES_USER: jobhonter
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

### Production Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ apps/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app ./
EXPOSE 3000 3001
CMD ["pnpm", "start"]
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify credentials
psql -h localhost -p 5432 -U username -d database_name
```

**2. Prisma Client Not Generated**
```bash
cd apps/backend
pnpm prisma generate
```

**3. Port Already in Use**
```bash
# Kill process on port 3001
npx kill-port 3001

# Or change port in .env
PORT=3002
```

**4. Permission Denied (macOS/Linux)**
```bash
sudo chown -R $USER:$USER node_modules
```

**5. TypeScript Errors**
```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

### Debug Mode

Enable detailed logging:
```env
DEBUG=jobhonter:*
LOG_LEVEL=debug
```

### Database Reset

```bash
cd apps/backend
pnpm db:reset  # ⚠️ This will delete all data
```

---

## 📊 Health Checks

### Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "JobHonter Backend API is healthy",
  "timestamp": "2024-12-19T10:00:00.000Z",
  "uptime": 123.456
}
```

### Database Health
```bash
curl http://localhost:3001/health/detailed
```

### Frontend Health
Visit http://localhost:3000 - should load the homepage.

---

## 🎯 Next Steps

1. **[API Documentation](./api.md)** - Learn about available endpoints
2. **[Architecture Guide](./architecture.md)** - Understand the system design
3. **[Contributing](./contributing.md)** - Start contributing to the project
4. **[Deployment](./deployment.md)** - Deploy to production

---

## 💬 Need Help?

- **[GitHub Discussions](https://github.com/yourusername/jobhonter/discussions)** - Ask questions
- **[Discord](https://discord.gg/jobhonter)** - Real-time support
- **[Issues](https://github.com/yourusername/jobhonter/issues)** - Report bugs

Happy coding! 🚀 