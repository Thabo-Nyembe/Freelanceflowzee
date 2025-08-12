import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser, ExtendedUser } from '@/lib/auth';

/**
 * Rate limit strategies
 */
export enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
}

/**
 * Rate limit tiers based on subscription level
 */
export interface RateLimitTier {
  requests: number;
  duration: number; // in seconds
  strategy: RateLimitStrategy;
}

/**
 * Rate limit configuration by subscription tier
 */
export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  free: {
    requests: 20,
    duration: 60, // 20 requests per minute
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },
  pro: {
    requests: 100,
    duration: 60, // 100 requests per minute
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },
  enterprise: {
    requests: 500,
    duration: 60, // 500 requests per minute
    strategy: RateLimitStrategy.TOKEN_BUCKET,
  },
  // Special tiers for specific API endpoints
  ai_free: {
    requests: 5,
    duration: 60, // 5 AI requests per minute for free tier
    strategy: RateLimitStrategy.FIXED_WINDOW,
  },
  ai_pro: {
    requests: 30,
    duration: 60, // 30 AI requests per minute for pro tier
    strategy: RateLimitStrategy.SLIDING_WINDOW,
  },
  ai_enterprise: {
    requests: 100,
    duration: 60, // 100 AI requests per minute for enterprise tier
    strategy: RateLimitStrategy.TOKEN_BUCKET,
  },
};

// Initialize Redis client
let redis: Redis;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

// Cache for rate limiters to avoid recreating them for each request
const rateLimiterCache = new Map<string, Ratelimit>();

/**
 * Creates a rate limiter based on the specified strategy and configuration
 */
function createRateLimiter(
  prefix: string,
  tier: RateLimitTier
): Ratelimit {
  // Check if we already have this rate limiter cached
  const cacheKey = `${prefix}:${tier.requests}:${tier.duration}:${tier.strategy}`;
  
  if (rateLimiterCache.has(cacheKey)) {
    return rateLimiterCache.get(cacheKey)!;
  }
  
  let rateLimiter: Ratelimit;
  
  switch (tier.strategy) {
    case RateLimitStrategy.FIXED_WINDOW:
      rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(tier.requests, `${tier.duration}s`),
        analytics: true,
        prefix: `${prefix}:fixed`,
      });
      break;
      
    case RateLimitStrategy.TOKEN_BUCKET:
      rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.tokenBucket(tier.requests, `${tier.duration}s`, tier.requests),
        analytics: true,
        prefix: `${prefix}:token`,
      });
      break;
      
    case RateLimitStrategy.SLIDING_WINDOW:
    default:
      rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tier.requests, `${tier.duration}s`),
        analytics: true,
        prefix: `${prefix}:sliding`,
      });
  }
  
  // Cache the rate limiter
  rateLimiterCache.set(cacheKey, rateLimiter);
  
  return rateLimiter;
}

/**
 * Gets the appropriate rate limit tier based on user subscription
 */
function getRateLimitTier(
  user: ExtendedUser | null,
  endpoint: string
): RateLimitTier {
  // If no user, use the free tier
  if (!user) {
    return RATE_LIMIT_TIERS.free;
  }
  
  const subscriptionTier = user.subscriptionTier || 'free';
  
  // Check for endpoint-specific tiers first
  if (endpoint.startsWith('/api/ai') || endpoint.includes('ai-')) {
    const aiTier = `ai_${subscriptionTier}` as keyof typeof RATE_LIMIT_TIERS;
    return RATE_LIMIT_TIERS[aiTier] || RATE_LIMIT_TIERS.ai_free;
  }
  
  // Use general tier based on subscription
  return RATE_LIMIT_TIERS[subscriptionTier] || RATE_LIMIT_TIERS.free;
}

/**
 * Gets the client identifier for rate limiting
 * Uses user ID if authenticated, otherwise IP address
 */
function getClientIdentifier(req: NextApiRequest, user: ExtendedUser | null): string {
  if (user?.id) {
    return `user:${user.id}`;
  }
  
  // Get IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.socket.remoteAddress || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Checks if a request is within rate limits
 * Returns the result of the rate limit check
 */
export async function checkRateLimit(
  req: NextApiRequest,
  endpoint: string = 'default'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  user: ExtendedUser | null;
}> {
  // If Redis is not initialized, allow all requests
  if (!redis) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
      user: null,
    };
  }
  
  try {
    // Get current user if authenticated
    const user = await getCurrentUser(req, {} as NextApiResponse);
    
    // Get appropriate rate limit tier
    const tier = getRateLimitTier(user, endpoint);
    
    // Get client identifier
    const identifier = getClientIdentifier(req, user);
    
    // Create rate limiter
    const rateLimiter = createRateLimiter(`ratelimit:${endpoint}`, tier);
    
    // Check rate limit
    const result = await rateLimiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      user,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // In case of error, allow the request
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
      user: null,
    };
  }
}

/**
 * Middleware to apply rate limiting to API routes
 */
export async function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  endpoint: string = 'default'
): Promise<boolean> {
  const result = await checkRateLimit(req, endpoint);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.reset);
  
  if (!result.success) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    });
    return false;
  }
  
  return true;
}

/**
 * Higher-order function to create a rate-limited API handler
 */
export function createRateLimitedHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  endpoint: string = 'default'
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const canProceed = await withRateLimit(req, res, endpoint);
    
    if (canProceed) {
      return handler(req, res);
    }
  };
}

/**
 * Get rate limit status for a specific user or IP
 * Useful for displaying limit information in the UI
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string = 'default',
  tier: RateLimitTier = RATE_LIMIT_TIERS.free
): Promise<{
  limit: number;
  remaining: number;
  reset: number;
  percent: number;
}> {
  if (!redis) {
    return {
      limit: tier.requests,
      remaining: tier.requests,
      reset: Date.now() + tier.duration * 1000,
      percent: 0,
    };
  }
  
  try {
    const rateLimiter = createRateLimiter(`ratelimit:${endpoint}`, tier);
    const result = await rateLimiter.limit(identifier);
    
    return {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      percent: ((result.limit - result.remaining) / result.limit) * 100,
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    
    return {
      limit: tier.requests,
      remaining: tier.requests,
      reset: Date.now() + tier.duration * 1000,
      percent: 0,
    };
  }
}

/**
 * Clear rate limit for a specific user or IP
 * Useful for administrative purposes
 */
export async function clearRateLimit(
  identifier: string,
  endpoint: string = 'default',
  tier: RateLimitTier = RATE_LIMIT_TIERS.free
): Promise<boolean> {
  if (!redis) {
    return false;
  }
  
  try {
    const prefixes = [
      `ratelimit:${endpoint}:fixed:${identifier}`,
      `ratelimit:${endpoint}:sliding:${identifier}`,
      `ratelimit:${endpoint}:token:${identifier}`,
    ];
    
    // Delete all possible keys for this identifier
    for (const prefix of prefixes) {
      await redis.del(prefix);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear rate limit:', error);
    return false;
  }
}

/**
 * Default export for convenience
 */
export default {
  checkRateLimit,
  withRateLimit,
  createRateLimitedHandler,
  getRateLimitStatus,
  clearRateLimit,
  RATE_LIMIT_TIERS,
};
