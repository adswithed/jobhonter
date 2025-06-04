// Email Discovery Types and Interfaces

export interface EmailDiscoveryConfig {
  // Rate limiting
  maxRequestsPerMinute: number
  requestDelay: number
  
  // Timeout settings
  requestTimeout: number
  
  // Email validation
  enableEmailValidation: boolean
  enableDisposableEmailCheck: boolean
  
  // Discovery methods
  enableWebsiteParsing: boolean
  enableWhoisLookup: boolean
  enableSocialMediaParsing: boolean
  
  // User agent settings
  userAgent: string
  randomizeUserAgent: boolean
}

export interface EmailSource {
  type: 'webpage' | 'whois' | 'social' | 'contact_page' | 'about_page' | 'team_page' | 'job_post'
  url: string
  confidence: number
  extractedAt: Date
  method: string
}

export interface EmailContact {
  email: string
  name?: string
  title?: string
  department?: string
  company?: string
  source: EmailSource
  verified: boolean
  isDisposable: boolean
  deliverable?: 'valid' | 'invalid' | 'unknown'
  lastVerified?: Date
}

export interface EmailDiscoveryResult {
  jobId?: string
  companyName: string
  companyDomain?: string
  emails: EmailContact[]
  totalFound: number
  uniqueEmails: number
  verifiedEmails: number
  processingTime: number
  errors: EmailDiscoveryError[]
  metadata: {
    websiteScanned: boolean
    whoisChecked: boolean
    socialMediaChecked: boolean
    contactPageFound: boolean
    processingSteps: string[]
  }
}

export interface EmailDiscoveryError {
  type: 'network' | 'parsing' | 'validation' | 'rate_limit' | 'blocked'
  message: string
  url?: string
  timestamp: Date
}

export interface WebsiteAnalysis {
  url: string
  title?: string
  description?: string
  emails: string[]
  contactLinks: string[]
  socialLinks: string[]
  teamPageLinks: string[]
  aboutPageLinks: string[]
  hasContactForm: boolean
  companyInfo: {
    name?: string
    industry?: string
    size?: string
    location?: string
  }
}

export interface WhoisData {
  domain: string
  emails: string[]
  registrant?: {
    name?: string
    email?: string
    organization?: string
  }
  admin?: {
    name?: string
    email?: string
  }
  tech?: {
    name?: string
    email?: string
  }
}

export interface SocialMediaProfile {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  url: string
  emails: string[]
  contactInfo?: {
    name?: string
    title?: string
    company?: string
  }
}

export interface EmailValidationResult {
  email: string
  isValid: boolean
  isDisposable: boolean
  deliverable: 'valid' | 'invalid' | 'unknown'
  reason?: string
  suggestions?: string[]
}

// Discovery method interfaces
export interface IEmailExtractor {
  extractFromUrl(url: string): Promise<EmailContact[]>
  extractFromText(text: string, source: EmailSource): EmailContact[]
  validateEmails(emails: string[]): Promise<EmailValidationResult[]>
}

export interface IWebsiteParser {
  parseWebsite(url: string): Promise<WebsiteAnalysis>
  findContactPages(baseUrl: string): Promise<string[]>
  extractEmailsFromPage(url: string): Promise<string[]>
}

export interface IWhoisLookup {
  lookupDomain(domain: string): Promise<WhoisData>
  extractEmailsFromWhois(domain: string): Promise<string[]>
}

export interface ISocialMediaParser {
  parseLinkedInProfile(url: string): Promise<SocialMediaProfile>
  parseTwitterProfile(url: string): Promise<SocialMediaProfile>
  findSocialProfiles(companyName: string): Promise<SocialMediaProfile[]>
}

// Main email discovery service interface
export interface IEmailDiscoveryService {
  discoverEmails(params: EmailDiscoveryParams): Promise<EmailDiscoveryResult>
  discoverFromJobPost(jobUrl: string, companyName: string): Promise<EmailDiscoveryResult>
  discoverFromCompany(companyName: string, companyWebsite?: string): Promise<EmailDiscoveryResult>
  validateEmailList(emails: string[]): Promise<EmailValidationResult[]>
}

export interface EmailDiscoveryParams {
  companyName: string
  companyWebsite?: string
  jobUrl?: string
  jobTitle?: string
  linkedinUrl?: string
  additionalUrls?: string[]
  methods?: ('website' | 'whois' | 'social' | 'contact_pages')[]
}

// Common email patterns and validation
export interface EmailPattern {
  pattern: RegExp
  description: string
  confidence: number
}

export interface CompanyEmailPattern {
  domain: string
  commonPatterns: string[]
  examples: string[]
}

// Event types for monitoring
export interface EmailDiscoveryEvent {
  type: 'start' | 'progress' | 'success' | 'error' | 'complete'
  message: string
  data?: any
  timestamp: Date
}

export type EmailDiscoveryEventHandler = (event: EmailDiscoveryEvent) => void

// Rate limiting interface
export interface IRateLimiter {
  canMakeRequest(): boolean
  makeRequest(): Promise<void>
  getRemainingRequests(): number
  getResetTime(): Date
} 