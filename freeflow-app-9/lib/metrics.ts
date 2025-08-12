/**
 * @file Metrics - Comprehensive metrics collection for KAZI platform
 * @version 1.0.0
 * 
 * Features:
 * - Performance metrics (response times, load times)
 * - User interaction metrics (page views, feature usage)
 * - API usage metrics (requests, errors, latency)
 * - System health metrics (memory, CPU, database connections)
 * - Custom business metrics (conversions, revenue)
 * - Integration with analytics services
 */

import { Logger } from './logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from './auth';

// Types of metrics
export enum MetricType {
  COUNTER = 'counter',    // Values that increment (e.g., request count)
  GAUGE = 'gauge',        // Values that can go up and down (e.g., memory usage)
  HISTOGRAM = 'histogram', // Distribution of values (e.g., response times)
  SUMMARY = 'summary',    // Similar to histogram but with quantiles
}

// Categories of metrics
export enum MetricCategory {
  PERFORMANCE = 'performance',
  USER = 'user',
  API = 'api',
  SYSTEM = 'system',
  BUSINESS = 'business',
  CUSTOM = 'custom',
}

// Metric data structure
export interface Metric {
  name: string;
  type: MetricType;
  category: MetricCategory;
  value: number | number[];
  timestamp: number;
  labels?: Record<string, string>;
  description?: string;
}

// Performance metric types
export enum PerformanceMetricType {
  PAGE_LOAD = 'page_load',
  API_RESPONSE = 'api_response',
  RENDER_TIME = 'render_time',
  RESOURCE_LOAD = 'resource_load',
  DATABASE_QUERY = 'database_query',
  FUNCTION_EXECUTION = 'function_execution',
}

// User interaction metric types
export enum UserMetricType {
  PAGE_VIEW = 'page_view',
  FEATURE_USAGE = 'feature_usage',
  CLICK = 'click',
  FORM_SUBMISSION = 'form_submission',
  SESSION_DURATION = 'session_duration',
  USER_JOURNEY = 'user_journey',
}

// API metric types
export enum ApiMetricType {
  REQUEST_COUNT = 'request_count',
  ERROR_COUNT = 'error_count',
  LATENCY = 'latency',
  STATUS_CODE = 'status_code',
  RATE_LIMIT = 'rate_limit',
  PAYLOAD_SIZE = 'payload_size',
}

// System health metric types
export enum SystemMetricType {
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  DISK_USAGE = 'disk_usage',
  ACTIVE_CONNECTIONS = 'active_connections',
  DATABASE_CONNECTIONS = 'database_connections',
  CACHE_HIT_RATIO = 'cache_hit_ratio',
}

// Business metric types
export enum BusinessMetricType {
  CONVERSION = 'conversion',
  REVENUE = 'revenue',
  SUBSCRIPTION = 'subscription',
  USER_ACQUISITION = 'user_acquisition',
  RETENTION = 'retention',
  CHURN = 'churn',
}

// In-memory storage for metrics
class MetricsStore {
  private static instance: MetricsStore;
  private metrics: Metric[] = [];
  private counters: Record<string, number> = {};
  private gauges: Record<string, number> = {};
  private histograms: Record<string, number[]> = {};
  private flushInterval: NodeJS.Timeout | null = null;
  private analyticsQueue: any[] = [];
  
  private constructor() {
    // Initialize flush interval if in production
    if (process.env.NODE_ENV === 'production') {
      this.flushInterval = setInterval(() => this.flush(), 60000); // Flush every minute
    }
  }
  
  public static getInstance(): MetricsStore {
    if (!MetricsStore.instance) {
      MetricsStore.instance = new MetricsStore();
    }
    return MetricsStore.instance;
  }
  
  // Add a metric to the store
  public addMetric(metric: Metric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    });
    
    // Update corresponding data structure based on metric type
    switch (metric.type) {
      case MetricType.COUNTER:
        this.updateCounter(metric.name, metric.value as number);
        break;
      case MetricType.GAUGE:
        this.updateGauge(metric.name, metric.value as number);
        break;
      case MetricType.HISTOGRAM:
        this.updateHistogram(metric.name, metric.value as number);
        break;
    }
    
    // Queue for analytics if enabled
    if (process.env.ANALYTICS_ENABLED === 'true') {
      this.queueForAnalytics(metric);
    }
    
    // Log if in development or if it's a system metric
    if (process.env.NODE_ENV === 'development' || metric.category === MetricCategory.SYSTEM) {
      Logger.debug(`Metric: ${metric.name} = ${metric.value}`, {
        metric: {
          name: metric.name,
          type: metric.type,
          category: metric.category,
          value: metric.value,
        },
      });
    }
  }
  
  // Update a counter
  private updateCounter(name: string, value: number): void {
    if (!this.counters[name]) {
      this.counters[name] = 0;
    }
    this.counters[name] += value;
  }
  
  // Update a gauge
  private updateGauge(name: string, value: number): void {
    this.gauges[name] = value;
  }
  
  // Update a histogram
  private updateHistogram(name: string, value: number): void {
    if (!this.histograms[name]) {
      this.histograms[name] = [];
    }
    this.histograms[name].push(value);
    
    // Keep histograms at a reasonable size
    if (this.histograms[name].length > 1000) {
      this.histograms[name] = this.histograms[name].slice(-1000);
    }
  }
  
  // Queue metric for analytics service
  private queueForAnalytics(metric: Metric): void {
    this.analyticsQueue.push({
      ...metric,
      environment: process.env.NODE_ENV,
      service: 'kazi-platform',
    });
    
    // Flush queue if it gets too large
    if (this.analyticsQueue.length >= 100) {
      this.flushAnalyticsQueue();
    }
  }
  
  // Flush analytics queue to external service
  private async flushAnalyticsQueue(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;
    
    try {
      // Clone and clear queue
      const queue = [...this.analyticsQueue];
      this.analyticsQueue = [];
      
      // Send to analytics service (implementation depends on service used)
      if (process.env.ANALYTICS_SERVICE === 'datadog') {
        await this.sendToDatadog(queue);
      } else if (process.env.ANALYTICS_SERVICE === 'prometheus') {
        await this.sendToPrometheus(queue);
      } else if (process.env.ANALYTICS_SERVICE === 'cloudwatch') {
        await this.sendToCloudWatch(queue);
      } else {
        // Default to custom analytics endpoint
        await this.sendToCustomAnalytics(queue);
      }
    } catch (error) {
      Logger.error('Failed to flush analytics queue', error);
      // Put items back in queue for retry
      this.analyticsQueue = [...this.analyticsQueue, ...this.analyticsQueue];
    }
  }
  
  // Send metrics to Datadog
  private async sendToDatadog(metrics: any[]): Promise<void> {
    // Implementation for Datadog API
    Logger.debug(`Sending ${metrics.length} metrics to Datadog`);
    // Actual implementation would use Datadog client library
  }
  
  // Send metrics to Prometheus
  private async sendToPrometheus(metrics: any[]): Promise<void> {
    // Implementation for Prometheus
    Logger.debug(`Exposing ${metrics.length} metrics to Prometheus`);
    // Actual implementation would update Prometheus registry
  }
  
  // Send metrics to AWS CloudWatch
  private async sendToCloudWatch(metrics: any[]): Promise<void> {
    // Implementation for CloudWatch
    Logger.debug(`Sending ${metrics.length} metrics to CloudWatch`);
    // Actual implementation would use AWS SDK
  }
  
  // Send metrics to custom analytics endpoint
  private async sendToCustomAnalytics(metrics: any[]): Promise<void> {
    try {
      // Send to custom endpoint
      const response = await fetch(process.env.ANALYTICS_ENDPOINT || '/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY || ''}`,
        },
        body: JSON.stringify({ metrics }),
      });
      
      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }
      
      Logger.debug(`Sent ${metrics.length} metrics to custom analytics endpoint`);
    } catch (error) {
      Logger.error('Failed to send metrics to custom analytics endpoint', error);
      throw error;
    }
  }
  
  // Flush all metrics (typically called before process exit)
  public async flush(): Promise<void> {
    Logger.debug(`Flushing ${this.metrics.length} metrics`);
    
    // Flush analytics queue
    if (process.env.ANALYTICS_ENABLED === 'true') {
      await this.flushAnalyticsQueue();
    }
    
    // Clear metrics that don't need to be persisted
    this.metrics = this.metrics.filter(m => 
      m.category === MetricCategory.SYSTEM || 
      m.category === MetricCategory.BUSINESS
    );
  }
  
  // Get all metrics
  public getMetrics(): Metric[] {
    return this.metrics;
  }
  
  // Get counter value
  public getCounter(name: string): number {
    return this.counters[name] || 0;
  }
  
  // Get gauge value
  public getGauge(name: string): number {
    return this.gauges[name] || 0;
  }
  
  // Get histogram values
  public getHistogram(name: string): number[] {
    return this.histograms[name] || [];
  }
  
  // Get histogram statistics
  public getHistogramStats(name: string): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    count: number;
  } {
    const values = this.getHistogram(name);
    
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        count: 0,
      };
    }
    
    // Sort values for percentile calculation
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sorted.reduce((sum, val) => sum + val, 0) / sorted.length,
      p50: this.percentile(sorted, 50),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      count: values.length,
    };
  }
  
  // Calculate percentile from sorted array
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
  }
  
  // Reset all metrics (useful for tests)
  public reset(): void {
    this.metrics = [];
    this.counters = {};
    this.gauges = {};
    this.histograms = {};
    this.analyticsQueue = [];
  }
  
  // Clean up resources
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// Get the metrics store instance
const metricsStore = MetricsStore.getInstance();

// Performance tracking functions

/**
 * Track performance metric
 */
export function trackPerformance(
  type: PerformanceMetricType,
  value: number,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `performance.${type}`,
    type: MetricType.HISTOGRAM,
    category: MetricCategory.PERFORMANCE,
    value,
    timestamp: Date.now(),
    labels,
  });
}

/**
 * Start performance tracking and return a function to end it
 */
export function startPerformanceTracking(
  type: PerformanceMetricType,
  labels: Record<string, string> = {}
): () => number {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    trackPerformance(type, duration, labels);
    return duration;
  };
}

// User interaction tracking functions

/**
 * Track user interaction
 */
export function trackUserInteraction(
  type: UserMetricType,
  value: number = 1,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `user.${type}`,
    type: type === UserMetricType.SESSION_DURATION ? MetricType.HISTOGRAM : MetricType.COUNTER,
    category: MetricCategory.USER,
    value,
    timestamp: Date.now(),
    labels,
  });
}

/**
 * Track page view
 */
export function trackPageView(
  page: string,
  labels: Record<string, string> = {}
): void {
  trackUserInteraction(UserMetricType.PAGE_VIEW, 1, {
    page,
    ...labels,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  labels: Record<string, string> = {}
): void {
  trackUserInteraction(UserMetricType.FEATURE_USAGE, 1, {
    feature,
    ...labels,
  });
}

// API metrics tracking functions

/**
 * Track API metric
 */
export function trackApiMetric(
  type: ApiMetricType,
  value: number = 1,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `api.${type}`,
    type: type === ApiMetricType.LATENCY ? MetricType.HISTOGRAM : MetricType.COUNTER,
    category: MetricCategory.API,
    value,
    timestamp: Date.now(),
    labels,
  });
}

/**
 * Track API request
 */
export function trackApiRequest(
  endpoint: string,
  statusCode: number,
  latency: number,
  labels: Record<string, string> = {}
): void {
  // Track request count
  trackApiMetric(ApiMetricType.REQUEST_COUNT, 1, {
    endpoint,
    statusCode: statusCode.toString(),
    ...labels,
  });
  
  // Track latency
  trackApiMetric(ApiMetricType.LATENCY, latency, {
    endpoint,
    statusCode: statusCode.toString(),
    ...labels,
  });
  
  // Track status code
  trackApiMetric(ApiMetricType.STATUS_CODE, 1, {
    endpoint,
    statusCode: statusCode.toString(),
    ...labels,
  });
  
  // Track errors
  if (statusCode >= 400) {
    trackApiMetric(ApiMetricType.ERROR_COUNT, 1, {
      endpoint,
      statusCode: statusCode.toString(),
      ...labels,
    });
  }
}

// System health metrics tracking functions

/**
 * Track system metric
 */
export function trackSystemMetric(
  type: SystemMetricType,
  value: number,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `system.${type}`,
    type: MetricType.GAUGE,
    category: MetricCategory.SYSTEM,
    value,
    timestamp: Date.now(),
    labels,
  });
}

/**
 * Track memory usage
 */
export function trackMemoryUsage(): void {
  if (typeof process !== 'undefined') {
    const memoryUsage = process.memoryUsage();
    
    trackSystemMetric(SystemMetricType.MEMORY_USAGE, memoryUsage.heapUsed, {
      type: 'heap_used',
    });
    
    trackSystemMetric(SystemMetricType.MEMORY_USAGE, memoryUsage.heapTotal, {
      type: 'heap_total',
    });
    
    trackSystemMetric(SystemMetricType.MEMORY_USAGE, memoryUsage.rss, {
      type: 'rss',
    });
  }
}

// Business metrics tracking functions

/**
 * Track business metric
 */
export function trackBusinessMetric(
  type: BusinessMetricType,
  value: number = 1,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `business.${type}`,
    type: MetricType.COUNTER,
    category: MetricCategory.BUSINESS,
    value,
    timestamp: Date.now(),
    labels,
  });
}

/**
 * Track revenue
 */
export function trackRevenue(
  amount: number,
  currency: string = 'USD',
  labels: Record<string, string> = {}
): void {
  trackBusinessMetric(BusinessMetricType.REVENUE, amount, {
    currency,
    ...labels,
  });
}

/**
 * Track subscription
 */
export function trackSubscription(
  tier: string,
  isNew: boolean = false,
  labels: Record<string, string> = {}
): void {
  trackBusinessMetric(BusinessMetricType.SUBSCRIPTION, 1, {
    tier,
    isNew: isNew.toString(),
    ...labels,
  });
}

// Custom metrics tracking

/**
 * Track custom metric
 */
export function trackCustomMetric(
  name: string,
  value: number,
  type: MetricType = MetricType.COUNTER,
  labels: Record<string, string> = {}
): void {
  metricsStore.addMetric({
    name: `custom.${name}`,
    type,
    category: MetricCategory.CUSTOM,
    value,
    timestamp: Date.now(),
    labels,
  });
}

// API middleware for tracking request metrics

/**
 * Middleware to track API request metrics
 */
export function withMetrics(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = performance.now();
    
    // Create a custom response object to capture the status code
    const originalEnd = res.end;
    let statusCode = 200;
    
    res.end = function(chunk?: any, encoding?: any, callback?: any) {
      // Get the status code
      statusCode = res.statusCode;
      
      // Calculate request duration
      const duration = performance.now() - startTime;
      
      // Track metrics
      const endpoint = req.url || 'unknown';
      const method = req.method || 'unknown';
      
      trackApiRequest(endpoint, statusCode, duration, {
        method,
        query: JSON.stringify(req.query),
      });
      
      // Call the original end method
      return originalEnd.call(this, chunk, encoding, callback);
    };
    
    try {
      // Get user information if available
      const user = await getCurrentUser(req, res);
      
      // Add user context to metrics if available
      if (user) {
        trackUserInteraction(UserMetricType.PAGE_VIEW, 1, {
          userId: user.id,
          userRole: user.role || 'user',
          endpoint: req.url || 'unknown',
        });
      }
      
      // Execute the handler
      return await handler(req, res);
    } catch (error) {
      // Track error
      trackApiMetric(ApiMetricType.ERROR_COUNT, 1, {
        endpoint: req.url || 'unknown',
        method: req.method || 'unknown',
        error: error.message || 'Unknown error',
      });
      
      // Re-throw the error
      throw error;
    }
  };
}

// Utility functions

/**
 * Get metrics for dashboard display
 */
export function getMetricsForDashboard(): {
  performance: Record<string, any>;
  api: Record<string, any>;
  system: Record<string, any>;
  business: Record<string, any>;
} {
  return {
    performance: {
      pageLoad: metricsStore.getHistogramStats('performance.page_load'),
      apiResponse: metricsStore.getHistogramStats('performance.api_response'),
      renderTime: metricsStore.getHistogramStats('performance.render_time'),
    },
    api: {
      requestCount: metricsStore.getCounter('api.request_count'),
      errorCount: metricsStore.getCounter('api.error_count'),
      latency: metricsStore.getHistogramStats('api.latency'),
    },
    system: {
      memoryUsage: metricsStore.getGauge('system.memory_usage'),
      cpuUsage: metricsStore.getGauge('system.cpu_usage'),
      activeConnections: metricsStore.getGauge('system.active_connections'),
    },
    business: {
      revenue: metricsStore.getCounter('business.revenue'),
      subscriptions: metricsStore.getCounter('business.subscription'),
      conversions: metricsStore.getCounter('business.conversion'),
    },
  };
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics(): void {
  metricsStore.reset();
}

/**
 * Flush metrics (for shutdown)
 */
export async function flushMetrics(): Promise<void> {
  await metricsStore.flush();
}

/**
 * Clean up metrics resources
 */
export function cleanupMetrics(): void {
  metricsStore.cleanup();
}

// Start tracking system metrics periodically
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    trackMemoryUsage();
    
    // Track CPU usage if available
    if (typeof process.cpuUsage === 'function') {
      const cpuUsage = process.cpuUsage();
      trackSystemMetric(SystemMetricType.CPU_USAGE, cpuUsage.user / 1000, {
        type: 'user',
      });
      trackSystemMetric(SystemMetricType.CPU_USAGE, cpuUsage.system / 1000, {
        type: 'system',
      });
    }
  }, 60000); // Every minute
}

// Export default object for convenience
export default {
  // Performance tracking
  trackPerformance,
  startPerformanceTracking,
  
  // User interaction tracking
  trackUserInteraction,
  trackPageView,
  trackFeatureUsage,
  
  // API metrics tracking
  trackApiMetric,
  trackApiRequest,
  
  // System metrics tracking
  trackSystemMetric,
  trackMemoryUsage,
  
  // Business metrics tracking
  trackBusinessMetric,
  trackRevenue,
  trackSubscription,
  
  // Custom metrics tracking
  trackCustomMetric,
  
  // API middleware
  withMetrics,
  
  // Utility functions
  getMetricsForDashboard,
  resetMetrics,
  flushMetrics,
  cleanupMetrics,
  
  // Enums
  MetricType,
  MetricCategory,
  PerformanceMetricType,
  UserMetricType,
  ApiMetricType,
  SystemMetricType,
  BusinessMetricType,
};
