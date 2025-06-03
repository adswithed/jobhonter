// Feature Flag System
// Controls which features are available in open source vs SaaS versions

export interface FeatureFlags {
  // Core Features (Always Available)
  jobDiscovery: boolean;
  emailExtraction: boolean;
  emailSending: boolean;
  basicAnalytics: boolean;
  userAuth: boolean;
  
  // SaaS Premium Features
  aiGeneration: boolean;
  advancedAnalytics: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
  whiteLabel: boolean;
  
  // Scraper Sources
  twitterScraping: boolean;
  redditScraping: boolean;
  linkedinScraping: boolean;
  googleJobsScraping: boolean;
  
  // Email Providers
  smtpEmail: boolean;
  sendgridEmail: boolean;
  mailgunEmail: boolean;
  resendEmail: boolean;
}

export type Edition = 'open-source' | 'saas-pro' | 'saas-enterprise';

// Feature configurations for different editions
export const FEATURE_CONFIGS: Record<Edition, FeatureFlags> = {
  'open-source': {
    // Core Features - Available
    jobDiscovery: true,
    emailExtraction: true,
    emailSending: true,
    basicAnalytics: true,
    userAuth: true,
    
    // SaaS Features - Disabled
    aiGeneration: false,
    advancedAnalytics: false,
    teamCollaboration: false,
    prioritySupport: false,
    customIntegrations: false,
    whiteLabel: false,
    
    // Scraper Sources - Basic set
    twitterScraping: true,
    redditScraping: true,
    linkedinScraping: false, // Premium feature
    googleJobsScraping: true,
    
    // Email Providers - Basic set
    smtpEmail: true,
    sendgridEmail: true,
    mailgunEmail: false, // Premium
    resendEmail: false,  // Premium
  },
  
  'saas-pro': {
    // All core features
    jobDiscovery: true,
    emailExtraction: true,
    emailSending: true,
    basicAnalytics: true,
    userAuth: true,
    
    // Most SaaS features
    aiGeneration: true,
    advancedAnalytics: true,
    teamCollaboration: true,
    prioritySupport: true,
    customIntegrations: false, // Enterprise only
    whiteLabel: false,         // Enterprise only
    
    // All scraper sources
    twitterScraping: true,
    redditScraping: true,
    linkedinScraping: true,
    googleJobsScraping: true,
    
    // All email providers
    smtpEmail: true,
    sendgridEmail: true,
    mailgunEmail: true,
    resendEmail: true,
  },
  
  'saas-enterprise': {
    // Everything enabled
    jobDiscovery: true,
    emailExtraction: true,
    emailSending: true,
    basicAnalytics: true,
    userAuth: true,
    aiGeneration: true,
    advancedAnalytics: true,
    teamCollaboration: true,
    prioritySupport: true,
    customIntegrations: true,
    whiteLabel: true,
    twitterScraping: true,
    redditScraping: true,
    linkedinScraping: true,
    googleJobsScraping: true,
    smtpEmail: true,
    sendgridEmail: true,
    mailgunEmail: true,
    resendEmail: true,
  },
};

// Environment-based feature detection
export function detectEdition(): Edition {
  // Check environment variables
  const saasMode = process.env.SAAS_MODE;
  const edition = process.env.JOBHONTER_EDITION as Edition;
  
  // If explicitly set, use that
  if (edition && FEATURE_CONFIGS[edition]) {
    return edition;
  }
  
  // Auto-detect based on environment
  if (saasMode === 'true' || saasMode === '1') {
    return 'saas-pro';
  }
  
  // Check if AI package is available (indicates SaaS setup)
  try {
    require('@jobhonter/ai-agent');
    return 'saas-pro';
  } catch (error) {
    // AI package not available, running open source
    return 'open-source';
  }
}

// Get current feature flags
export function getFeatureFlags(): FeatureFlags {
  const edition = detectEdition();
  return FEATURE_CONFIGS[edition];
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

// Get current edition info
export function getEditionInfo() {
  const edition = detectEdition();
  const flags = getFeatureFlags();
  
  return {
    edition,
    isOpenSource: edition === 'open-source',
    isSaaS: edition.startsWith('saas'),
    isPro: edition === 'saas-pro',
    isEnterprise: edition === 'saas-enterprise',
    features: flags,
  };
}

// Feature limits for different editions
export const FEATURE_LIMITS = {
  'open-source': {
    maxApplicationsPerDay: 50,
    maxJobSources: 3,
    maxEmailTemplates: 5,
    maxUsers: 1,
    retentionDays: 30,
  },
  'saas-pro': {
    maxApplicationsPerDay: 500,
    maxJobSources: 10,
    maxEmailTemplates: 50,
    maxUsers: 10,
    retentionDays: 365,
  },
  'saas-enterprise': {
    maxApplicationsPerDay: -1, // Unlimited
    maxJobSources: -1,
    maxEmailTemplates: -1,
    maxUsers: -1,
    retentionDays: -1,
  },
};

export function getFeatureLimits() {
  const edition = detectEdition();
  return FEATURE_LIMITS[edition];
} 