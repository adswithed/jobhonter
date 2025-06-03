# JobHonter - AI-Powered Job Application Automation

<div align="center">

![JobHonter Logo](https://via.placeholder.com/200x100/2563eb/ffffff?text=JobHonter)

**Automate your job applications with AI-powered direct outreach**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

[Demo](https://jobhonter-demo.vercel.app) • [Documentation](./docs) • [Community](https://github.com/yourusername/jobhonter/discussions)

</div>

## 🎯 What is JobHonter?

JobHonter is an **AI-powered job application automation platform** that discovers jobs from social media and search engines, extracts contact emails, and sends personalized applications directly to hiring managers - **bypassing traditional job boards entirely**.

### 🚀 Key Features

**Open Source Core:**
- 🔍 **Multi-Platform Job Discovery** - Scrape Twitter, Reddit, LinkedIn, Google, and more
- 📧 **Smart Email Discovery** - Extract hiring manager contacts from job posts
- ✉️ **Automated Email Sending** - Multi-provider email integration (SMTP, SendGrid, Mailgun)
- 📊 **Application Tracking** - Monitor application status and responses
- 🎨 **Modern UI** - Beautiful Next.js dashboard with Tailwind CSS
- 🔐 **Secure by Default** - JWT authentication, rate limiting, input validation

**SaaS Premium Features:**
- 🤖 **AI Application Generation** - GPT-powered cover letters and resume tailoring
- 📈 **Advanced Analytics** - Success rate tracking and optimization insights
- 👥 **Team Collaboration** - Multi-user workspaces and shared templates
- 🎯 **Smart Job Matching** - AI-powered job relevance scoring
- ⚡ **Priority Support** - Dedicated support and feature requests

## 🏗️ Architecture

JobHonter uses a modern **monorepo architecture** with clear separation between open source and premium features:

```
jobhonter/
├── apps/
│   ├── frontend/          # Next.js 15 + TypeScript UI (Open Source)
│   └── backend/           # Express.js API + Prisma (Open Source)
├── packages/
│   ├── core/              # Shared utilities (Open Source)
│   ├── scraper/           # Job scraping engine (Open Source)
│   ├── email-discovery/   # Email extraction (Open Source)
│   ├── email-sender/      # Email automation (Open Source)
│   ├── ai-agent/          # AI features (SaaS Premium)
│   └── admin-tools/       # Analytics & admin (SaaS Premium)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+**
- **pnpm** (recommended) or npm

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/jobhonter.git
cd jobhonter
pnpm install
```

### 2. Environment Setup

```bash
# Backend configuration
cp apps/backend/env.example apps/backend/.env
# Edit with your database URL and JWT secret

# Frontend configuration (optional)
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 3. Database Setup

```bash
cd apps/backend
pnpm db:push      # For development
# OR
pnpm db:migrate   # For production
```

### 4. Start Development

```bash
# Root directory - starts both frontend and backend
pnpm dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 📖 Documentation

- **[Setup Guide](./docs/setup.md)** - Detailed installation and configuration
- **[API Documentation](./docs/api.md)** - Complete API reference
- **[Architecture Guide](./docs/architecture.md)** - System design and components
- **[Contributing](./docs/contributing.md)** - How to contribute to the project
- **[Deployment](./docs/deployment.md)** - Production deployment guide

## 🌟 Open Source vs SaaS

### Open Source Version (MIT License)
Perfect for developers and individual users who want to:
- Self-host their job application automation
- Customize the platform for their needs
- Learn from the codebase
- Contribute to the community

### SaaS Version (jobhonter.com)
Ideal for users who want:
- Hosted solution with zero setup
- Advanced AI-powered features
- Team collaboration capabilities
- Priority support and updates

**Same Beautiful UI** - Both versions share the same modern, intuitive interface.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Email**: Multi-provider (SMTP, SendGrid, Mailgun, Resend)
- **AI**: OpenAI/Claude (SaaS only)
- **Deployment**: Vercel, Railway, Docker

## 🔐 Security Features

- **Zero-Trust Architecture** - Every request validated
- **OWASP Top 10 Compliance** - Built-in security best practices
- **Rate Limiting** - Comprehensive API protection
- **Input Validation** - Zod schemas for all data
- **Secure Headers** - Helmet.js protection
- **SQL Injection Protection** - Prisma ORM with parameterized queries

## 📊 Performance

- **Sub-200ms API Response Times**
- **Optimized Database Queries** with proper indexing
- **Horizontal Scaling** ready architecture
- **CDN Integration** for static assets
- **Caching Strategies** for frequently accessed data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Community

- **[GitHub Discussions](https://github.com/yourusername/jobhonter/discussions)** - Ask questions and share ideas
- **[Discord](https://discord.gg/jobhonter)** - Real-time community chat
- **[Twitter](https://twitter.com/jobhonter)** - Latest updates and announcements

## 🚀 Roadmap

- [x] **Phase 1**: Core platform foundation
- [x] **Phase 2**: Job discovery and email automation
- [ ] **Phase 3**: AI-powered application generation
- [ ] **Phase 4**: Advanced analytics and team features
- [ ] **Phase 5**: Mobile app and browser extension

## 💰 Pricing

### Open Source
- **Free forever**
- Self-hosted
- Core automation features
- Community support

### SaaS Pro
- **$29/month**
- Hosted solution
- AI-powered features
- Priority support
- Team collaboration

### SaaS Enterprise
- **$99/month**
- Everything in Pro
- Advanced analytics
- Custom integrations
- Dedicated support

## 📈 Stats

- 🌟 **X** GitHub Stars
- 🍴 **X** Forks
- 🐛 **X** Issues Resolved
- 👥 **X** Contributors

---

<div align="center">
  <h3>Made with ❤️ by the JobHonter team</h3>
  <p>
    <a href="https://github.com/yourusername/jobhonter">GitHub</a> •
    <a href="https://jobhonter.com">Website</a> •
    <a href="https://twitter.com/jobhonter">Twitter</a>
  </p>
</div> 