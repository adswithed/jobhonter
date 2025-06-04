// Email Discovery Package - Main Entry Point
// Advanced email extraction and discovery for JobHonter

// Type exports
export * from './types'

// Utilities
export { EmailExtractor } from './utils/EmailExtractor'
export { RateLimiter } from './utils/RateLimiter'

// Parsers
export { WebsiteParser } from './parsers/WebsiteParser'

// Main service
export { EmailDiscoveryService } from './services/EmailDiscoveryService'

// Default configuration
export const DEFAULT_EMAIL_DISCOVERY_CONFIG = {
  maxRequestsPerMinute: 30,
  requestDelay: 2000,
  requestTimeout: 10000,
  enableEmailValidation: true,
  enableDisposableEmailCheck: true,
  enableWebsiteParsing: true,
  enableWhoisLookup: false,
  enableSocialMediaParsing: false,
  userAgent: 'JobHonter/1.0 (Email Discovery Bot)',
  randomizeUserAgent: false
}

// Version
export const EMAIL_DISCOVERY_VERSION = '1.0.0'

// Factory function for creating email discovery service
export function createEmailDiscoveryService(config?: any) {
  // Import here to avoid circular dependency
  const { EmailDiscoveryService } = require('./services/EmailDiscoveryService')
  return new EmailDiscoveryService(config)
}

// Quick discovery function for simple use cases
export async function quickDiscoverEmails(companyName: string, companyWebsite?: string) {
  // Import here to avoid circular dependency
  const { EmailDiscoveryService } = require('./services/EmailDiscoveryService')
  const service = new EmailDiscoveryService()
  return service.discoverFromCompany(companyName, companyWebsite)
} 