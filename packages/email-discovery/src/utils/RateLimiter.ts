import { IRateLimiter } from '../types'

export class RateLimiter implements IRateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly delayMs: number

  constructor(maxRequestsPerMinute: number, delayMs = 1000) {
    this.maxRequests = maxRequestsPerMinute
    this.delayMs = delayMs
  }

  /**
   * Check if we can make a request without hitting rate limits
   */
  canMakeRequest(): boolean {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove old requests (older than 1 minute)
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo)

    return this.requests.length < this.maxRequests
  }

  /**
   * Wait for a slot to become available and make a request
   */
  async makeRequest(): Promise<void> {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo)

    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = (oldestRequest + 60000) - now + 100 // Add small buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    // Add delay between requests
    if (this.requests.length > 0) {
      const timeSinceLastRequest = now - Math.max(...this.requests)
      if (timeSinceLastRequest < this.delayMs) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs - timeSinceLastRequest))
      }
    }

    // Record this request
    this.requests.push(Date.now())
  }

  /**
   * Wait for a slot to become available
   */
  async waitForSlot(): Promise<void> {
    return this.makeRequest()
  }

  /**
   * Get remaining requests in current window
   */
  getRemainingRequests(): number {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo)

    return Math.max(0, this.maxRequests - this.requests.length)
  }

  /**
   * Get time when rate limit resets
   */
  getResetTime(): Date {
    if (this.requests.length === 0) {
      return new Date()
    }

    const oldestRequest = Math.min(...this.requests)
    return new Date(oldestRequest + 60000)
  }

  /**
   * Clear all recorded requests (useful for testing)
   */
  reset(): void {
    this.requests = []
  }
} 