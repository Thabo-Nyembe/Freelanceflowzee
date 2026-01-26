import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { geolocation } from '@vercel/edge';
/**
 * Axiom logging is disabled by default to reduce costs.
 * To enable Axiom logging:
 * 1. Install next-axiom: npm install next-axiom
 * 2. Add AXIOM_TOKEN to environment variables
 * 3. Uncomment the import below and wrap middleware with withAxiom
 * See: https://axiom.co/docs/apps/next
 */
// import { withAxiom } from 'next-axiom';
import { nanoid } from 'nanoid';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('Middleware');

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Cache strategy types
 */
type CacheStrategy = 'no-cache' | 'force-cache' | 'edge-cache' | 'cdn-cache' | 'stale-while-revalidate';

/**
 * Cache configuration for different routes
 */
interface CacheConfig {
  strategy: CacheStrategy;
  maxAge?: number; // in seconds
  staleWhileRevalidate?: number; // in seconds
  tags?: string[]; // cache tags for invalidation
}

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  limit: number; // requests per window
  window: number; // window size in seconds
  burstLimit?: number; // allowed burst
  burstWindow?: number; // burst window in seconds
  keyGenerator?: (req: NextRequest) => string; // function to generate rate limit key
}

/**
 * Geographic routing configuration
 */
interface GeoRoutingConfig {
  defaultRegion: string;
  regions: Record<string, string>; // mapping of region codes to URLs
  countryOverrides?: Record<string, string>; // country-specific overrides
}

/**
 * A/B testing configuration
 */
interface ABTestConfig {
  testId: string;
  variants: string[];
  weights: number[]; // percentage weights for each variant
  cookieName?: string;
  cookieMaxAge?: number; // in seconds
  sticky?: boolean; // whether to keep the same variant for a user
}

/**
 * Performance metrics to collect
 */
interface PerformanceMetrics {
  ttfb?: number; // Time to First Byte
  responseTime?: number; // Total response time
  processingTime?: number; // Server processing time
  coldStart?: boolean; // Whether this was a cold start
  region?: string; // Deployment region
  cache?: {
    hit: boolean;
    type?: string;
  };
}

/**
 * Security headers configuration
 */
interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | boolean;
  xFrameOptions?: string | boolean;
  xContentTypeOptions?: string | boolean;
  referrerPolicy?: string | boolean;
  permissionsPolicy?: string | boolean;
  strictTransportSecurity?: string | boolean;
  xXssProtection?: string | boolean;
}

/**
 * Middleware configuration
 */
interface MiddlewareConfig {
  cache?: Record<string, CacheConfig>;
  rateLimit?: Record<string, RateLimitConfig>;
  geoRouting?: GeoRoutingConfig;
  abTests?: ABTestConfig[];
  security?: SecurityHeadersConfig;
  compression?: boolean;
  metrics?: boolean;
  debug?: boolean;
}

/**
 * Request context with additional metadata
 */
interface RequestContext {
  req: NextRequest;
  event: NextFetchEvent;
  startTime: number;
  requestId: string;
  geo?: ReturnType<typeof geolocation>;
  metrics: PerformanceMetrics;
  matched?: {
    pattern: string;
    params: Record<string, string>;
  };
}

// ==========================================================
// CONFIGURATION
// ==========================================================

/**
 * Default cache configurations for different content types
 */
const DEFAULT_CACHE_CONFIGS: Record<string, CacheConfig> = {
  static: {
    strategy: 'cdn-cache',
    maxAge: 31536000, // 1 year
    tags: ['static'],
  },
  api: {
    strategy: 'no-cache',
  },
  dynamic: {
    strategy: 'no-cache',
  },
  ssr: {
    strategy: 'edge-cache',
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 600, // 10 minutes
    tags: ['ssr'],
  },
  dashboard: {
    strategy: 'no-cache',
  },
  marketing: {
    strategy: 'edge-cache',
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
    tags: ['marketing'],
  },
};

/**
 * Default rate limiting configurations
 */
const DEFAULT_RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  api: {
    limit: 100,
    window: 60, // 1 minute
    burstLimit: 20,
    burstWindow: 1, // 1 second
  },
  auth: {
    limit: 10,
    window: 60, // 1 minute
    burstLimit: 3,
    burstWindow: 1, // 1 second
  },
  webhooks: {
    limit: 60,
    window: 60, // 1 minute
    burstLimit: 10,
    burstWindow: 1, // 1 second
  },
};

/**
 * Default security headers
 */
const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.vercel.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.vercel.app; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.vercel-analytics.com https://*.vercel.app; frame-src 'self' https://*.stripe.com; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none';",
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xXssProtection: '1; mode=block',
};

/**
 * Default middleware configuration
 */
const DEFAULT_CONFIG: MiddlewareConfig = {
  cache: DEFAULT_CACHE_CONFIGS,
  rateLimit: DEFAULT_RATE_LIMIT_CONFIGS,
  security: DEFAULT_SECURITY_HEADERS,
  compression: true,
  metrics: true,
  debug: process.env.NODE_ENV !== 'production',
};

// ==========================================================
// IN-MEMORY STORES
// ==========================================================

/**
 * In-memory rate limiting store
 * Note: In a production environment with multiple instances,
 * this should be replaced with a distributed store like Redis
 */
class RateLimitStore {
  private store: Map<string, { count: number, timestamp: number, bursts: number[] }> = new Map();
  
  /**
   * Increment request count for a key
   */
  increment(key: string, now = Date.now()): { limited: boolean, remaining: number, reset: number } {
    const entry = this.store.get(key) || { count: 0, timestamp: now, bursts: [] };
    
    // Increment count
    entry.count++;
    
    // Record burst
    entry.bursts.push(now);
    
    // Clean up old bursts (older than burst window)
    const burstWindow = DEFAULT_RATE_LIMIT_CONFIGS.api.burstWindow || 1;
    entry.bursts = entry.bursts.filter(t => now - t < burstWindow * 1000);
    
    // Update store
    this.store.set(key, entry);
    
    // Calculate rate limit info
    const config = DEFAULT_RATE_LIMIT_CONFIGS.api;
    const windowMs = config.window * 1000;
    const reset = entry.timestamp + windowMs;
    const remaining = Math.max(0, config.limit - entry.count);
    const burstCount = entry.bursts.length;
    const limited = entry.count > config.limit || burstCount > (config.burstLimit || config.limit);
    
    // Reset counter if window has passed
    if (now > reset) {
      this.store.set(key, { count: 1, timestamp: now, bursts: [now] });
      return { limited: false, remaining: config.limit - 1, reset: now + windowMs };
    }
    
    return { limited, remaining, reset };
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(now = Date.now()): void {
    for (const [key, entry] of this.store.entries()) {
      const windowMs = DEFAULT_RATE_LIMIT_CONFIGS.api.window * 1000;
      if (now > entry.timestamp + windowMs) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

/**
 * In-memory cold start detection
 */
let isFirstRequest = true;
const serverStartTime = Date.now();

// Schedule periodic cleanup of rate limit store
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rateLimitStore.cleanup();
  }, 60000); // Clean up every minute
}

// ==========================================================
// MIDDLEWARE HELPERS
// ==========================================================

/**
 * Apply cache headers based on strategy
 */
function applyCacheHeaders(res: NextResponse, config: CacheConfig): NextResponse {
  const { strategy, maxAge = 0, staleWhileRevalidate = 0, tags = [] } = config;
  
  switch (strategy) {
    case 'no-cache':
      res.headers.set('Cache-Control', 'no-store, must-revalidate');
      break;
      
    case 'force-cache':
      res.headers.set('Cache-Control', `public, max-age=${maxAge}`);
      break;
      
    case 'edge-cache':
      res.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
      break;
      
    case 'cdn-cache':
      res.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, immutable`);
      break;
      
    case 'stale-while-revalidate':
      res.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
      break;
  }
  
  // Add cache tags for invalidation
  if (tags.length > 0) {
    res.headers.set('Cache-Tag', tags.join(', '));
  }
  
  return res;
}

/**
 * Apply security headers
 */
function applySecurityHeaders(res: NextResponse, config: SecurityHeadersConfig): NextResponse {
  if (config.contentSecurityPolicy) {
    res.headers.set('Content-Security-Policy', config.contentSecurityPolicy as string);
  }
  
  if (config.xFrameOptions) {
    res.headers.set('X-Frame-Options', config.xFrameOptions as string);
  }
  
  if (config.xContentTypeOptions) {
    res.headers.set('X-Content-Type-Options', config.xContentTypeOptions as string);
  }
  
  if (config.referrerPolicy) {
    res.headers.set('Referrer-Policy', config.referrerPolicy as string);
  }
  
  if (config.permissionsPolicy) {
    res.headers.set('Permissions-Policy', config.permissionsPolicy as string);
  }
  
  if (config.strictTransportSecurity) {
    res.headers.set('Strict-Transport-Security', config.strictTransportSecurity as string);
  }
  
  if (config.xXssProtection) {
    res.headers.set('X-XSS-Protection', config.xXssProtection as string);
  }
  
  return res;
}

/**
 * Apply rate limiting
 */
function applyRateLimit(ctx: RequestContext, config: RateLimitConfig): { limited: boolean, headers: Record<string, string> } {
  const { req } = ctx;
  
  // Generate rate limit key (default: IP address)
  const key = config.keyGenerator 
    ? config.keyGenerator(req) 
    : `ratelimit:${req.ip || 'unknown'}:${req.nextUrl.pathname}`;
  
  // Check rate limit
  const result = rateLimitStore.increment(key);
  
  // Set rate limit headers
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
  
  return {
    limited: result.limited,
    headers,
  };
}

/**
 * Get cache configuration for a request
 */
function getCacheConfig(ctx: RequestContext, config: MiddlewareConfig): CacheConfig {
  const { req } = ctx;
  const path = req.nextUrl.pathname;
  
  // Check for specific path matches in config
  if (config.cache) {
    for (const [pattern, cacheConfig] of Object.entries(config.cache)) {
      if (pathMatches(path, pattern)) {
        return cacheConfig;
      }
    }
  }
  
  // Default cache configs based on path patterns
  if (path.startsWith('/api/')) {
    return DEFAULT_CACHE_CONFIGS.api;
  } else if (path.startsWith('/dashboard/')) {
    return DEFAULT_CACHE_CONFIGS.dashboard;
  } else if (path.startsWith('/_next/') || path.includes('.')) {
    return DEFAULT_CACHE_CONFIGS.static;
  } else if (path === '/' || path.startsWith('/pricing') || path.startsWith('/about')) {
    return DEFAULT_CACHE_CONFIGS.marketing;
  }
  
  // Default to no cache for unmatched paths
  return DEFAULT_CACHE_CONFIGS.dynamic;
}

/**
 * Get rate limit configuration for a request
 */
function getRateLimitConfig(ctx: RequestContext, config: MiddlewareConfig): RateLimitConfig | null {
  const { req } = ctx;
  const path = req.nextUrl.pathname;
  
  // Check for specific path matches in config
  if (config.rateLimit) {
    for (const [pattern, rateLimitConfig] of Object.entries(config.rateLimit)) {
      if (pathMatches(path, pattern)) {
        return rateLimitConfig;
      }
    }
  }
  
  // Default rate limit configs based on path patterns
  if (path.startsWith('/api/')) {
    return DEFAULT_RATE_LIMIT_CONFIGS.api;
  } else if (path.startsWith('/auth/')) {
    return DEFAULT_RATE_LIMIT_CONFIGS.auth;
  } else if (path.startsWith('/api/webhooks/')) {
    return DEFAULT_RATE_LIMIT_CONFIGS.webhooks;
  }
  
  // No rate limiting for other paths
  return null;
}

/**
 * Check if a path matches a pattern
 */
function pathMatches(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) {
    return true;
  }
  
  // Prefix match with wildcard
  if (pattern.endsWith('*') && path.startsWith(pattern.slice(0, -1))) {
    return true;
  }
  
  // Regex match
  if (pattern.startsWith('^') && pattern.endsWith('$')) {
    try {
      const regex = new RegExp(pattern);
      return regex.test(path);
    } catch (e) {
      logger.error('Invalid regex pattern', {
        error: e instanceof Error ? e.message : 'Unknown error',
        pattern
      });
      return false;
    }
  }
  
  return false;
}

/**
 * Apply A/B test and get the variant
 */
function getABTestVariant(ctx: RequestContext, test: ABTestConfig): string {
  const { req } = ctx;
  
  // Cookie name for this test
  const cookieName = test.cookieName || `kazi_abtest_${test.testId}`;
  
  // Check if user already has a variant assigned
  const existingVariant = req.cookies.get(cookieName)?.value;
  if (existingVariant && test.variants.includes(existingVariant)) {
    return existingVariant;
  }
  
  // Assign a new variant based on weights
  const randomValue = Math.random() * 100;
  let cumulativeWeight = 0;
  
  for (let i = 0; i < test.variants.length; i++) {
    cumulativeWeight += test.weights[i];
    if (randomValue <= cumulativeWeight) {
      return test.variants[i];
    }
  }
  
  // Fallback to first variant
  return test.variants[0];
}

/**
 * Apply geographic routing
 */
function applyGeoRouting(ctx: RequestContext, config: GeoRoutingConfig): string | null {
  const { geo } = ctx;
  
  if (!geo) {
    return null;
  }
  
  const country = geo.country?.code;
  const region = geo.region?.code;
  
  // Check for country-specific override
  if (country && config.countryOverrides && config.countryOverrides[country]) {
    return config.countryOverrides[country];
  }
  
  // Check for region-specific URL
  if (region && config.regions[region]) {
    return config.regions[region];
  }
  
  // Return default region URL
  return config.regions[config.defaultRegion] || null;
}

/**
 * Collect and report performance metrics
 */
function collectMetrics(ctx: RequestContext, res: NextResponse): void {
  const { startTime, requestId, req, metrics } = ctx;
  const endTime = Date.now();
  
  // Calculate response time
  metrics.responseTime = endTime - startTime;
  
  // Add request ID to response headers for tracking
  res.headers.set('X-Request-ID', requestId);
  
  // Add server timing headers
  const serverTiming = [
    `total;dur=${metrics.responseTime}`,
  ];
  
  if (metrics.processingTime) {
    serverTiming.push(`processing;dur=${metrics.processingTime}`);
  }
  
  if (metrics.coldStart) {
    serverTiming.push(`coldstart;desc="Cold Start"`);
  }
  
  res.headers.set('Server-Timing', serverTiming.join(', '));
  
  // Report metrics to analytics
  if (typeof ctx.event.waitUntil === 'function') {
    ctx.event.waitUntil(
      fetch('/api/analytics/edge-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          url: req.nextUrl.toString(),
          method: req.method,
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer'),
          ...metrics,
          timestamp: Date.now(),
        }),
      }).catch(err => {
        logger.error('Failed to report edge metrics', {
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
      })
    );
  }
}

// ==========================================================
// MAIN MIDDLEWARE FUNCTION
// ==========================================================

/**
 * Enhanced middleware function
 */
async function middlewareEnhanced(
  req: NextRequest,
  event: NextFetchEvent,
  config: MiddlewareConfig = DEFAULT_CONFIG
): Promise<NextResponse> {
  // Create request context
  const startTime = Date.now();
  const requestId = nanoid();
  const ctx: RequestContext = {
    req,
    event,
    startTime,
    requestId,
    metrics: {
      coldStart: isFirstRequest,
    },
  };
  
  // Reset cold start flag after first request
  if (isFirstRequest) {
    isFirstRequest = false;
    ctx.metrics.coldStart = true;
    
    // Calculate cold start time
    const coldStartTime = startTime - serverStartTime;
    ctx.metrics.processingTime = coldStartTime;
  }
  
  // Add geolocation data if available
  try {
    ctx.geo = geolocation(req);
    ctx.metrics.region = ctx.geo.region?.code;
  } catch (e) {
    // Geolocation might not be available in all environments
  }
  
  // Create default response (pass through)
  let res = NextResponse.next();
  
  // 1. Apply rate limiting
  const rateLimitConfig = getRateLimitConfig(ctx, config);
  if (rateLimitConfig) {
    const { limited, headers } = applyRateLimit(ctx, rateLimitConfig);
    
    // Add rate limit headers to response
    for (const [key, value] of Object.entries(headers)) {
      res.headers.set(key, value);
    }
    
    // Return 429 Too Many Requests if rate limited
    if (limited) {
      res = NextResponse.json(
        { error: 'Too many requests', requestId },
        { status: 429, headers: { ...Object.fromEntries(res.headers.entries()) } }
      );
      res.headers.set('Retry-After', '60');
      
      // Skip further processing
      collectMetrics(ctx, res);
      return res;
    }
  }
  
  // 2. Apply geographic routing if configured
  if (config.geoRouting && ctx.geo) {
    const geoUrl = applyGeoRouting(ctx, config.geoRouting);
    if (geoUrl && geoUrl !== req.nextUrl.toString()) {
      res = NextResponse.redirect(new URL(geoUrl));
      
      // Skip further processing
      collectMetrics(ctx, res);
      return res;
    }
  }
  
  // 3. Apply A/B testing if configured
  if (config.abTests) {
    for (const test of config.abTests) {
      const variant = getABTestVariant(ctx, test);
      
      // Set variant in cookie for consistent experience
      const cookieName = test.cookieName || `kazi_abtest_${test.testId}`;
      const cookieMaxAge = test.cookieMaxAge || 2592000; // 30 days default
      
      res.cookies.set({
        name: cookieName,
        value: variant,
        maxAge: cookieMaxAge,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      // Add variant to request headers for server components
      res.headers.set(`X-AB-Test-${test.testId}`, variant);
      
      // Rewrite URL for variant-specific content if needed
      if (test.sticky && variant !== test.variants[0]) {
        // Example: rewrite to variant-specific page or API
        // This is just an example pattern - adjust based on your needs
        if (req.nextUrl.pathname.startsWith('/api/')) {
          // For API routes, add variant as query param
          const url = new URL(req.nextUrl);
          url.searchParams.set('variant', variant);
          res = NextResponse.rewrite(url);
        }
      }
    }
  }
  
  // 4. Apply caching strategy
  const cacheConfig = getCacheConfig(ctx, config);
  res = applyCacheHeaders(res, cacheConfig);
  
  // Track cache status in metrics
  ctx.metrics.cache = {
    hit: false, // We can't know this in middleware, only in the actual handler
    type: cacheConfig.strategy,
  };
  
  // 5. Apply security headers
  if (config.security) {
    res = applySecurityHeaders(res, config.security);
  }
  
  // 6. Apply compression hint if enabled
  if (config.compression) {
    res.headers.set('X-Compression-Hint', 'enabled');
  }
  
  // 7. Add request ID header for tracing
  res.headers.set('X-Request-ID', requestId);
  
  // 8. Collect and report metrics
  collectMetrics(ctx, res);
  
  return res;
}

// ==========================================================
// EXPORT MIDDLEWARE
// ==========================================================

/**
 * Export the middleware function
 * This is the main entry point for Next.js middleware
 */
export async function middleware(req: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
  try {
    return await middlewareEnhanced(req, event);
  } catch (error) {
    logger.error('Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.nextUrl.pathname
    });

    // Return a generic response in case of error
    const res = NextResponse.next();
    res.headers.set('X-Middleware-Error', 'true');
    return res;
  }
}

/**
 * Configure which paths this middleware will run on
 */
export const config = {
  matcher: [
    // Match all paths except static files and API routes that handle their own caching
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|webp)).*)',
  ],
};

/**
 * Export the enhanced middleware for direct usage in custom middleware
 */
export { middlewareEnhanced };

/**
 * Export types and interfaces
 */
export type {
  CacheStrategy,
  CacheConfig,
  RateLimitConfig,
  GeoRoutingConfig,
  ABTestConfig,
  PerformanceMetrics,
  SecurityHeadersConfig,
  MiddlewareConfig,
  RequestContext,
};
