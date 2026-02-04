/**
 * KAZI Platform - Cost Optimization Configuration
 * 
 * Central control panel for managing costs across the entire application.
 * This file provides configuration presets, feature flags, cost monitoring,
 * and recommendations for optimizing Vercel function usage and other costs.
 * 
 * @version 1.0.0
 * @author KAZI Engineering Team
 */

import { useEffect, useState } from 'react';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('CostOptimization');

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Feature flags for cost-sensitive features
 */
export interface CostFeatureFlags {
  /** Basic Vercel Analytics (free tier) */
  basicAnalytics: boolean;
  /** Enhanced analytics with custom events (counts toward Vercel Analytics quota) */
  enhancedAnalytics: boolean;
  /** Server-side analytics processing (requires Edge Functions) */
  serverAnalytics: boolean;
  /** Web Vitals monitoring (client-side implementation) */
  webVitals: boolean;
  /** A/B testing framework */
  abTesting: boolean;
  /** Middleware for security headers (minimal cost) */
  securityHeaders: boolean;
  /** Full middleware with geo-routing, caching (runs on every request) */
  fullMiddleware: boolean;
  /** Internationalization with dynamic imports */
  i18n: boolean;
  /** SLA monitoring with health checks */
  slaMonitoring: boolean;
  /** Security scanning and monitoring */
  securityScanning: boolean;
  /** Error tracking with Sentry */
  errorTracking: boolean;
  /** Real-time features (WebSockets, etc.) */
  realTimeFeatures: boolean;
  /** Image optimization (counts toward Vercel Image Optimization quota) */
  imageOptimization: boolean;
  /** On-demand ISR (Incremental Static Regeneration) */
  onDemandISR: boolean;
  /** Background tasks and cron jobs */
  backgroundTasks: boolean;
}

/**
 * Sampling configuration to reduce data volume
 */
export interface SamplingConfig {
  /** Percentage of users to collect analytics from (0-100) */
  analytics: number;
  /** Percentage of users to collect web vitals from (0-100) */
  webVitals: number;
  /** Percentage of users to include in A/B tests (0-100) */
  abTesting: number;
  /** Percentage of errors to track (0-100) */
  errorTracking: number;
  /** Percentage of requests to apply full middleware to (0-100) */
  middleware: number;
}

/**
 * Thresholds for various metrics
 */
export interface ThresholdsConfig {
  /** Function execution budget per day */
  dailyFunctionExecutions: number;
  /** Image optimization budget per day */
  dailyImageOptimizations: number;
  /** Bandwidth budget per day (GB) */
  dailyBandwidthGB: number;
  /** Build minutes budget per day */
  dailyBuildMinutes: number;
  /** Maximum acceptable response time (ms) */
  maxResponseTimeMs: number;
}

/**
 * Storage strategy configuration
 */
export interface StorageConfig {
  /** Use localStorage for analytics instead of API calls */
  useLocalStorageForAnalytics: boolean;
  /** Use cookies for user preferences instead of database */
  useCookiesForPreferences: boolean;
  /** Use IndexedDB for offline capabilities */
  useIndexedDB: boolean;
  /** Maximum localStorage usage (KB) */
  maxLocalStorageKB: number;
  /** Data retention period in localStorage (days) */
  localStorageRetentionDays: number;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Log function executions to console in development */
  logFunctionExecutions: boolean;
  /** Track function execution counts */
  trackFunctionCounts: boolean;
  /** Alert when thresholds are exceeded */
  alertOnThresholdExceeded: boolean;
  /** Alert channels (console, localStorage, Slack webhook) */
  alertChannels: ('console' | 'localStorage' | 'slack')[];
  /** Slack webhook URL for alerts */
  slackWebhookUrl?: string;
  /** Detailed logging in development */
  verboseLogging: boolean;
}

/**
 * Feature rollout configuration
 */
export interface FeatureRolloutConfig {
  /** Percentage of users to roll out to (0-100) */
  percentage: number;
  /** User segments to include (e.g., 'beta', 'premium') */
  segments: string[];
  /** Start date for rollout */
  startDate?: Date;
  /** End date for rollout */
  endDate?: Date;
  /** Whether to persist user assignment */
  sticky: boolean;
}

/**
 * Complete cost optimization configuration
 */
export interface CostOptimizationConfig {
  /** Environment name */
  environment: 'development' | 'staging' | 'production' | 'high-traffic';
  /** Feature flags */
  features: CostFeatureFlags;
  /** Sampling rates */
  sampling: SamplingConfig;
  /** Thresholds */
  thresholds: ThresholdsConfig;
  /** Storage strategy */
  storage: StorageConfig;
  /** Monitoring */
  monitoring: MonitoringConfig;
  /** Feature rollouts */
  featureRollouts: Record<keyof CostFeatureFlags, FeatureRolloutConfig>;
}

// ==========================================================
// PRESET CONFIGURATIONS
// ==========================================================

/**
 * Development environment preset
 * Optimized for local development with minimal costs
 */
export const DEVELOPMENT_PRESET: CostOptimizationConfig = {
  environment: 'development',
  features: {
    basicAnalytics: true,
    enhancedAnalytics: false,
    serverAnalytics: false,
    webVitals: true,
    abTesting: true,
    securityHeaders: true,
    fullMiddleware: false,
    i18n: true,
    slaMonitoring: false,
    securityScanning: false,
    errorTracking: true,
    realTimeFeatures: true,
    imageOptimization: true,
    onDemandISR: false,
    backgroundTasks: false
  },
  sampling: {
    analytics: 100, // Track all events in development
    webVitals: 100, // Track all web vitals in development
    abTesting: 100, // Include all users in A/B tests
    errorTracking: 100, // Track all errors in development
    middleware: 100 // Apply middleware to all requests
  },
  thresholds: {
    dailyFunctionExecutions: 1000,
    dailyImageOptimizations: 1000,
    dailyBandwidthGB: 1,
    dailyBuildMinutes: 30,
    maxResponseTimeMs: 1000
  },
  storage: {
    useLocalStorageForAnalytics: true,
    useCookiesForPreferences: true,
    useIndexedDB: false,
    maxLocalStorageKB: 1000,
    localStorageRetentionDays: 7
  },
  monitoring: {
    logFunctionExecutions: true,
    trackFunctionCounts: true,
    alertOnThresholdExceeded: true,
    alertChannels: ['console'],
    verboseLogging: true
  },
  featureRollouts: {
    // All features fully enabled in development
    basicAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    enhancedAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    serverAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    webVitals: { percentage: 100, segments: ['all'], sticky: true },
    abTesting: { percentage: 100, segments: ['all'], sticky: true },
    securityHeaders: { percentage: 100, segments: ['all'], sticky: true },
    fullMiddleware: { percentage: 100, segments: ['all'], sticky: true },
    i18n: { percentage: 100, segments: ['all'], sticky: true },
    slaMonitoring: { percentage: 100, segments: ['all'], sticky: true },
    securityScanning: { percentage: 100, segments: ['all'], sticky: true },
    errorTracking: { percentage: 100, segments: ['all'], sticky: true },
    realTimeFeatures: { percentage: 100, segments: ['all'], sticky: true },
    imageOptimization: { percentage: 100, segments: ['all'], sticky: true },
    onDemandISR: { percentage: 100, segments: ['all'], sticky: true },
    backgroundTasks: { percentage: 100, segments: ['all'], sticky: true }
  }
};

/**
 * Production environment preset
 * Balanced approach for most production deployments
 */
export const PRODUCTION_PRESET: CostOptimizationConfig = {
  environment: 'production',
  features: {
    basicAnalytics: true,
    enhancedAnalytics: true,
    serverAnalytics: false, // Avoid server analytics to reduce function calls
    webVitals: true,
    abTesting: true,
    securityHeaders: true,
    fullMiddleware: true,
    i18n: true,
    slaMonitoring: true,
    securityScanning: true,
    errorTracking: true,
    realTimeFeatures: true,
    imageOptimization: true,
    onDemandISR: true,
    backgroundTasks: true
  },
  sampling: {
    analytics: 25, // Only track 25% of users for analytics
    webVitals: 10, // Only track 10% of users for web vitals
    abTesting: 50, // Include 50% of users in A/B tests
    errorTracking: 100, // Track all errors in production
    middleware: 100 // Apply middleware to all requests
  },
  thresholds: {
    dailyFunctionExecutions: 100000,
    dailyImageOptimizations: 5000,
    dailyBandwidthGB: 50,
    dailyBuildMinutes: 100,
    maxResponseTimeMs: 500
  },
  storage: {
    useLocalStorageForAnalytics: true,
    useCookiesForPreferences: true,
    useIndexedDB: true,
    maxLocalStorageKB: 500,
    localStorageRetentionDays: 30
  },
  monitoring: {
    logFunctionExecutions: false,
    trackFunctionCounts: true,
    alertOnThresholdExceeded: true,
    alertChannels: ['localStorage', 'slack'],
    slackWebhookUrl: process.env.COST_ALERT_SLACK_WEBHOOK,
    verboseLogging: false
  },
  featureRollouts: {
    // Most features fully enabled in production
    basicAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    enhancedAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    serverAnalytics: { percentage: 0, segments: [], sticky: true }, // Disabled
    webVitals: { percentage: 100, segments: ['all'], sticky: true },
    abTesting: { percentage: 100, segments: ['all'], sticky: true },
    securityHeaders: { percentage: 100, segments: ['all'], sticky: true },
    fullMiddleware: { percentage: 100, segments: ['all'], sticky: true },
    i18n: { percentage: 100, segments: ['all'], sticky: true },
    slaMonitoring: { percentage: 100, segments: ['all'], sticky: true },
    securityScanning: { percentage: 100, segments: ['all'], sticky: true },
    errorTracking: { percentage: 100, segments: ['all'], sticky: true },
    realTimeFeatures: { percentage: 100, segments: ['all'], sticky: true },
    imageOptimization: { percentage: 100, segments: ['all'], sticky: true },
    onDemandISR: { percentage: 100, segments: ['all'], sticky: true },
    backgroundTasks: { percentage: 100, segments: ['all'], sticky: true }
  }
};

/**
 * High-traffic environment preset
 * Heavily optimized for cost efficiency at scale
 */
export const HIGH_TRAFFIC_PRESET: CostOptimizationConfig = {
  environment: 'high-traffic',
  features: {
    basicAnalytics: true,
    enhancedAnalytics: true,
    serverAnalytics: false, // Avoid server analytics to reduce function calls
    webVitals: true,
    abTesting: true,
    securityHeaders: true,
    fullMiddleware: true,
    i18n: true,
    slaMonitoring: true,
    securityScanning: true,
    errorTracking: true,
    realTimeFeatures: true,
    imageOptimization: true,
    onDemandISR: true,
    backgroundTasks: true
  },
  sampling: {
    analytics: 5, // Only track 5% of users for analytics
    webVitals: 1, // Only track 1% of users for web vitals
    abTesting: 20, // Include 20% of users in A/B tests
    errorTracking: 10, // Track 10% of errors in high-traffic
    middleware: 100 // Apply middleware to all requests (security critical)
  },
  thresholds: {
    dailyFunctionExecutions: 1000000,
    dailyImageOptimizations: 50000,
    dailyBandwidthGB: 500,
    dailyBuildMinutes: 200,
    maxResponseTimeMs: 300
  },
  storage: {
    useLocalStorageForAnalytics: true,
    useCookiesForPreferences: true,
    useIndexedDB: true,
    maxLocalStorageKB: 200, // Reduced for high-traffic
    localStorageRetentionDays: 7 // Shorter retention for high-traffic
  },
  monitoring: {
    logFunctionExecutions: false,
    trackFunctionCounts: true,
    alertOnThresholdExceeded: true,
    alertChannels: ['localStorage', 'slack'],
    slackWebhookUrl: process.env.COST_ALERT_SLACK_WEBHOOK,
    verboseLogging: false
  },
  featureRollouts: {
    // Gradual rollout for high-traffic environment
    basicAnalytics: { percentage: 100, segments: ['all'], sticky: true },
    enhancedAnalytics: { percentage: 50, segments: ['premium'], sticky: true },
    serverAnalytics: { percentage: 0, segments: [], sticky: true }, // Disabled
    webVitals: { percentage: 20, segments: ['premium'], sticky: true },
    abTesting: { percentage: 50, segments: ['premium', 'beta'], sticky: true },
    securityHeaders: { percentage: 100, segments: ['all'], sticky: true },
    fullMiddleware: { percentage: 100, segments: ['all'], sticky: true },
    i18n: { percentage: 100, segments: ['all'], sticky: true },
    slaMonitoring: { percentage: 100, segments: ['all'], sticky: true },
    securityScanning: { percentage: 100, segments: ['all'], sticky: true },
    errorTracking: { percentage: 100, segments: ['all'], sticky: true },
    realTimeFeatures: { percentage: 50, segments: ['premium'], sticky: true },
    imageOptimization: { percentage: 100, segments: ['all'], sticky: true },
    onDemandISR: { percentage: 20, segments: ['premium'], sticky: true },
    backgroundTasks: { percentage: 100, segments: ['all'], sticky: true }
  }
};

// ==========================================================
// ACTIVE CONFIGURATION
// ==========================================================

/**
 * Determine which configuration preset to use based on environment
 */
export function getActiveConfig(): CostOptimizationConfig {
  // Use environment variable to determine which preset to use
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  const isHighTraffic = process.env.NEXT_PUBLIC_HIGH_TRAFFIC === 'true';
  
  if (isHighTraffic) {
    return HIGH_TRAFFIC_PRESET;
  }
  
  switch (env) {
    case 'production':
      return PRODUCTION_PRESET;
    case 'staging':
      return { 
        ...PRODUCTION_PRESET, 
        environment: 'staging',
        // More generous sampling in staging
        sampling: { ...PRODUCTION_PRESET.sampling, analytics: 50, webVitals: 25 }
      };
    case 'development':
    default:
      return DEVELOPMENT_PRESET;
  }
}

// Allow for runtime overrides of the active configuration
let ACTIVE_CONFIG = getActiveConfig();

/**
 * Override the active configuration
 */
export function setActiveConfig(config: Partial<CostOptimizationConfig>): void {
  ACTIVE_CONFIG = { ...ACTIVE_CONFIG, ...config };
}

/**
 * Get the current active configuration
 */
export function useActiveConfig(): CostOptimizationConfig {
  const [config, setConfig] = useState<CostOptimizationConfig>(ACTIVE_CONFIG);
  
  // Update config if it changes
  useEffect(() => {
    const handleConfigChange = () => {
      setConfig(ACTIVE_CONFIG);
    };
    
    // Listen for config changes
    window.addEventListener('kazi:config-changed', handleConfigChange);
    
    return () => {
      window.removeEventListener('kazi:config-changed', handleConfigChange);
    };
  }, []);
  
  return config;
}

// ==========================================================
// COST ESTIMATION
// ==========================================================

/**
 * Vercel pricing tiers (simplified)
 */
export const VERCEL_PRICING = {
  hobby: {
    functionExecutions: { included: 100000, price: 0, additional: 0.40 }, // per 1000 executions
    imageOptimizations: { included: 1000, price: 0, additional: 5 }, // per 1000 optimizations
    bandwidth: { included: 100, price: 0, additional: 0.10 }, // per GB
    buildMinutes: { included: 100, price: 0, additional: 0.04 } // per minute
  },
  pro: {
    functionExecutions: { included: 1000000, price: 20, additional: 0.20 }, // per 1000 executions
    imageOptimizations: { included: 5000, price: 20, additional: 5 }, // per 1000 optimizations
    bandwidth: { included: 1000, price: 20, additional: 0.10 }, // per GB
    buildMinutes: { included: 6000, price: 20, additional: 0.04 } // per minute
  },
  enterprise: {
    functionExecutions: { included: 5000000, price: 'custom', additional: 'custom' },
    imageOptimizations: { included: 20000, price: 'custom', additional: 'custom' },
    bandwidth: { included: 5000, price: 'custom', additional: 'custom' },
    buildMinutes: { included: 30000, price: 'custom', additional: 'custom' }
  }
};

/**
 * Usage levels for cost estimation
 */
export const USAGE_LEVELS = {
  small: {
    monthlyUsers: 10000,
    avgPageViews: 3,
    avgFunctionsPerPage: 2,
    avgImageOptimizationsPerPage: 5,
    avgBandwidthPerPage: 0.5, // MB
    monthlyBuilds: 30,
    avgBuildTime: 5 // minutes
  },
  medium: {
    monthlyUsers: 100000,
    avgPageViews: 4,
    avgFunctionsPerPage: 3,
    avgImageOptimizationsPerPage: 8,
    avgBandwidthPerPage: 1, // MB
    monthlyBuilds: 60,
    avgBuildTime: 8 // minutes
  },
  large: {
    monthlyUsers: 1000000,
    avgPageViews: 5,
    avgFunctionsPerPage: 4,
    avgImageOptimizationsPerPage: 10,
    avgBandwidthPerPage: 2, // MB
    monthlyBuilds: 120,
    avgBuildTime: 12 // minutes
  },
  enterprise: {
    monthlyUsers: 10000000,
    avgPageViews: 6,
    avgFunctionsPerPage: 5,
    avgImageOptimizationsPerPage: 12,
    avgBandwidthPerPage: 3, // MB
    monthlyBuilds: 300,
    avgBuildTime: 15 // minutes
  }
};

/**
 * Calculate estimated monthly costs
 */
export function estimateMonthlyCost(
  usageLevel: keyof typeof USAGE_LEVELS,
  tier: keyof typeof VERCEL_PRICING,
  config: CostOptimizationConfig
): Record<string, number> {
  const usage = USAGE_LEVELS[usageLevel];
  const pricing = VERCEL_PRICING[tier];
  
  // Calculate total function executions
  const totalPageViews = usage.monthlyUsers * usage.avgPageViews;
  
  // Apply sampling from config
  const analyticsRate = config.sampling.analytics / 100;
  const webVitalsRate = config.sampling.webVitals / 100;
  const middlewareRate = config.sampling.middleware / 100;
  
  // Calculate function executions based on enabled features
  let functionExecutions = totalPageViews; // Base page views
  
  if (config.features.fullMiddleware) {
    functionExecutions += totalPageViews * middlewareRate;
  }
  
  if (config.features.enhancedAnalytics) {
    functionExecutions += totalPageViews * analyticsRate * 2; // 2 events per page view
  }
  
  if (config.features.webVitals) {
    functionExecutions += totalPageViews * webVitalsRate;
  }
  
  if (config.features.serverAnalytics) {
    functionExecutions += totalPageViews * analyticsRate;
  }
  
  if (config.features.slaMonitoring) {
    functionExecutions += 30 * 24 * 12; // 12 checks per hour for 30 days
  }
  
  if (config.features.backgroundTasks) {
    functionExecutions += 30 * 24 * 4; // 4 tasks per hour for 30 days
  }
  
  // Calculate image optimizations
  let imageOptimizations = 0;
  if (config.features.imageOptimization) {
    imageOptimizations = totalPageViews * usage.avgImageOptimizationsPerPage;
  }
  
  // Calculate bandwidth
  const bandwidthGB = (totalPageViews * usage.avgBandwidthPerPage) / 1000;
  
  // Calculate build minutes
  const buildMinutes = usage.monthlyBuilds * usage.avgBuildTime;
  
  // Calculate costs
  const functionCost = calculateResourceCost(
    functionExecutions,
    pricing.functionExecutions.included,
    pricing.functionExecutions.price,
    pricing.functionExecutions.additional / 1000
  );
  
  const imageCost = calculateResourceCost(
    imageOptimizations,
    pricing.imageOptimizations.included,
    pricing.imageOptimizations.price,
    pricing.imageOptimizations.additional / 1000
  );
  
  const bandwidthCost = calculateResourceCost(
    bandwidthGB,
    pricing.bandwidth.included,
    pricing.bandwidth.price,
    pricing.bandwidth.additional
  );
  
  const buildCost = calculateResourceCost(
    buildMinutes,
    pricing.buildMinutes.included,
    pricing.buildMinutes.price,
    pricing.buildMinutes.additional
  );
  
  // Return cost breakdown
  return {
    functionExecutions: functionCost,
    imageOptimizations: imageCost,
    bandwidth: bandwidthCost,
    buildMinutes: buildCost,
    basePlanCost: typeof pricing.functionExecutions.price === 'number' ? pricing.functionExecutions.price : 0,
    totalCost: functionCost + imageCost + bandwidthCost + buildCost +
      (typeof pricing.functionExecutions.price === 'number' ? pricing.functionExecutions.price : 0)
  };
}

/**
 * Helper function to calculate resource cost
 */
function calculateResourceCost(
  usage: number,
  included: number,
  baseCost: number | string,
  additionalCost: number | string
): number {
  if (typeof baseCost === 'string' || typeof additionalCost === 'string') {
    return 0; // Custom pricing
  }
  
  if (usage <= included) {
    return 0; // Included in base plan
  }
  
  const excess = usage - included;
  return excess * additionalCost;
}

// ==========================================================
// FEATURE FLAG MANAGEMENT
// ==========================================================

/**
 * Check if a feature is enabled based on configuration and rollout
 */
export function isFeatureEnabled(
  feature: keyof CostFeatureFlags,
  userId?: string,
  userSegments: string[] = ['all'],
  config: CostOptimizationConfig = ACTIVE_CONFIG
): boolean {
  // Check if feature is enabled in config
  if (!config.features[feature]) {
    return false;
  }
  
  // Get rollout config for this feature
  const rollout = config.featureRollouts[feature];
  
  // Check if user is in a targeted segment
  const isInSegment = rollout.segments.some(segment => 
    segment === 'all' || userSegments.includes(segment)
  );
  
  if (!isInSegment) {
    return false;
  }
  
  // Check rollout dates
  const now = new Date();
  if (rollout.startDate && now < rollout.startDate) {
    return false;
  }
  
  if (rollout.endDate && now > rollout.endDate) {
    return false;
  }
  
  // If sticky, check localStorage for previous assignment
  if (rollout.sticky && userId && typeof window !== 'undefined') {
    const key = `kazi_feature_${feature}_${userId}`;
    const storedValue = localStorage.getItem(key);
    
    if (storedValue !== null) {
      return storedValue === 'true';
    }
  }
  
  // Determine based on percentage rollout
  const isEnabled = Math.random() * 100 < rollout.percentage;
  
  // If sticky, store the assignment
  if (rollout.sticky && userId && typeof window !== 'undefined') {
    const key = `kazi_feature_${feature}_${userId}`;
    localStorage.setItem(key, String(isEnabled));
  }
  
  return isEnabled;
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(
  feature: keyof CostFeatureFlags,
  userId?: string,
  userSegments: string[] = ['all']
): boolean {
  const config = useActiveConfig();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    setIsEnabled(isFeatureEnabled(feature, userId, userSegments, config));
  }, [feature, userId, userSegments, config]);
  
  return isEnabled;
}

// ==========================================================
// USAGE MONITORING
// ==========================================================

/**
 * Function execution counter
 */
const functionExecutionCounts: Record<string, number> = {};

/**
 * Track a function execution
 */
export function trackFunctionExecution(
  functionName: string,
  config: CostOptimizationConfig = ACTIVE_CONFIG
): void {
  if (!config.monitoring.trackFunctionCounts) {
    return;
  }
  
  // Increment count
  functionExecutionCounts[functionName] = (functionExecutionCounts[functionName] || 0) + 1;
  
  // Log if enabled
  if (config.monitoring.logFunctionExecutions) {
    logger.info('Function executed', {
      functionName,
      executionCount: functionExecutionCounts[functionName]
    });
  }
  
  // Check threshold
  const totalExecutions = Object.values(functionExecutionCounts).reduce((a, b) => a + b, 0);
  
  if (config.monitoring.alertOnThresholdExceeded && 
      totalExecutions > config.thresholds.dailyFunctionExecutions) {
    alertThresholdExceeded(
      'Function Executions',
      totalExecutions,
      config.thresholds.dailyFunctionExecutions,
      config
    );
  }
}

/**
 * Alert when a threshold is exceeded
 */
function alertThresholdExceeded(
  resource: string,
  current: number,
  threshold: number,
  config: CostOptimizationConfig
): void {
  const message = `COST ALERT: ${resource} threshold exceeded. Current: ${current}, Threshold: ${threshold}`;

  if (config.monitoring.alertChannels.includes('console')) {
    logger.warn('Cost threshold exceeded', {
      resource,
      current,
      threshold
    });
  }
  
  if (config.monitoring.alertChannels.includes('localStorage') && typeof window !== 'undefined') {
    const alerts = JSON.parse(localStorage.getItem('kazi_cost_alerts') || '[]');
    alerts.push({
      resource,
      current,
      threshold,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('kazi_cost_alerts', JSON.stringify(alerts.slice(-20)));
  }
  
  if (config.monitoring.alertChannels.includes('slack') && config.monitoring.slackWebhookUrl) {
    // Send to Slack webhook
    fetch(config.monitoring.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    }).catch(err => {
      logger.error('Failed to send Slack alert', {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
    });
  }
}

/**
 * Get current usage statistics
 */
export function getUsageStats(): Record<string, number> {
  return {
    totalFunctionExecutions: Object.values(functionExecutionCounts).reduce((a, b) => a + b, 0),
    functionBreakdown: { ...functionExecutionCounts }
  };
}

/**
 * Reset usage counters
 */
export function resetUsageCounters(): void {
  Object.keys(functionExecutionCounts).forEach(key => {
    functionExecutionCounts[key] = 0;
  });
}

// ==========================================================
// COST OPTIMIZATION RECOMMENDATIONS
// ==========================================================

/**
 * Get cost optimization recommendations based on current usage
 */
export function getCostRecommendations(
  usageStats: Record<string, number>,
  config: CostOptimizationConfig
): string[] {
  const recommendations: string[] = [];
  
  // Function executions recommendations
  const totalFunctionExecutions = usageStats.totalFunctionExecutions || 0;
  const functionThreshold = config.thresholds.dailyFunctionExecutions * 0.8; // 80% of threshold
  
  if (totalFunctionExecutions > functionThreshold) {
    recommendations.push(
      'Reduce function executions by increasing sampling rates or disabling server-side analytics'
    );
    
    if (config.features.serverAnalytics) {
      recommendations.push(
        'Consider disabling server-side analytics to reduce function executions'
      );
    }
    
    if (config.sampling.analytics > 10) {
      recommendations.push(
        'Reduce analytics sampling rate to 10% or lower'
      );
    }
    
    if (config.sampling.webVitals > 5) {
      recommendations.push(
        'Reduce web vitals sampling rate to 5% or lower'
      );
    }
  }
  
  // Image optimization recommendations
  if (config.features.imageOptimization) {
    recommendations.push(
      'Use next/image with priority attribute only for above-the-fold images'
    );
    recommendations.push(
      'Implement lazy loading for below-the-fold images'
    );
  }
  
  // Middleware recommendations
  if (config.features.fullMiddleware) {
    recommendations.push(
      'Use middleware matcher to limit middleware execution to specific routes'
    );
  }
  
  // General recommendations
  recommendations.push(
    'Implement proper caching strategies to reduce function executions'
  );
  recommendations.push(
    'Use Incremental Static Regeneration (ISR) for frequently accessed pages'
  );
  
  return recommendations;
}

// ==========================================================
// DEBUGGING UTILITIES
// ==========================================================

/**
 * Generate a cost debug report
 */
export function generateCostDebugReport(
  config: CostOptimizationConfig = ACTIVE_CONFIG
): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    environment: config.environment,
    enabledFeatures: Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature),
    samplingRates: config.sampling,
    usageStats: getUsageStats(),
    estimatedCosts: {
      hobby: estimateMonthlyCost('small', 'hobby', config),
      pro: estimateMonthlyCost('medium', 'pro', config),
      enterprise: estimateMonthlyCost('large', 'enterprise', config)
    },
    recommendations: getCostRecommendations(getUsageStats(), config),
    thresholds: config.thresholds
  };
}

/**
 * Log a cost debug report to console
 */
export function logCostDebugReport(
  config: CostOptimizationConfig = ACTIVE_CONFIG
): void {
  const report = generateCostDebugReport(config);
  logger.info('KAZI Cost Optimization Debug Report', report);
}

// ==========================================================
// EXPORTS
// ==========================================================

export default {
  getActiveConfig,
  setActiveConfig,
  useActiveConfig,
  estimateMonthlyCost,
  isFeatureEnabled,
  useFeatureFlag,
  trackFunctionExecution,
  getUsageStats,
  resetUsageCounters,
  getCostRecommendations,
  generateCostDebugReport,
  logCostDebugReport,
  DEVELOPMENT_PRESET,
  PRODUCTION_PRESET,
  HIGH_TRAFFIC_PRESET,
  VERCEL_PRICING,
  USAGE_LEVELS
};

/**
 * COST IMPLICATIONS DOCUMENTATION
 * 
 * 1. Vercel Function Executions:
 *    - Each Serverless Function or Edge Function invocation counts as one execution
 *    - API routes, Server Components, and middleware all count as function executions
 *    - Hobby: 100k included, $0.40 per 1k after
 *    - Pro: 1M included, $0.20 per 1k after
 * 
 * 2. Image Optimizations:
 *    - Each unique combination of image source and size parameters counts as one optimization
 *    - Hobby: 1k included, $5 per 1k after
 *    - Pro: 5k included, $5 per 1k after
 * 
 * 3. Bandwidth:
 *    - All data transferred from Vercel's edge network
 *    - Hobby: 100GB included, $0.10 per GB after
 *    - Pro: 1TB included, $0.10 per GB after
 * 
 * 4. Build Minutes:
 *    - Time spent building your application
 *    - Hobby: 100 minutes included, $0.04 per minute after
 *    - Pro: 6000 minutes included, $0.04 per minute after
 * 
 * HIGH COST FEATURES:
 * - Server-side analytics (function executions)
 * - Frequent API calls (function executions)
 * - Middleware on all routes (function executions)
 * - Unoptimized images (image optimizations)
 * - Frequent rebuilds (build minutes)
 * - Large media files (bandwidth)
 * 
 * SCALING RECOMMENDATIONS:
 * 1. Start with minimal features enabled
 * 2. Use sampling to reduce data volume
 * 3. Implement proper caching strategies
 * 4. Use client-side features where possible
 * 5. Optimize image usage
 * 6. Limit middleware execution with matchers
 * 7. Use Incremental Static Regeneration
 * 8. Monitor usage and adjust as needed
 */
