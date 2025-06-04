// Scraper Package
// This package will handle job scraping from various platforms

// Placeholder exports for future implementation
export const SCRAPER_VERSION = '0.1.0';

// TODO: Implement scraper functionality
export const placeholder = true;

// Core types and interfaces
export * from './types';

// Base scraper class
export { BaseScraper } from './base/BaseScraper';

// Utility classes
export { RateLimiter } from './utils/RateLimiter';
export { createLogger } from './utils/Logger';

// Platform-specific scrapers
export { TwitterScraper } from './scrapers/TwitterScraper';

// Scraper manager (to be implemented)
// export { ScraperManager } from './manager/ScraperManager';

// Re-export common types for convenience
export type {
  IScraper,
  ScraperConfig,
  SearchParams,
  ScraperResult,
  ScraperStatus,
  Job,
  JobType,
  JobSource,
  Platform
} from './types'; 