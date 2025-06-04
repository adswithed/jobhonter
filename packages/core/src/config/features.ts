/**
 * Feature Flag System for Open Source vs SaaS Edition
 * 
 * This system allows the same codebase to support both:
 * - Open Source: Self-hosted with core features
 * - SaaS: Hosted with premium features and billing
 */

export interface FeatureConfig {
  // Core Features (Available in both editions)
  jobScraping: boolean
  emailDiscovery: boolean
  basicEmailSending: boolean
  jobTracking: boolean
  simpleAnalytics: boolean
  
  // Premium Features (SaaS only)
  aiPersonalization: boolean
  advancedAnalytics: boolean
  premiumSupport: boolean
  bulkOperations: boolean
  customIntegrations: boolean
  teamCollaboration: boolean
  whiteLabeling: boolean
  
  // Billing & Subscription (SaaS only)
  billing: boolean
  subscriptionManagement: boolean
  usageLimits: boolean
  
  // Enterprise Features (SaaS only)
  ssoAuthentication: boolean
  auditLogs: boolean
  complianceReporting: boolean
  dedicatedSupport: boolean
}

export const OPEN_SOURCE_FEATURES: FeatureConfig = {
  // Core Features
  jobScraping: true,
  emailDiscovery: true,
  basicEmailSending: true,
  jobTracking: true,
  simpleAnalytics: true,
  
  // Premium Features (disabled)
  aiPersonalization: false,
  advancedAnalytics: false,
  premiumSupport: false,
  bulkOperations: false,
  customIntegrations: false,
  teamCollaboration: false,
  whiteLabeling: false,
  
  // Billing & Subscription (disabled)
  billing: false,
  subscriptionManagement: false,
  usageLimits: false,
  
  // Enterprise Features (disabled)
  ssoAuthentication: false,
  auditLogs: false,
  complianceReporting: false,
  dedicatedSupport: false,
}

export const SAAS_FEATURES: FeatureConfig = {
  // Core Features
  jobScraping: true,
  emailDiscovery: true,
  basicEmailSending: true,
  jobTracking: true,
  simpleAnalytics: true,
  
  // Premium Features (enabled)
  aiPersonalization: true,
  advancedAnalytics: true,
  premiumSupport: true,
  bulkOperations: true,
  customIntegrations: true,
  teamCollaboration: true,
  whiteLabeling: true,
  
  // Billing & Subscription (enabled)
  billing: true,
  subscriptionManagement: true,
  usageLimits: true,
  
  // Enterprise Features (enabled)
  ssoAuthentication: true,
  auditLogs: true,
  complianceReporting: true,
  dedicatedSupport: true,
}

/**
 * Feature Limits for Different Editions
 */
export interface FeatureLimits {
  maxJobsPerDay: number
  maxApplicationsPerDay: number
  maxEmailTemplates: number
  maxJobSources: number
  maxUsers: number
  apiRateLimit: number
}

export const OPEN_SOURCE_LIMITS: FeatureLimits = {
  maxJobsPerDay: 100,
  maxApplicationsPerDay: 50,
  maxEmailTemplates: 5,
  maxJobSources: 3,
  maxUsers: 1,
  apiRateLimit: 1000, // requests per hour
}

export const SAAS_LIMITS: FeatureLimits = {
  maxJobsPerDay: 1000,
  maxApplicationsPerDay: 500,
  maxEmailTemplates: 50,
  maxJobSources: 10,
  maxUsers: 10,
  apiRateLimit: 10000, // requests per hour
}

/**
 * Determine Edition Type
 */
export type EditionType = 'opensource' | 'saas'

export function getEditionType(): EditionType {
  // Check for Node.js environment
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
    const env = (globalThis as any).process.env
    const edition = env.EDITION_TYPE || env.NEXT_PUBLIC_EDITION_TYPE
    return edition === 'saas' ? 'saas' : 'opensource'
  }
  
  // Browser environment - check for build-time configuration
  if (typeof window !== 'undefined') {
    // @ts-ignore - This will be replaced at build time
    return (globalThis as any).__EDITION_TYPE__ || 'opensource'
  }
  
  return 'opensource'
}

/**
 * Get Current Feature Configuration
 */
export function getFeatures(): FeatureConfig {
  const edition = getEditionType()
  return edition === 'saas' ? SAAS_FEATURES : OPEN_SOURCE_FEATURES
}

/**
 * Get Current Feature Limits
 */
export function getLimits(): FeatureLimits {
  const edition = getEditionType()
  return edition === 'saas' ? SAAS_LIMITS : OPEN_SOURCE_LIMITS
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureConfig): boolean {
  const features = getFeatures()
  return features[feature]
}

/**
 * Check if user has reached a limit
 */
export function hasReachedLimit(
  limitType: keyof FeatureLimits,
  currentValue: number
): boolean {
  const limits = getLimits()
  return currentValue >= limits[limitType]
}

/**
 * Get remaining quota for a limit
 */
export function getRemainingQuota(
  limitType: keyof FeatureLimits,
  currentValue: number
): number {
  const limits = getLimits()
  return Math.max(0, limits[limitType] - currentValue)
}

/**
 * Feature Guard Hook for React Components
 */
export function useFeatureGuard(feature: keyof FeatureConfig) {
  const isEnabled = isFeatureEnabled(feature)
  const edition = getEditionType()
  
  return {
    isEnabled,
    edition,
    requiresUpgrade: !isEnabled && edition === 'opensource',
  }
}

/**
 * Conditional Feature Rendering
 */
export interface FeatureGateProps {
  feature: keyof FeatureConfig
  children: any // Using any instead of React.ReactNode to avoid React dependency
  fallback?: any
}

// Note: This would be implemented as a React component in the frontend package 