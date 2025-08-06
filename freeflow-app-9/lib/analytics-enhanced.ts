import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import { metric, ReportCallback, Metric } from 'web-vitals';
import { useEffect, useState } from 'react';
import axios from 'axios';

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

/**
 * SLA monitoring configuration
 */
export interface SLAConfig {
  targetUptime: number; // e.g. 99.9
  checkIntervalMs: number;
  alertThreshold: number; // percentage below target that triggers alert
  endpoints: string[];
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  slackWebhookUrl?: string;
  emailRecipients?: string[];
  smsRecipients?: string[];
  alertThresholds: {
    error: number; // errors per minute
    performance: CoreWebVitalsThresholds;
    uptime: number; // percentage
  };
}

/**
 * Core Web Vitals thresholds based on Google's recommendations
 */
export interface CoreWebVitalsThresholds {
  LCP: { good: number; needsImprovement: number }; // milliseconds
  FID: { good: number; needsImprovement: number }; // milliseconds
  CLS: { good: number; needsImprovement: number }; // score
  FCP: { good: number; needsImprovement: number }; // milliseconds
  TTFB: { good: number; needsImprovement: number }; // milliseconds
  INP: { good: number; needsImprovement: number }; // milliseconds
}

/**
 * Custom event for business metrics
 */
export interface CustomEvent {
  name: string;
  category: 'user' | 'business' | 'performance' | 'error' | 'journey';
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

/**
 * User journey step
 */
export interface JourneyStep {
  stepId: string;
  pagePath: string;
  componentId?: string;
  action: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * A/B test configuration
 */
export interface ABTest {
  testId: string;
  variants: string[];
  trafficAllocation: number[]; // percentages for each variant
  metrics: string[]; // metrics to track for this test
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Analytics dashboard configuration
 */
export interface AnalyticsDashboardConfig {
  refreshInterval: number;
  defaultDateRange: 'today' | 'yesterday' | '7d' | '30d' | '90d';
  defaultMetrics: string[];
  alertsEnabled: boolean;
  userSegments: string[];
}

/**
 * Error event with detailed information
 */
export interface ErrorEvent {
  message: string;
  stack?: string;
  componentName?: string;
  userId?: string;
  sessionId: string;
  url: string;
  timestamp: number;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ==========================================================
// CONFIGURATION
// ==========================================================

/**
 * Default Core Web Vitals thresholds based on Google's recommendations
 */
export const DEFAULT_WEB_VITALS_THRESHOLDS: CoreWebVitalsThresholds = {
  LCP: { good: 2500, needsImprovement: 4000 }, // milliseconds
  FID: { good: 100, needsImprovement: 300 }, // milliseconds
  CLS: { good: 0.1, needsImprovement: 0.25 }, // score
  FCP: { good: 1800, needsImprovement: 3000 }, // milliseconds
  TTFB: { good: 800, needsImprovement: 1800 }, // milliseconds
  INP: { good: 200, needsImprovement: 500 }, // milliseconds
};

/**
 * Default SLA configuration with 99.9% uptime target
 */
export const DEFAULT_SLA_CONFIG: SLAConfig = {
  targetUptime: 99.9,
  checkIntervalMs: 60000, // 1 minute
  alertThreshold: 99.5, // Alert if below 99.5%
  endpoints: [
    '/api/health',
    '/api/status',
  ],
};

/**
 * Default alert configuration
 */
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  slackWebhookUrl: process.env.NEXT_PUBLIC_ANALYTICS_SLACK_WEBHOOK,
  emailRecipients: process.env.NEXT_PUBLIC_ANALYTICS_EMAIL_RECIPIENTS?.split(','),
  alertThresholds: {
    error: 5, // 5 errors per minute
    performance: DEFAULT_WEB_VITALS_THRESHOLDS,
    uptime: 99.5, // percentage
  },
};

/**
 * Default analytics dashboard configuration
 */
export const DEFAULT_DASHBOARD_CONFIG: AnalyticsDashboardConfig = {
  refreshInterval: 60000, // 1 minute
  defaultDateRange: '7d',
  defaultMetrics: ['pageViews', 'conversions', 'revenue', 'LCP', 'CLS', 'errorRate'],
  alertsEnabled: true,
  userSegments: ['all', 'newUsers', 'returningUsers', 'premiumUsers'],
};

// ==========================================================
// ANALYTICS PROVIDER COMPONENT
// ==========================================================

/**
 * Analytics Provider component props
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
  slaConfig?: SLAConfig;
  alertConfig?: AlertConfig;
  dashboardConfig?: AnalyticsDashboardConfig;
  debug?: boolean;
}

/**
 * Enhanced Analytics Provider component that wraps Vercel Analytics
 * and provides additional analytics features
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  slaConfig = DEFAULT_SLA_CONFIG,
  alertConfig = DEFAULT_ALERT_CONFIG,
  dashboardConfig = DEFAULT_DASHBOARD_CONFIG,
  debug = false,
}) => {
  // Initialize Vercel Analytics in production mode
  useEffect(() => {
    // Only inject analytics in production
    if (process.env.NODE_ENV === 'production') {
      inject({ debug });
      
      // Initialize web vitals reporting
      initWebVitalsReporting();
      
      // Initialize SLA monitoring
      initSLAMonitoring(slaConfig);
      
      console.log('KAZI Analytics: Production analytics initialized');
    }
  }, [debug, slaConfig]);

  return (
    <>
      {/* Vercel Analytics component */}
      <Analytics />
      {children}
    </>
  );
};

// ==========================================================
// WEB VITALS TRACKING
// ==========================================================

/**
 * Initialize Web Vitals reporting
 */
export function initWebVitalsReporting(): void {
  if (typeof window !== 'undefined') {
    // Report all core web vitals
    metric((metric: Metric) => {
      const { name, value, id } = metric;
      
      // Send to backend API
      reportWebVital(metric);
      
      // Log in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Web Vital: ${name} = ${value}`);
      }
      
      // Check if the metric needs improvement
      checkVitalThreshold(metric);
    });
  }
}

/**
 * Report a web vital metric to the backend
 */
function reportWebVital(metric: Metric): void {
  // Don't send metrics in development
  if (process.env.NODE_ENV !== 'production') return;
  
  // Use sendBeacon if available, fall back to fetch
  const url = '/api/analytics/vitals';
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname,
    timestamp: Date.now(),
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Check if a vital metric is below threshold and trigger alert if needed
 */
function checkVitalThreshold(metric: Metric): void {
  const { name, value } = metric;
  
  // Only check in production
  if (process.env.NODE_ENV !== 'production') return;
  
  // Get threshold for this metric
  let thresholds: { good: number; needsImprovement: number } | undefined;
  
  switch (name) {
    case 'LCP':
    case 'FID':
    case 'CLS':
    case 'FCP':
    case 'TTFB':
    case 'INP':
      thresholds = DEFAULT_WEB_VITALS_THRESHOLDS[name as keyof CoreWebVitalsThresholds];
      break;
    default:
      return; // Unsupported metric
  }
  
  if (!thresholds) return;
  
  // Check if the metric is poor (worse than "needs improvement")
  if (value > thresholds.needsImprovement) {
    // This is a poor performance metric - trigger alert
    triggerPerformanceAlert({
      metricName: name,
      value: value,
      threshold: thresholds.needsImprovement,
      page: window.location.pathname,
    });
  }
}

// ==========================================================
// CUSTOM EVENT TRACKING
// ==========================================================

/**
 * Track a custom event
 */
export function trackEvent(event: Omit<CustomEvent, 'timestamp'>): void {
  const fullEvent: CustomEvent = {
    ...event,
    timestamp: Date.now(),
  };
  
  // Don't send events in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Event tracked:', fullEvent);
    return;
  }
  
  // Send to backend API
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullEvent),
    keepalive: true,
  }).catch(error => {
    console.error('Failed to track event:', error);
  });
}

/**
 * Track a business metric
 */
export function trackBusinessMetric(
  name: string,
  value: number,
  metadata?: Record<string, any>
): void {
  trackEvent({
    name,
    category: 'business',
    value,
    metadata,
  });
}

/**
 * Track a user journey step
 */
export function trackJourneyStep(step: Omit<JourneyStep, 'timestamp'>): void {
  const fullStep: JourneyStep = {
    ...step,
    timestamp: Date.now(),
  };
  
  // Don't send events in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Journey step tracked:', fullStep);
    return;
  }
  
  // Send to backend API
  fetch('/api/analytics/journey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullStep),
    keepalive: true,
  }).catch(error => {
    console.error('Failed to track journey step:', error);
  });
}

// ==========================================================
// ERROR TRACKING
// ==========================================================

/**
 * Track an error event
 */
export function trackError(
  error: Error | string,
  metadata?: Record<string, any>,
  severity: ErrorEvent['severity'] = 'medium'
): void {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;
  
  const errorEvent: ErrorEvent = {
    message,
    stack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    sessionId: getSessionId(),
    timestamp: Date.now(),
    metadata,
    severity,
  };
  
  // Always log errors to console
  console.error('Error tracked:', errorEvent);
  
  // Don't send to backend in development
  if (process.env.NODE_ENV !== 'production') return;
  
  // Send to backend API
  fetch('/api/analytics/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorEvent),
    keepalive: true,
  }).catch(err => {
    console.error('Failed to track error:', err);
  });
  
  // For critical errors, trigger immediate alert
  if (severity === 'critical') {
    triggerErrorAlert(errorEvent);
  }
}

/**
 * Get or generate a session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('kazi_analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('kazi_analytics_session_id', sessionId);
  }
  
  return sessionId;
}

// ==========================================================
// SLA MONITORING
// ==========================================================

/**
 * Initialize SLA monitoring
 */
export function initSLAMonitoring(config: SLAConfig): void {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;
  
  // Start periodic health checks
  setInterval(() => {
    checkEndpointHealth(config);
  }, config.checkIntervalMs);
  
  console.log(`KAZI Analytics: SLA monitoring initialized (target: ${config.targetUptime}%)`);
}

/**
 * Check health of all endpoints
 */
async function checkEndpointHealth(config: SLAConfig): Promise<void> {
  const results = await Promise.all(
    config.endpoints.map(async (endpoint) => {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, { 
          method: 'GET',
          headers: { 'X-SLA-Check': 'true' }
        });
        const endTime = Date.now();
        
        return {
          endpoint,
          status: response.status,
          healthy: response.status >= 200 && response.status < 300,
          responseTime: endTime - startTime,
        };
      } catch (error) {
        return {
          endpoint,
          status: 0,
          healthy: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
  
  // Calculate overall health
  const healthyEndpoints = results.filter(r => r.healthy).length;
  const uptimePercentage = (healthyEndpoints / results.length) * 100;
  
  // Track the SLA metric
  trackBusinessMetric('system.uptime', uptimePercentage, {
    timestamp: Date.now(),
    endpointResults: results,
  });
  
  // Check if we need to alert
  if (uptimePercentage < config.alertThreshold) {
    triggerUptimeAlert({
      current: uptimePercentage,
      target: config.targetUptime,
      threshold: config.alertThreshold,
      results,
    });
  }
}

// ==========================================================
// A/B TESTING
// ==========================================================

/**
 * Get the variant for a specific A/B test
 * @param testId The ID of the A/B test
 * @returns The variant assigned to the current user
 */
export function getABTestVariant(testId: string): string {
  // In a real implementation, we would:
  // 1. Check if the user already has an assigned variant (from localStorage/cookie)
  // 2. If not, assign a variant based on the test configuration
  // 3. Store the assignment
  // 4. Return the variant
  
  // For now, we'll use a simple random assignment
  if (typeof window === 'undefined') return 'A'; // Default for SSR
  
  const storageKey = `kazi_abtest_${testId}`;
  let variant = localStorage.getItem(storageKey);
  
  if (!variant) {
    // Simple random assignment between A and B
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(storageKey, variant);
    
    // Track the assignment
    trackEvent({
      name: 'abtest.assignment',
      category: 'user',
      metadata: { testId, variant },
    });
  }
  
  return variant;
}

/**
 * Track a conversion for an A/B test
 */
export function trackABTestConversion(testId: string, conversionType: string, value?: number): void {
  const variant = getABTestVariant(testId);
  
  trackEvent({
    name: 'abtest.conversion',
    category: 'user',
    value,
    metadata: { testId, variant, conversionType },
  });
}

// ==========================================================
// ALERTING SYSTEM
// ==========================================================

/**
 * Trigger a performance alert
 */
function triggerPerformanceAlert(data: {
  metricName: string;
  value: number;
  threshold: number;
  page: string;
}): void {
  const alert = {
    type: 'performance',
    title: `Performance Alert: ${data.metricName} exceeds threshold`,
    message: `${data.metricName} value of ${data.value} exceeds threshold of ${data.threshold} on page ${data.page}`,
    data,
    timestamp: Date.now(),
  };
  
  sendAlert(alert);
}

/**
 * Trigger an error alert
 */
function triggerErrorAlert(errorEvent: ErrorEvent): void {
  const alert = {
    type: 'error',
    title: `Critical Error: ${errorEvent.message.substring(0, 100)}`,
    message: `A critical error occurred: ${errorEvent.message}`,
    data: errorEvent,
    timestamp: Date.now(),
  };
  
  sendAlert(alert);
}

/**
 * Trigger an uptime alert
 */
function triggerUptimeAlert(data: {
  current: number;
  target: number;
  threshold: number;
  results: any[];
}): void {
  const alert = {
    type: 'uptime',
    title: `SLA Alert: Uptime below threshold`,
    message: `Current uptime of ${data.current.toFixed(2)}% is below alert threshold of ${data.threshold}% (target: ${data.target}%)`,
    data,
    timestamp: Date.now(),
  };
  
  sendAlert(alert);
}

/**
 * Send an alert through configured channels
 */
async function sendAlert(alert: any): Promise<void> {
  // Don't send alerts in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('ALERT:', alert);
    return;
  }
  
  try {
    // 1. Send to backend API for logging and dashboard
    await fetch('/api/analytics/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    
    // 2. Send to Slack if configured
    if (DEFAULT_ALERT_CONFIG.slackWebhookUrl) {
      await sendSlackAlert(alert);
    }
    
    // 3. Send email if configured
    if (DEFAULT_ALERT_CONFIG.emailRecipients?.length) {
      await sendEmailAlert(alert);
    }
  } catch (error) {
    console.error('Failed to send alert:', error);
  }
}

/**
 * Send an alert to Slack
 */
async function sendSlackAlert(alert: any): Promise<void> {
  if (!DEFAULT_ALERT_CONFIG.slackWebhookUrl) return;
  
  try {
    await fetch(DEFAULT_ALERT_CONFIG.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *${alert.title}*\n${alert.message}\n\`\`\`${JSON.stringify(alert.data, null, 2)}\`\`\``,
      }),
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

/**
 * Send an alert via email
 */
async function sendEmailAlert(alert: any): Promise<void> {
  if (!DEFAULT_ALERT_CONFIG.emailRecipients?.length) return;
  
  try {
    await fetch('/api/analytics/email-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: DEFAULT_ALERT_CONFIG.emailRecipients,
        subject: alert.title,
        body: `${alert.message}\n\n${JSON.stringify(alert.data, null, 2)}`,
      }),
    });
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}

// ==========================================================
// ANALYTICS DASHBOARD HOOKS
// ==========================================================

/**
 * Hook to get real-time Core Web Vitals metrics
 */
export function useCoreWebVitals(refreshInterval = 60000) {
  const [metrics, setMetrics] = useState<Partial<CoreWebVitals>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/core-web-vitals');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Core Web Vitals: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchMetrics();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(fetchMetrics, refreshInterval);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  return { metrics, loading, error };
}

/**
 * Hook to get business metrics over time
 */
export function useBusinessMetrics(
  metricNames: string[],
  dateRange: string = '7d',
  refreshInterval = 60000
) {
  const [metrics, setMetrics] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/business-metrics?metrics=${metricNames.join(',')}&range=${dateRange}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch business metrics: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchMetrics();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(fetchMetrics, refreshInterval);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [metricNames, dateRange, refreshInterval]);
  
  return { metrics, loading, error };
}

/**
 * Hook to get current SLA status
 */
export function useSLAStatus(refreshInterval = 60000) {
  const [status, setStatus] = useState<{
    currentUptime: number;
    targetUptime: number;
    endpointStatuses: Record<string, { healthy: boolean; responseTime: number }>;
    lastChecked: Date;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics/sla-status');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch SLA status: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchStatus();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(fetchStatus, refreshInterval);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refreshInterval]);
  
  return { status, loading, error };
}

/**
 * Hook to get recent alerts
 */
export function useRecentAlerts(limit = 10, refreshInterval = 60000) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/alerts?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch alerts: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setAlerts(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchAlerts();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(fetchAlerts, refreshInterval);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [limit, refreshInterval]);
  
  return { alerts, loading, error };
}

// ==========================================================
// EXPORT DEFAULT CONFIG
// ==========================================================

export default {
  init: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      inject({ debug: false });
      initWebVitalsReporting();
      initSLAMonitoring(DEFAULT_SLA_CONFIG);
      console.log('KAZI Analytics: Production analytics initialized');
    }
  },
  trackEvent,
  trackBusinessMetric,
  trackJourneyStep,
  trackError,
  getABTestVariant,
  trackABTestConversion,
};
