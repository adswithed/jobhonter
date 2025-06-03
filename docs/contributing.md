# Contributing to JobHonter

Thank you for your interest in contributing to JobHonter! This guide will help you get started with contributing to our open source job application automation platform.

## 🎯 Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve our guides and API docs
- 🔧 **Code Contributions** - Fix bugs and implement features
- 🧪 **Testing** - Help us improve test coverage
- 🌍 **Translation** - Localize JobHonter for your language

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/jobhonter.git
cd jobhonter

# Add upstream remote
git remote add upstream https://github.com/originalowner/jobhonter.git
```

### 2. Set Up Development Environment

Follow our [Setup Guide](./setup.md) to get your local environment running.

### 3. Find Something to Work On

- **Good First Issues**: Look for issues labeled `good-first-issue`
- **Help Wanted**: Check issues labeled `help-wanted`
- **Documentation**: Issues labeled `documentation`
- **Bug Fixes**: Issues labeled `bug`

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add email template customization"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for job scraper"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🔧 Coding Standards

### TypeScript

- Use **strict TypeScript** - no `any` types
- Prefer **interfaces** over types for object definitions
- Use **proper generics** for reusable functions
- Document complex types with JSDoc comments

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// ❌ Avoid
const user: any = { /* ... */ };
```

### Code Style

- **2 spaces** for indentation
- **Semicolons** required
- **Single quotes** for strings
- **Trailing commas** in objects and arrays

```typescript
// ✅ Good
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
};

// ❌ Avoid
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
}
```

### File Organization

```
src/
├── components/          # Reusable UI components
├── pages/              # Next.js pages
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── __tests__/          # Test files
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write tests for all new functionality
- Aim for >80% code coverage
- Use descriptive test names
- Group related tests with `describe` blocks

```typescript
// Example test structure
describe('Email Discovery Service', () => {
  describe('extractEmailsFromText', () => {
    it('should extract valid email addresses', () => {
      const text = 'Contact us at hiring@company.com';
      const emails = extractEmailsFromText(text);
      expect(emails).toContain('hiring@company.com');
    });

    it('should ignore invalid email formats', () => {
      const text = 'Not an email: invalid@';
      const emails = extractEmailsFromText(text);
      expect(emails).toHaveLength(0);
    });
  });
});
```

## 📝 Documentation

### API Documentation

- Use JSDoc comments for all public functions
- Include parameter types and return types
- Provide usage examples

```typescript
/**
 * Extracts email addresses from job posting text
 * @param text - The text content to search
 * @param options - Configuration options
 * @returns Array of unique email addresses found
 * 
 * @example
 * ```typescript
 * const emails = extractEmails("Contact hiring@company.com");
 * console.log(emails); // ["hiring@company.com"]
 * ```
 */
export function extractEmails(
  text: string,
  options?: ExtractOptions
): string[] {
  // Implementation...
}
```

### README Updates

- Update relevant documentation when adding features
- Include code examples for new functionality
- Keep installation instructions current

## 🔍 Code Review Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.log statements left in code
- [ ] TypeScript types are properly defined

### Pull Request Guidelines

**Title Format:**
```
feat(scraper): add LinkedIn job discovery support
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
```

**Description Template:**
```markdown
## 🎯 Description
Brief description of what this PR does.

## 🔧 Changes
- List of specific changes made
- Any breaking changes
- New dependencies added

## 🧪 Testing
- How you tested the changes
- Any manual testing performed

## 📸 Screenshots (if applicable)
Include screenshots for UI changes.

## ✅ Checklist
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
- [ ] Follows coding standards
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and linting
2. **Code Review** - Team members review the code
3. **Testing** - Changes are tested in staging environment
4. **Approval** - At least one maintainer approval required
5. **Merge** - Squash and merge to main branch

## 🌍 Open Source vs SaaS Features

### Open Source Contributions
Anyone can contribute to:
- Core job scraping functionality
- Email discovery and sending
- Frontend UI components
- Documentation and guides
- Testing and bug fixes

### SaaS-Only Features
These are private and maintained by core team:
- AI-powered application generation (`packages/ai-agent`)
- Advanced analytics (`packages/admin-tools`)
- Team collaboration features
- Billing and subscription management

## 🚫 What NOT to Contribute

- **AI-related features** - These are part of our SaaS offering
- **Breaking changes** without discussion
- **Large refactors** without prior approval
- **Dependencies** that significantly increase bundle size
- **Features** that conflict with our roadmap

## 💬 Communication

### Before Starting Work

For significant changes:
1. **Open an issue** to discuss the feature/fix
2. **Get feedback** from maintainers
3. **Agree on approach** before coding
4. **Ask questions** if anything is unclear

### During Development

- Comment on the issue with progress updates
- Ask for help if you get stuck
- Share drafts for early feedback

### Channels

- **[GitHub Issues](https://github.com/yourusername/jobhonter/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/yourusername/jobhonter/discussions)** - General questions and ideas
- **[Discord](https://discord.gg/jobhonter)** - Real-time chat with the community

## 🏆 Recognition

### Contributors

All contributors are recognized in:
- **README.md** - List of contributors
- **CHANGELOG.md** - Credit for specific changes
- **GitHub Contributors** - Automatic recognition

### Rewards

- **Swag** - Stickers and t-shirts for regular contributors
- **Early Access** - Beta access to new features
- **Direct Contact** - Access to core team for questions
- **Resume Credit** - Permission to mention contribution

## 📚 Learning Resources

### JobHonter Architecture
- [Architecture Guide](./architecture.md)
- [API Documentation](./api.md)
- [Setup Guide](./setup.md)

### Technologies We Use
- **[Next.js](https://nextjs.org/docs)** - React framework
- **[Prisma](https://www.prisma.io/docs)** - Database ORM
- **[TypeScript](https://www.typescriptlang.org/docs)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling
- **[Express.js](https://expressjs.com/)** - Backend framework

### Best Practices
- **[Clean Code](https://blog.cleancoder.com/)** - Writing maintainable code
- **[Testing Best Practices](https://kentcdodds.com/blog/testing-overview)** - How to test effectively
- **[Git Best Practices](https://git-scm.com/book)** - Version control

## ❓ FAQ

**Q: I'm new to TypeScript. Can I still contribute?**
A: Absolutely! TypeScript is very similar to JavaScript. Start with simple contributions and learn as you go.

**Q: How long does code review take?**
A: Usually 1-3 days. We'll try to give initial feedback within 24 hours.

**Q: Can I work on multiple issues at once?**
A: We recommend focusing on one issue at a time for better quality.

**Q: My PR was rejected. What now?**
A: Don't worry! Read the feedback, make the suggested changes, and resubmit.

**Q: Can I add a new dependency?**
A: Please discuss it in an issue first. We're careful about adding dependencies.

---

Thank you for contributing to JobHonter! Together we're building something amazing. 🚀

**Happy coding!** 💻✨ 