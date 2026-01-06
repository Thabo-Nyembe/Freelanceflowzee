/**
 * Redis Cache Service
 *
 * Provides caching for AI agent sessions, tasks, and generated code.
 * Uses Upstash Redis for serverless-compatible caching.
 */

import { Redis } from '@upstash/redis';

export interface CacheConfig {
  url?: string;
  token?: string;
  defaultTTL?: number;
  prefix?: string;
}

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt?: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastReset: Date;
}

const DEFAULT_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'freeflow:';

/**
 * Redis Cache - Upstash Redis caching service
 */
export class RedisCache {
  private redis: Redis | null = null;
  private config: CacheConfig;
  private stats: CacheStats;
  private localCache: Map<string, CacheEntry<unknown>> = new Map();
  private isConnected: boolean = false;

  constructor(config: CacheConfig = {}) {
    this.config = {
      url: config.url || process.env.UPSTASH_REDIS_REST_URL,
      token: config.token || process.env.UPSTASH_REDIS_REST_TOKEN,
      defaultTTL: config.defaultTTL ?? DEFAULT_TTL,
      prefix: config.prefix ?? CACHE_PREFIX
    };

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastReset: new Date()
    };

    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    if (this.config.url && this.config.token) {
      try {
        this.redis = new Redis({
          url: this.config.url,
          token: this.config.token
        });
        this.isConnected = true;
      } catch (error) {
        console.warn('Redis connection failed, using local cache:', error);
        this.isConnected = false;
      }
    } else {
      console.warn('Redis credentials not found, using local cache');
      this.isConnected = false;
    }
  }

  /**
   * Build cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);

    try {
      if (this.redis && this.isConnected) {
        const data = await this.redis.get<CacheEntry<T>>(fullKey);
        if (data) {
          this.stats.hits++;
          // Update hit count
          await this.redis.set(fullKey, { ...data, hits: data.hits + 1 });
          return data.data;
        }
      } else {
        // Use local cache
        const entry = this.localCache.get(fullKey) as CacheEntry<T> | undefined;
        if (entry) {
          if (!entry.expiresAt || entry.expiresAt > Date.now()) {
            this.stats.hits++;
            entry.hits++;
            return entry.data;
          } else {
            this.localCache.delete(fullKey);
          }
        }
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key);
    const expiresIn = ttl ?? this.config.defaultTTL!;
    const expiresAt = Date.now() + expiresIn * 1000;

    const entry: CacheEntry<T> = {
      data: value,
      createdAt: Date.now(),
      expiresAt,
      hits: 0
    };

    try {
      if (this.redis && this.isConnected) {
        await this.redis.set(fullKey, entry, { ex: expiresIn });
      } else {
        this.localCache.set(fullKey, entry);
        this.stats.size = this.localCache.size;
      }
    } catch (error) {
      console.warn('Cache set error:', error);
      // Fallback to local cache
      this.localCache.set(fullKey, entry);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key);

    try {
      if (this.redis && this.isConnected) {
        await this.redis.del(fullKey);
      }
      this.localCache.delete(fullKey);
      this.stats.size = this.localCache.size;
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);

    try {
      if (this.redis && this.isConnected) {
        return (await this.redis.exists(fullKey)) > 0;
      }
      return this.localCache.has(fullKey);
    } catch (error) {
      return this.localCache.has(fullKey);
    }
  }

  /**
   * Get or set with callback
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate keys by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const fullPattern = this.buildKey(pattern);
    let count = 0;

    try {
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          count = keys.length;
        }
      }

      // Also clear from local cache
      for (const key of this.localCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.localCache.delete(key);
          count++;
        }
      }
    } catch (error) {
      console.warn('Cache invalidate error:', error);
    }

    return count;
  }

  // Session caching helpers
  async cacheSession(sessionId: string, data: unknown, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return this.get<T>(`session:${sessionId}`);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.invalidatePattern(`session:${sessionId}*`);
  }

  // Task caching helpers
  async cacheTask(taskId: string, data: unknown, ttl: number = 1800): Promise<void> {
    await this.set(`task:${taskId}`, data, ttl);
  }

  async getTask<T>(taskId: string): Promise<T | null> {
    return this.get<T>(`task:${taskId}`);
  }

  // Generated file caching
  async cacheGeneratedFile(taskId: string, filePath: string, content: string, ttl: number = 7200): Promise<void> {
    await this.set(`file:${taskId}:${filePath}`, content, ttl);
  }

  async getGeneratedFile(taskId: string, filePath: string): Promise<string | null> {
    return this.get<string>(`file:${taskId}:${filePath}`);
  }

  // Template caching
  async cacheTemplate(templateId: string, data: unknown, ttl: number = 86400): Promise<void> {
    await this.set(`template:${templateId}`, data, ttl);
  }

  async getTemplate<T>(templateId: string): Promise<T | null> {
    return this.get<T>(`template:${templateId}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.localCache.size,
      lastReset: new Date()
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(`${this.config.prefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      this.localCache.clear();
      this.stats.size = 0;
    } catch (error) {
      console.warn('Cache clear error:', error);
      this.localCache.clear();
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * Create Redis cache instance
 */
let cacheInstance: RedisCache | null = null;

export function getRedisCache(config?: CacheConfig): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache(config);
  }
  return cacheInstance;
}

export function createRedisCache(config?: CacheConfig): RedisCache {
  return new RedisCache(config);
}

export default RedisCache;
