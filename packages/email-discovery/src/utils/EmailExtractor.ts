import { EmailContact, EmailSource, EmailPattern, EmailValidationResult } from '../types'
import * as validator from 'email-validator'

export class EmailExtractor {
  
  // Comprehensive email regex patterns with confidence scores
  private static readonly EMAIL_PATTERNS: EmailPattern[] = [
    {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      description: 'Standard email pattern',
      confidence: 0.9
    },
    {
      pattern: /\b[A-Za-z0-9._%+-]+\s*\[\s*at\s*\]\s*[A-Za-z0-9.-]+\s*\[\s*dot\s*\]\s*[A-Z|a-z]{2,}\b/gi,
      description: 'Obfuscated email with [at] and [dot]',
      confidence: 0.8
    },
    {
      pattern: /\b[A-Za-z0-9._%+-]+\s*\(\s*at\s*\)\s*[A-Za-z0-9.-]+\s*\(\s*dot\s*\)\s*[A-Z|a-z]{2,}\b/gi,
      description: 'Obfuscated email with (at) and (dot)',
      confidence: 0.8
    },
    {
      pattern: /\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b/g,
      description: 'Email with spaces around @ and .',
      confidence: 0.7
    },
    {
      pattern: /mailto:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi,
      description: 'Mailto links',
      confidence: 0.95
    }
  ]

  // Common disposable email domains
  private static readonly DISPOSABLE_DOMAINS = new Set([
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
    'dispostable.com', 'tempmail.net', 'sharklasers.com', 'guerrillamailblock.com',
    'emailondeck.com', 'temp-mail.io', 'mohmal.com', 'mytrashmail.com'
  ])

  // Common HR-related email patterns
  private static readonly HR_PATTERNS = [
    'hr@', 'careers@', 'jobs@', 'recruiting@', 'recruitment@', 'talent@',
    'hiring@', 'work@', 'employment@', 'human.resources@', 'people@'
  ]

  // Common executive email patterns
  private static readonly EXECUTIVE_PATTERNS = [
    'ceo@', 'founder@', 'president@', 'director@', 'manager@', 'lead@',
    'head@', 'chief@', 'vp@', 'vice.president@', 'exec@'
  ]

  /**
   * Extract emails from text content
   */
  public static extractFromText(text: string, source: EmailSource): EmailContact[] {
    const emails: EmailContact[] = []
    const foundEmails = new Set<string>()

    for (const pattern of this.EMAIL_PATTERNS) {
      const matches = text.match(pattern.pattern)
      if (matches) {
        for (const match of matches) {
          let email = this.normalizeEmail(match)
          
          // Skip if already found
          if (foundEmails.has(email)) continue
          
          // Validate basic email format
          if (!this.isValidEmailFormat(email)) continue
          
          foundEmails.add(email)
          
          const contact: EmailContact = {
            email,
            source: {
              ...source,
              confidence: pattern.confidence,
              method: pattern.description
            },
            verified: false,
            isDisposable: this.isDisposableEmail(email)
          }

          // Try to extract name and title from surrounding context
          const context = this.extractContext(text, match)
          if (context.name) contact.name = context.name
          if (context.title) contact.title = context.title

          emails.push(contact)
        }
      }
    }

    return emails
  }

  /**
   * Extract emails from HTML content
   */
  public static extractFromHtml(html: string, source: EmailSource): EmailContact[] {
    // Remove HTML tags but preserve some structure
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
      .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    return this.extractFromText(textContent, source)
  }

  /**
   * Normalize email address
   */
  private static normalizeEmail(email: string): string {
    return email
      .toLowerCase()
      .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
      .replace(/\s*\(\s*at\s*\)\s*/gi, '@')
      .replace(/\s*\[\s*dot\s*\]\s*/gi, '.')
      .replace(/\s*\(\s*dot\s*\)\s*/gi, '.')
      .replace(/\s+/g, '')
      .replace(/mailto:/gi, '')
      .trim()
  }

  /**
   * Check if email format is valid
   */
  private static isValidEmailFormat(email: string): boolean {
    try {
      return validator.validate(email)
    } catch {
      return false
    }
  }

  /**
   * Check if email is from a disposable domain
   */
  private static isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase()
    return domain ? this.DISPOSABLE_DOMAINS.has(domain) : false
  }

  /**
   * Extract context around email for name/title detection
   */
  private static extractContext(text: string, email: string): { name?: string; title?: string } {
    const emailIndex = text.indexOf(email)
    if (emailIndex === -1) return {}

    // Extract surrounding text (100 chars before and after)
    const start = Math.max(0, emailIndex - 100)
    const end = Math.min(text.length, emailIndex + email.length + 100)
    const context = text.substring(start, end)

    const result: { name?: string; title?: string } = {}

    // Try to find name patterns
    const namePatterns = [
      /([A-Z][a-z]+ [A-Z][a-z]+)\s*[:\-\s]*[A-Za-z0-9._%+-]+@/g,
      /Contact:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/gi,
      /([A-Z][a-z]+ [A-Z][a-z]+)\s*\([^)]*[A-Za-z0-9._%+-]+@/g
    ]

    for (const pattern of namePatterns) {
      const match = pattern.exec(context)
      if (match && match[1]) {
        result.name = match[1].trim()
        break
      }
    }

    // Try to find title patterns
    const titlePatterns = [
      /(CEO|CTO|CFO|VP|Director|Manager|Lead|Head|Senior|Junior|Associate)\s+[A-Z][a-z]+/gi,
      /([A-Z][a-z]+\s+Manager|[A-Z][a-z]+\s+Director|[A-Z][a-z]+\s+Lead)/gi
    ]

    for (const pattern of titlePatterns) {
      const match = pattern.exec(context)
      if (match && match[0]) {
        result.title = match[0].trim()
        break
      }
    }

    return result
  }

  /**
   * Prioritize emails based on relevance for job applications
   */
  public static prioritizeEmails(emails: EmailContact[]): EmailContact[] {
    return emails.sort((a, b) => {
      let scoreA = this.calculateEmailScore(a.email)
      let scoreB = this.calculateEmailScore(b.email)

      // Boost score for source confidence
      scoreA += a.source.confidence * 10
      scoreB += b.source.confidence * 10

      // Penalty for disposable emails
      if (a.isDisposable) scoreA -= 50
      if (b.isDisposable) scoreB -= 50

      return scoreB - scoreA
    })
  }

  /**
   * Calculate relevance score for email
   */
  private static calculateEmailScore(email: string): number {
    let score = 0
    const lowerEmail = email.toLowerCase()

    // HR-related emails get highest priority
    for (const pattern of this.HR_PATTERNS) {
      if (lowerEmail.includes(pattern)) {
        score += 50
        break
      }
    }

    // Executive emails get high priority
    for (const pattern of this.EXECUTIVE_PATTERNS) {
      if (lowerEmail.includes(pattern)) {
        score += 30
        break
      }
    }

    // Generic emails get lower priority
    const genericPatterns = ['info@', 'contact@', 'support@', 'hello@', 'admin@']
    for (const pattern of genericPatterns) {
      if (lowerEmail.includes(pattern)) {
        score += 10
        break
      }
    }

    // Personal emails (with names) get medium priority
    const parts = email.split('@')[0]
    if (parts.includes('.') || parts.includes('_') || parts.includes('-')) {
      score += 20
    }

    return score
  }

  /**
   * Validate email deliverability (basic check)
   */
  public static async validateEmailDeliverability(email: string): Promise<EmailValidationResult> {
    const result: EmailValidationResult = {
      email,
      isValid: this.isValidEmailFormat(email),
      isDisposable: this.isDisposableEmail(email),
      deliverable: 'unknown'
    }

    if (!result.isValid) {
      result.reason = 'Invalid email format'
      result.deliverable = 'invalid'
      return result
    }

    if (result.isDisposable) {
      result.reason = 'Disposable email domain'
      result.deliverable = 'invalid'
      return result
    }

    // Basic domain validation
    try {
      const domain = email.split('@')[1]
      if (!domain || domain.length < 3 || !domain.includes('.')) {
        result.deliverable = 'invalid'
        result.reason = 'Invalid domain'
        return result
      }

      // For now, assume valid if it passes basic checks
      // In production, this would integrate with email validation services
      result.deliverable = 'valid'
    } catch (error) {
      result.deliverable = 'invalid'
      result.reason = 'Validation error'
    }

    return result
  }

  /**
   * Suggest email formats based on company domain
   */
  public static suggestEmailFormats(name: string, domain: string): string[] {
    if (!name || !domain) return []

    const nameParts = name.toLowerCase().split(' ').filter(part => part.length > 0)
    if (nameParts.length === 0) return []

    const firstName = nameParts[0]
    const lastName = nameParts[nameParts.length - 1]
    const suggestions: string[] = []

    // Common email format patterns
    const patterns = [
      `${firstName}.${lastName}@${domain}`,
      `${firstName}${lastName}@${domain}`,
      `${firstName}_${lastName}@${domain}`,
      `${firstName[0]}${lastName}@${domain}`,
      `${firstName}.${lastName[0]}@${domain}`,
      `${firstName[0]}.${lastName}@${domain}`,
      `${lastName}.${firstName}@${domain}`,
      `${lastName}${firstName}@${domain}`,
      `${lastName}_${firstName}@${domain}`
    ]

    // Filter out duplicates and invalid formats
    for (const pattern of patterns) {
      if (this.isValidEmailFormat(pattern) && !suggestions.includes(pattern)) {
        suggestions.push(pattern)
      }
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }
} 