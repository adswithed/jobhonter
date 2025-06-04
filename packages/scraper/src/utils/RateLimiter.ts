import { RateLimiterMemory } from 'rate-limiter-flexible';
import { IRateLimiter } from '../types';

export class RateLimiter implements IRateLimiter {
  private limiter: RateLimiterMemory;

  constructor(config: { requests: number; period: number }) {
    this.limiter = new RateLimiterMemory({
      points: config.requests, // Number of requests
      duration: Math.ceil(config.period / 1000), // Convert ms to seconds
    });
  }

  async consume(key: string, points: number = 1): Promise<void> {
    try {
      await this.limiter.consume(key, points);
    } catch (rejRes: any) {
      // Convert rejection to a regular error with proper message
      const msBeforeNext = rejRes.msBeforeNext || 0;
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(msBeforeNext / 1000)} seconds.`);
    }
  }

  async reset(key: string): Promise<void> {
    await this.limiter.delete(key);
  }

  async getStatus(key: string): Promise<{
    remainingPoints: number;
    msBeforeNext: number;
    totalHits: number;
  }> {
    const resRateLimiter = await this.limiter.get(key);
    if (!resRateLimiter) {
      return {
        remainingPoints: this.limiter.points,
        msBeforeNext: 0,
        totalHits: 0,
      };
    }

    return {
      remainingPoints: resRateLimiter.remainingPoints || 0,
      msBeforeNext: resRateLimiter.msBeforeNext || 0,
      totalHits: (resRateLimiter as any).totalHits || 0,
    };
  }
}

export default RateLimiter; 