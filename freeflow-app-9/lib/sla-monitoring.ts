import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Service health status
 */
export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance' | 'unknown';

/**
 * Service health check result
 */
export interface HealthCheckResult {
  serviceId: string;
  serviceName: string;
  status: ServiceStatus;
  responseTimeMs: number;
  timestamp: Date;
  message?: string;
  error?: Error | null;
  metadata?: Record<string, any>;
}

/**
 * Service dependency
 */
export interface ServiceDependency {
  serviceId: string;
  dependsOn: string[];
  criticality: 'critical' | 'high' | 'medium' | 'low';
  failureImpact: string;
  failoverAvailable: boolean;
  failoverProcess?: string;
}

/**
 * SLA definition
 */
export interface SLADefinition {
  serviceId: string;
  name: string;
  description: string;
  targetUptime: number; // e.g., 99.9
  targetResponseTimeMs: number;
  errorBudget: number; // percentage of allowed downtime
  evaluationPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  excludedPeriods?: {
    start: Date;
    end: Date;
    reason: string;
  }[];
  dependencies?: string[]; // serviceIds
}

/**
 * SLA compliance status
 */
export interface SLAComplianceStatus {
  serviceId: string;
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  targetUptime: number;
  actualUptime: number;
  compliant: boolean;
  downtime: {
    total: number; // in milliseconds
    planned: number;
    unplanned: number;
  };
  incidents: string[]; // incident IDs
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  errorBudget: {
    total: number; // in milliseconds
    used: number;
    remaining: number;
    percentRemaining: number;
  };
}

/**
 * Incident severity levels
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Incident status
 */
export type IncidentStatus = 
  | 'investigating' 
  | 'identified' 
  | 'monitoring' 
  | 'resolved' 
  | 'scheduled' 
  | 'in_progress' 
  | 'verifying' 
  | 'completed';

/**
 * Incident update
 */
export interface IncidentUpdate {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  message: string;
  createdAt: Date;
  createdBy: string;
  affectedComponents?: string[];
  isPublic: boolean;
}

/**
 * Service incident
 */
export interface ServiceIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  serviceId: string;
  componentId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  detectedBy: 'automatic' | 'manual';
  detectionSource?: string;
  assignedTo?: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  updates: IncidentUpdate[];
  impactedServices: string[];
  rootCause?: string;
  resolution?: string;
  postMortemUrl?: string;
  tags: string[];
  isPublic: boolean;
  notifiedUsers: boolean;
  metadata?: Record<string, any>;
}

/**
 * Alert notification channel
 */
export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'pagerduty';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  throttling?: {
    maxAlerts: number;
    periodMinutes: number;
  };
  templates?: {
    incident: string;
    resolution: string;
    update: string;
  };
}

/**
 * Alert notification
 */
export interface AlertNotification {
  id: string;
  channelId: string;
  incidentId?: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
  retryCount: number;
  metadata?: Record<string, any>;
}

/**
 * Alert escalation policy
 */
export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  steps: {
    level: number;
    waitMinutes: number;
    notifyChannels: string[]; // channel IDs
    notifyUsers?: string[]; // user IDs
  }[];
  repeatTimes?: number;
  repeatIntervalMinutes?: number;
  autoEscalateAfterMinutes?: number;
}

/**
 * Performance metric types
 */
export type MetricType = 
  | 'responseTime' 
  | 'errorRate' 
  | 'throughput' 
  | 'cpuUsage' 
  | 'memoryUsage' 
  | 'diskUsage' 
  | 'activeUsers' 
  | 'requestCount' 
  | 'customMetric';

/**
 * Performance metric data point
 */
export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

/**
 * Performance metric series
 */
export interface MetricSeries {
  id: string;
  serviceId: string;
  metricType: MetricType;
  name: string;
  unit: string;
  description?: string;
  data: MetricDataPoint[];
  metadata?: Record<string, any>;
}

/**
 * Performance threshold
 */
export interface PerformanceThreshold {
  id: string;
  serviceId: string;
  metricType: MetricType;
  metricName?: string;
  warning: number;
  critical: number;
  evaluationPeriod: number; // in minutes
  evaluationSamples: number;
  operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
  enabled: boolean;
}

/**
 * Uptime check configuration
 */
export interface UptimeCheckConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'HEAD';
  headers?: Record<string, string>;
  body?: string;
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
  expectedStatusCode?: number;
  expectedResponseContent?: string;
  timeoutMs: number;
  intervalMinutes: number;
  regions: string[];
  tags: string[];
  enabled: boolean;
  alertOnFailure: boolean;
  alertChannels: string[]; // channel IDs
  retries: number;
  serviceId: string;
}

/**
 * Uptime check result
 */
export interface UptimeCheckResult {
  id: string;
  checkId: string;
  timestamp: Date;
  success: boolean;
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
  region: string;
  responseSize?: number;
  metadata?: Record<string, any>;
}

/**
 * Status page component
 */
export interface StatusPageComponent {
  id: string;
  name: string;
  description?: string;
  status: ServiceStatus;
  serviceIds: string[];
  order: number;
  isPublic: boolean;
  groupId?: string;
}

/**
 * Status page configuration
 */
export interface StatusPageConfig {
  title: string;
  description?: string;
  logo?: string;
  favicon?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  components: StatusPageComponent[];
  showIncidents: boolean;
  showUptime: boolean;
  showResponseTime: boolean;
  customDomain?: string;
  googleAnalyticsId?: string;
  subscriberNotifications: boolean;
  automatedUpdates: boolean;
}

/**
 * SLA monitoring configuration
 */
export interface SLAMonitoringConfig {
  enabled: boolean;
  services: {
    id: string;
    name: string;
    description?: string;
    type: 'api' | 'web' | 'database' | 'cache' | 'queue' | 'worker' | 'custom';
    endpoint?: string;
    healthCheckEndpoint?: string;
    owner?: string;
    tags: string[];
    isPublic: boolean;
    sla?: SLADefinition;
    dependencies?: ServiceDependency[];
  }[];
  uptimeChecks: UptimeCheckConfig[];
  alertChannels: AlertChannel[];
  escalationPolicies: EscalationPolicy[];
  performanceThresholds: PerformanceThreshold[];
  statusPage: StatusPageConfig;
  sentry: {
    enabled: boolean;
    dsn?: string;
    environment?: string;
    tracesSampleRate?: number;
    integrations?: any[];
  };
  upptime: {
    enabled: boolean;
    repo?: string;
    apiKey?: string;
    workflowsEnabled?: boolean;
    commitMessages?: {
      readmeUpdate?: string;
      summaryUpdate?: string;
      statusChange?: string;
      graphUpdate?: string;
    };
  };
  vercel: {
    enabled: boolean;
    token?: string;
    teamId?: string;
    projectId?: string;
  };
  reporting: {
    dailyReportEnabled: boolean;
    weeklyReportEnabled: boolean;
    monthlyReportEnabled: boolean;
    recipients: string[];
    includeIncidents: boolean;
    includePerformance: boolean;
    includeSLAStatus: boolean;
  };
  notifications: {
    incidentCreated: boolean;
    incidentUpdated: boolean;
    incidentResolved: boolean;
    slaBreached: boolean;
    performanceThresholdExceeded: boolean;
    dailyDigest: boolean;
  };
  retentionDays: {
    uptimeResults: number;
    incidents: number;
    metrics: number;
    alerts: number;
  };
}

// ==========================================================
// DEFAULT CONFIGURATION
// ==========================================================

/**
 * Default SLA monitoring configuration
 */
export const DEFAULT_SLA_MONITORING_CONFIG: SLAMonitoringConfig = {
  enabled: true,
  services: [
    {
      id: 'kazi-web',
      name: 'KAZI Web Application',
      description: 'Main KAZI web application',
      type: 'web',
      endpoint: 'https://kazi.app',
      healthCheckEndpoint: '/api/health',
      owner: 'web-team@kazi.app',
      tags: ['production', 'customer-facing', 'core'],
      isPublic: true,
      sla: {
        serviceId: 'kazi-web',
        name: 'KAZI Web SLA',
        description: 'Service Level Agreement for KAZI Web Application',
        targetUptime: 99.9,
        targetResponseTimeMs: 500,
        errorBudget: 0.1, // 0.1% error budget (99.9% uptime)
        evaluationPeriod: 'monthly',
      },
      dependencies: [
        {
          serviceId: 'kazi-web',
          dependsOn: ['kazi-api', 'kazi-auth', 'kazi-db'],
          criticality: 'critical',
          failureImpact: 'Complete service unavailability',
          failoverAvailable: false,
        }
      ],
    },
    {
      id: 'kazi-api',
      name: 'KAZI API',
      description: 'Core API services',
      type: 'api',
      endpoint: 'https://api.kazi.app',
      healthCheckEndpoint: '/health',
      owner: 'backend-team@kazi.app',
      tags: ['production', 'api', 'core'],
      isPublic: true,
      sla: {
        serviceId: 'kazi-api',
        name: 'KAZI API SLA',
        description: 'Service Level Agreement for KAZI API',
        targetUptime: 99.95,
        targetResponseTimeMs: 200,
        errorBudget: 0.05, // 0.05% error budget (99.95% uptime)
        evaluationPeriod: 'monthly',
      },
      dependencies: [
        {
          serviceId: 'kazi-api',
          dependsOn: ['kazi-db', 'kazi-cache'],
          criticality: 'critical',
          failureImpact: 'API unavailability affecting all services',
          failoverAvailable: true,
          failoverProcess: 'Automatic failover to secondary region',
        }
      ],
    },
    {
      id: 'kazi-db',
      name: 'KAZI Database',
      description: 'Primary database',
      type: 'database',
      owner: 'infra-team@kazi.app',
      tags: ['production', 'database', 'core'],
      isPublic: false,
      sla: {
        serviceId: 'kazi-db',
        name: 'KAZI Database SLA',
        description: 'Service Level Agreement for KAZI Database',
        targetUptime: 99.99,
        targetResponseTimeMs: 100,
        errorBudget: 0.01, // 0.01% error budget (99.99% uptime)
        evaluationPeriod: 'monthly',
      },
    },
    {
      id: 'kazi-auth',
      name: 'KAZI Authentication',
      description: 'Authentication services',
      type: 'api',
      endpoint: 'https://auth.kazi.app',
      healthCheckEndpoint: '/health',
      owner: 'security-team@kazi.app',
      tags: ['production', 'auth', 'security'],
      isPublic: true,
      sla: {
        serviceId: 'kazi-auth',
        name: 'KAZI Auth SLA',
        description: 'Service Level Agreement for KAZI Authentication',
        targetUptime: 99.95,
        targetResponseTimeMs: 300,
        errorBudget: 0.05, // 0.05% error budget (99.95% uptime)
        evaluationPeriod: 'monthly',
      },
    },
    {
      id: 'kazi-cache',
      name: 'KAZI Cache',
      description: 'Redis cache layer',
      type: 'cache',
      owner: 'infra-team@kazi.app',
      tags: ['production', 'cache', 'infrastructure'],
      isPublic: false,
      sla: {
        serviceId: 'kazi-cache',
        name: 'KAZI Cache SLA',
        description: 'Service Level Agreement for KAZI Cache',
        targetUptime: 99.9,
        targetResponseTimeMs: 50,
        errorBudget: 0.1, // 0.1% error budget (99.9% uptime)
        evaluationPeriod: 'monthly',
      },
    },
  ],
  uptimeChecks: [
    {
      id: 'kazi-web-check',
      name: 'KAZI Web Check',
      url: 'https://kazi.app',
      method: 'GET',
      timeoutMs: 10000,
      intervalMinutes: 1,
      regions: ['us-east1', 'eu-west1', 'ap-southeast1'],
      tags: ['production', 'customer-facing'],
      enabled: true,
      alertOnFailure: true,
      alertChannels: ['slack-ops', 'email-ops'],
      retries: 3,
      serviceId: 'kazi-web',
    },
    {
      id: 'kazi-api-check',
      name: 'KAZI API Check',
      url: 'https://api.kazi.app/health',
      method: 'GET',
      headers: {
        'X-API-Key': '${KAZI_API_HEALTH_KEY}',
      },
      timeoutMs: 5000,
      intervalMinutes: 1,
      regions: ['us-east1', 'eu-west1', 'ap-southeast1'],
      tags: ['production', 'api'],
      enabled: true,
      alertOnFailure: true,
      alertChannels: ['slack-ops', 'pagerduty-api'],
      retries: 3,
      serviceId: 'kazi-api',
    },
    {
      id: 'kazi-auth-check',
      name: 'KAZI Auth Check',
      url: 'https://auth.kazi.app/health',
      method: 'GET',
      timeoutMs: 5000,
      intervalMinutes: 1,
      regions: ['us-east1', 'eu-west1'],
      tags: ['production', 'auth'],
      enabled: true,
      alertOnFailure: true,
      alertChannels: ['slack-ops', 'pagerduty-auth'],
      retries: 3,
      serviceId: 'kazi-auth',
    },
  ],
  alertChannels: [
    {
      id: 'slack-ops',
      type: 'slack',
      name: 'Ops Team Slack',
      config: {
        webhookUrl: '${SLACK_OPS_WEBHOOK_URL}',
        channel: '#ops-alerts',
        username: 'KAZI SLA Monitor',
      },
      enabled: true,
      throttling: {
        maxAlerts: 10,
        periodMinutes: 5,
      },
      templates: {
        incident: '🚨 *{severity}* incident: {title}\n>{description}\n<{incidentUrl}|View details>',
        resolution: '✅ Incident resolved: {title}\n>{resolution}\nDuration: {duration}',
        update: '📝 Incident update: {title}\nStatus: {status}\n>{message}',
      },
    },
    {
      id: 'email-ops',
      type: 'email',
      name: 'Ops Team Email',
      config: {
        recipients: ['ops@kazi.app', 'oncall@kazi.app'],
        fromEmail: 'monitoring@kazi.app',
        fromName: 'KAZI SLA Monitor',
      },
      enabled: true,
    },
    {
      id: 'pagerduty-api',
      type: 'pagerduty',
      name: 'PagerDuty - API Team',
      config: {
        integrationKey: '${PAGERDUTY_API_KEY}',
        serviceId: 'P123456',
      },
      enabled: true,
    },
    {
      id: 'pagerduty-auth',
      type: 'pagerduty',
      name: 'PagerDuty - Auth Team',
      config: {
        integrationKey: '${PAGERDUTY_AUTH_KEY}',
        serviceId: 'P234567',
      },
      enabled: true,
    },
    {
      id: 'sms-critical',
      type: 'sms',
      name: 'SMS - Critical Alerts',
      config: {
        provider: 'twilio',
        accountSid: '${TWILIO_ACCOUNT_SID}',
        authToken: '${TWILIO_AUTH_TOKEN}',
        fromNumber: '${TWILIO_FROM_NUMBER}',
        toNumbers: ['${ONCALL_PHONE_1}', '${ONCALL_PHONE_2}'],
      },
      enabled: true,
      throttling: {
        maxAlerts: 3,
        periodMinutes: 60,
      },
    },
  ],
  escalationPolicies: [
    {
      id: 'standard-escalation',
      name: 'Standard Escalation Policy',
      description: 'Default escalation for most incidents',
      steps: [
        {
          level: 1,
          waitMinutes: 15,
          notifyChannels: ['slack-ops'],
        },
        {
          level: 2,
          waitMinutes: 15,
          notifyChannels: ['email-ops', 'slack-ops'],
        },
        {
          level: 3,
          waitMinutes: 30,
          notifyChannels: ['pagerduty-api', 'slack-ops'],
        },
      ],
      repeatTimes: 3,
      repeatIntervalMinutes: 60,
    },
    {
      id: 'critical-escalation',
      name: 'Critical Escalation Policy',
      description: 'Escalation for critical services',
      steps: [
        {
          level: 1,
          waitMinutes: 5,
          notifyChannels: ['slack-ops', 'email-ops'],
        },
        {
          level: 2,
          waitMinutes: 10,
          notifyChannels: ['pagerduty-api', 'slack-ops'],
        },
        {
          level: 3,
          waitMinutes: 15,
          notifyChannels: ['sms-critical', 'pagerduty-api', 'slack-ops'],
        },
      ],
      repeatTimes: 5,
      repeatIntervalMinutes: 30,
      autoEscalateAfterMinutes: 15,
    },
  ],
  performanceThresholds: [
    {
      id: 'web-response-time',
      serviceId: 'kazi-web',
      metricType: 'responseTime',
      warning: 800, // ms
      critical: 1500, // ms
      evaluationPeriod: 5, // minutes
      evaluationSamples: 5,
      operator: '>',
      enabled: true,
    },
    {
      id: 'api-response-time',
      serviceId: 'kazi-api',
      metricType: 'responseTime',
      warning: 300, // ms
      critical: 800, // ms
      evaluationPeriod: 5, // minutes
      evaluationSamples: 5,
      operator: '>',
      enabled: true,
    },
    {
      id: 'api-error-rate',
      serviceId: 'kazi-api',
      metricType: 'errorRate',
      warning: 1, // 1%
      critical: 5, // 5%
      evaluationPeriod: 5, // minutes
      evaluationSamples: 5,
      operator: '>',
      enabled: true,
    },
  ],
  statusPage: {
    title: 'KAZI Status',
    description: 'Current status of KAZI services',
    logo: 'https://kazi.app/logo.png',
    favicon: 'https://kazi.app/favicon.ico',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
    components: [
      {
        id: 'web-component',
        name: 'KAZI Web Application',
        description: 'Main web application and dashboard',
        status: 'operational',
        serviceIds: ['kazi-web'],
        order: 1,
        isPublic: true,
      },
      {
        id: 'api-component',
        name: 'KAZI API',
        description: 'Core API services',
        status: 'operational',
        serviceIds: ['kazi-api'],
        order: 2,
        isPublic: true,
      },
      {
        id: 'auth-component',
        name: 'Authentication',
        description: 'User authentication services',
        status: 'operational',
        serviceIds: ['kazi-auth'],
        order: 3,
        isPublic: true,
      },
    ],
    showIncidents: true,
    showUptime: true,
    showResponseTime: true,
    customDomain: 'status.kazi.app',
    googleAnalyticsId: 'G-XXXXXXXXXX',
    subscriberNotifications: true,
    automatedUpdates: true,
  },
  sentry: {
    enabled: true,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
    integrations: [],
  },
  upptime: {
    enabled: true,
    repo: 'kazi-status',
    apiKey: process.env.GITHUB_API_KEY,
    workflowsEnabled: true,
    commitMessages: {
      readmeUpdate: '📝 Update status page summary [skip ci]',
      summaryUpdate: '🔄 Update status summary [skip ci]',
      statusChange: '🟩 ${service} is up (${duration}ms)',
      graphUpdate: '📈 Update response time graphs [skip ci]',
    },
  },
  vercel: {
    enabled: true,
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
  },
  reporting: {
    dailyReportEnabled: true,
    weeklyReportEnabled: true,
    monthlyReportEnabled: true,
    recipients: ['ops@kazi.app', 'engineering@kazi.app'],
    includeIncidents: true,
    includePerformance: true,
    includeSLAStatus: true,
  },
  notifications: {
    incidentCreated: true,
    incidentUpdated: true,
    incidentResolved: true,
    slaBreached: true,
    performanceThresholdExceeded: true,
    dailyDigest: true,
  },
  retentionDays: {
    uptimeResults: 90,
    incidents: 365,
    metrics: 90,
    alerts: 90,
  },
};

// Supabase client for database operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ==========================================================
// INITIALIZATION AND CORE FUNCTIONALITY
// ==========================================================

/**
 * Initialize SLA monitoring system
 */
export function initSLAMonitoring(config?: Partial<SLAMonitoringConfig>): void {
  const mergedConfig: SLAMonitoringConfig = {
    ...DEFAULT_SLA_MONITORING_CONFIG,
    ...config,
    services: [
      ...DEFAULT_SLA_MONITORING_CONFIG.services,
      ...(config?.services || []),
    ],
  };

  // Only initialize if enabled
  if (!mergedConfig.enabled) {
    console.log('SLA monitoring is disabled');
    return;
  }

  console.log('Initializing KAZI SLA monitoring system...');

  // Initialize Sentry if enabled
  if (mergedConfig.sentry.enabled && mergedConfig.sentry.dsn) {
    initSentry(mergedConfig.sentry);
  }

  // Initialize Upptime if enabled
  if (mergedConfig.upptime.enabled) {
    initUpptime(mergedConfig.upptime);
  }

  // Schedule uptime checks
  scheduleUptimeChecks(mergedConfig.uptimeChecks);

  // Schedule SLA compliance checks
  scheduleSLAComplianceChecks(mergedConfig.services);

  // Schedule performance metric collection
  schedulePerformanceMetricCollection(mergedConfig.services);

  // Schedule reporting
  scheduleReporting(mergedConfig.reporting);

  console.log('KAZI SLA monitoring system initialized');
}

/**
 * Initialize Sentry error monitoring
 */
function initSentry(config: SLAMonitoringConfig['sentry']): void {
  if (!config.dsn) {
    console.warn('Sentry DSN not provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment || process.env.NODE_ENV,
    tracesSampleRate: config.tracesSampleRate || 0.1,
    integrations: config.integrations || [],
    // Enable performance monitoring
    enableTracing: true,
    // Send user feedback
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log('Sentry initialized for error monitoring');
}

/**
 * Initialize Upptime status page
 */
function initUpptime(config: SLAMonitoringConfig['upptime']): void {
  if (!config.repo || !config.apiKey) {
    console.warn('Upptime configuration incomplete, skipping initialization');
    return;
  }

  // In a real implementation, this would set up the Upptime GitHub repository
  // and configure the necessary workflows. For now, we'll just log the intent.
  console.log(`Upptime initialized for status page: ${config.repo}`);
}

/**
 * Schedule uptime checks
 */
function scheduleUptimeChecks(checks: UptimeCheckConfig[]): void {
  // In a production environment, this would set up cron jobs or scheduled tasks
  // For this implementation, we'll just log the intent
  console.log(`Scheduling ${checks.length} uptime checks`);
  
  checks.forEach(check => {
    if (check.enabled) {
      console.log(`Scheduled check for ${check.name} (${check.url}) every ${check.intervalMinutes} minutes`);
      
      // In a real implementation, we would set up a scheduler
      // For demonstration, we'll set up a simple interval for the first check
      if (typeof setInterval !== 'undefined' && checks.indexOf(check) === 0) {
        setInterval(() => {
          performUptimeCheck(check);
        }, check.intervalMinutes * 60 * 1000);
      }
    }
  });
}

/**
 * Schedule SLA compliance checks
 */
function scheduleSLAComplianceChecks(services: SLAMonitoringConfig['services']): void {
  // Filter services with SLA definitions
  const servicesWithSLA = services.filter(service => service.sla);
  
  console.log(`Scheduling SLA compliance checks for ${servicesWithSLA.length} services`);
  
  // In a real implementation, this would set up scheduled tasks to evaluate SLA compliance
  // For now, we'll just log the intent
  servicesWithSLA.forEach(service => {
    console.log(`Scheduled SLA compliance check for ${service.name} (${service.id}) - Target: ${service.sla?.targetUptime}%`);
  });
  
  // Schedule a daily SLA compliance check
  if (typeof setInterval !== 'undefined') {
    // Run once a day
    setInterval(() => {
      evaluateSLACompliance();
    }, 24 * 60 * 60 * 1000);
  }
}

/**
 * Schedule performance metric collection
 */
function schedulePerformanceMetricCollection(services: SLAMonitoringConfig['services']): void {
  console.log(`Scheduling performance metric collection for ${services.length} services`);
  
  // In a real implementation, this would set up metric collectors
  // For now, we'll just log the intent
  services.forEach(service => {
    console.log(`Scheduled performance metric collection for ${service.name} (${service.id})`);
  });
  
  // Schedule regular metric collection
  if (typeof setInterval !== 'undefined') {
    // Run every minute
    setInterval(() => {
      collectPerformanceMetrics();
    }, 60 * 1000);
  }
}

/**
 * Schedule reporting
 */
function scheduleReporting(config: SLAMonitoringConfig['reporting']): void {
  console.log('Scheduling SLA reports');
  
  if (config.dailyReportEnabled) {
    console.log('Scheduled daily SLA report');
    // In a real implementation, this would set up a daily cron job
  }
  
  if (config.weeklyReportEnabled) {
    console.log('Scheduled weekly SLA report');
    // In a real implementation, this would set up a weekly cron job
  }
  
  if (config.monthlyReportEnabled) {
    console.log('Scheduled monthly SLA report');
    // In a real implementation, this would set up a monthly cron job
  }
}

// ==========================================================
// UPTIME MONITORING
// ==========================================================

/**
 * Perform an uptime check
 */
export async function performUptimeCheck(check: UptimeCheckConfig): Promise<UptimeCheckResult> {
  console.log(`Performing uptime check: ${check.name} (${check.url})`);
  
  const startTime = Date.now();
  const checkId = `check_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  try {
    // Set up request config
    const config: any = {
      method: check.method,
      url: check.url,
      timeout: check.timeoutMs,
      headers: check.headers || {},
      validateStatus: (status: number) => {
        return check.expectedStatusCode ? status === check.expectedStatusCode : status >= 200 && status < 500;
      },
    };
    
    // Add body if provided and method is not GET or HEAD
    if (check.body && check.method !== 'GET' && check.method !== 'HEAD') {
      config.data = check.body;
    }
    
    // Add auth if provided
    if (check.auth) {
      if (check.auth.username && check.auth.password) {
        config.auth = {
          username: check.auth.username,
          password: check.auth.password,
        };
      } else if (check.auth.token) {
        config.headers.Authorization = `Bearer ${check.auth.token}`;
      }
    }
    
    // Perform the request
    const response = await axios(config);
    
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    // Check for expected response content if specified
    let success = true;
    if (check.expectedResponseContent && !response.data.includes(check.expectedResponseContent)) {
      success = false;
    }
    
    const result: UptimeCheckResult = {
      id: checkId,
      checkId: check.id,
      timestamp: new Date(),
      success,
      responseTimeMs,
      statusCode: response.status,
      region: 'default', // In a real implementation, this would be the actual region
      responseSize: typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data).length,
    };
    
    // Log the result
    console.log(`Uptime check result: ${check.name} - ${success ? 'Success' : 'Failure'} (${responseTimeMs}ms)`);
    
    // Store the result
    await storeUptimeResult(result);
    
    // Check for failures and trigger alerts if needed
    if (!success && check.alertOnFailure) {
      await handleUptimeCheckFailure(check, result);
    }
    
    // Update status page component if applicable
    await updateStatusPageComponent(check.serviceId, success ? 'operational' : 'degraded');
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    
    const result: UptimeCheckResult = {
      id: checkId,
      checkId: check.id,
      timestamp: new Date(),
      success: false,
      responseTimeMs,
      errorMessage: error instanceof Error ? error.message : String(error),
      region: 'default', // In a real implementation, this would be the actual region
    };
    
    // Log the error
    console.error(`Uptime check failed: ${check.name} - ${result.errorMessage}`);
    
    // Store the result
    await storeUptimeResult(result);
    
    // Trigger alerts if needed
    if (check.alertOnFailure) {
      await handleUptimeCheckFailure(check, result);
    }
    
    // Update status page component if applicable
    await updateStatusPageComponent(check.serviceId, 'degraded');
    
    return result;
  }
}

/**
 * Store uptime check result
 */
async function storeUptimeResult(result: UptimeCheckResult): Promise<void> {
  try {
    // In a production environment, this would store the result in a database
    // For now, we'll just log it
    console.log('Storing uptime check result:', result);
    
    // Example of storing in Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('uptime_results')
        .insert([result]);
      
      if (error) {
        console.error('Error storing uptime result:', error);
      }
    }
  } catch (error) {
    console.error('Failed to store uptime result:', error);
  }
}

/**
 * Handle uptime check failure
 */
async function handleUptimeCheckFailure(check: UptimeCheckConfig, result: UptimeCheckResult): Promise<void> {
  try {
    console.log(`Handling uptime check failure for ${check.name}`);
    
    // Check if we should retry
    if (check.retries > 0) {
      console.log(`Retrying uptime check for ${check.name} (${check.retries} retries left)`);
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry the check with one less retry
      const retryCheck = { ...check, retries: check.retries - 1 };
      const retryResult = await performUptimeCheck(retryCheck);
      
      // If retry succeeded, we're done
      if (retryResult.success) {
        console.log(`Uptime check retry succeeded for ${check.name}`);
        return;
      }
    }
    
    // If we get here, the check has failed after all retries
    console.log(`Uptime check failed after retries for ${check.name}, creating incident`);
    
    // Create an incident
    const incident = await createIncident({
      title: `${check.name} is down`,
      description: `Uptime check for ${check.name} (${check.url}) has failed. Error: ${result.errorMessage || `Status code: ${result.statusCode}`}`,
      severity: 'high',
      serviceId: check.serviceId,
      detectedBy: 'automatic',
      detectionSource: 'uptime-check',
      isPublic: true,
      notifiedUsers: false,
    });
    
    // Send alerts
    for (const channelId of check.alertChannels) {
      await sendAlert({
        channelId,
        title: `🔴 ${check.name} is down`,
        message: `Uptime check for ${check.name} (${check.url}) has failed.\nError: ${result.errorMessage || `Status code: ${result.statusCode}`}\nTime: ${result.timestamp.toISOString()}`,
        severity: 'high',
        incidentId: incident.id,
      });
    }
  } catch (error) {
    console.error('Error handling uptime check failure:', error);
  }
}

/**
 * Update status page component
 */
async function updateStatusPageComponent(serviceId: string, status: ServiceStatus): Promise<void> {
  try {
    // In a production environment, this would update the status page component
    // For now, we'll just log it
    console.log(`Updating status page component for service ${serviceId} to ${status}`);
    
    // Update Upptime status
    if (DEFAULT_SLA_MONITORING_CONFIG.upptime.enabled) {
      await updateUpptimeStatus(serviceId, status);
    }
  } catch (error) {
    console.error('Error updating status page component:', error);
  }
}

/**
 * Update Upptime status
 */
async function updateUpptimeStatus(serviceId: string, status: ServiceStatus): Promise<void> {
  // In a real implementation, this would update the Upptime status via GitHub API
  console.log(`Updating Upptime status for ${serviceId} to ${status}`);
}

// ==========================================================
// SLA COMPLIANCE MONITORING
// ==========================================================

/**
 * Evaluate SLA compliance for all services
 */
export async function evaluateSLACompliance(): Promise<Record<string, SLAComplianceStatus>> {
  console.log('Evaluating SLA compliance for all services');
  
  const results: Record<string, SLAComplianceStatus> = {};
  
  try {
    // Get all services with SLA definitions
    const services = DEFAULT_SLA_MONITORING_CONFIG.services.filter(service => service.sla);
    
    // Evaluate each service
    for (const service of services) {
      if (!service.sla) continue;
      
      const result = await evaluateServiceSLA(service.id, service.sla);
      results[service.id] = result;
      
      // Check for SLA breaches
      if (!result.compliant) {
        await handleSLABreach(service, result);
      }
    }
    
    // Store the compliance results
    await storeComplianceResults(results);
    
    return results;
  } catch (error) {
    console.error('Error evaluating SLA compliance:', error);
    return results;
  }
}

/**
 * Evaluate SLA compliance for a specific service
 */
async function evaluateServiceSLA(serviceId: string, sla: SLADefinition): Promise<SLAComplianceStatus> {
  console.log(`Evaluating SLA compliance for service ${serviceId}`);
  
  try {
    // In a production environment, this would fetch real uptime data from the database
    // For now, we'll simulate it
    
    // Calculate period start and end dates
    const now = new Date();
    let periodStart: Date;
    let periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = sla.evaluationPeriod;
    
    switch (sla.evaluationPeriod) {
      case 'daily':
        periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - 1);
        break;
      case 'weekly':
        periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'monthly':
        periodStart = new Date(now);
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case 'quarterly':
        periodStart = new Date(now);
        periodStart.setMonth(periodStart.getMonth() - 3);
        break;
      case 'yearly':
        periodStart = new Date(now);
        periodStart.setFullYear(periodStart.getFullYear() - 1);
        break;
    }
    
    // Simulate uptime data
    // In a real implementation, this would be fetched from the database
    const simulatedUptimePercentage = Math.random() * 2 + 98; // Random between 98% and 100%
    const simulatedDowntimeMs = (100 - simulatedUptimePercentage) / 100 * (now.getTime() - periodStart.getTime());
    
    // Calculate error budget
    const totalPeriodMs = now.getTime() - periodStart.getTime();
    const errorBudgetMs = totalPeriodMs * (sla.errorBudget / 100);
    const errorBudgetUsedMs = simulatedDowntimeMs;
    const errorBudgetRemainingMs = Math.max(0, errorBudgetMs - errorBudgetUsedMs);
    const errorBudgetRemainingPercent = (errorBudgetRemainingMs / errorBudgetMs) * 100;
    
    // Simulate response time data
    const avgResponseTime = Math.random() * sla.targetResponseTimeMs * 0.8 + sla.targetResponseTimeMs * 0.2; // Random between 20% and 100% of target
    const p95ResponseTime = avgResponseTime * 1.5;
    const p99ResponseTime = avgResponseTime * 2;
    
    // Simulate error rate
    const errorRate = Math.random() * 1; // Random between 0% and 1%
    
    // Determine compliance
    const compliant = simulatedUptimePercentage >= sla.targetUptime;
    
    // Create compliance status
    const complianceStatus: SLAComplianceStatus = {
      serviceId,
      period: {
        start: periodStart,
        end: now,
        type: periodType,
      },
      targetUptime: sla.targetUptime,
      actualUptime: simulatedUptimePercentage,
      compliant,
      downtime: {
        total: simulatedDowntimeMs,
        planned: 0, // In a real implementation, this would be calculated from planned maintenance
        unplanned: simulatedDowntimeMs,
      },
      incidents: [], // In a real implementation, this would be populated with actual incidents
      responseTime: {
        average: avgResponseTime,
        p95: p95ResponseTime,
        p99: p99ResponseTime,
      },
      errorRate,
      errorBudget: {
        total: errorBudgetMs,
        used: errorBudgetUsedMs,
        remaining: errorBudgetRemainingMs,
        percentRemaining: errorBudgetRemainingPercent,
      },
    };
    
    return complianceStatus;
  } catch (error) {
    console.error(`Error evaluating SLA for service ${serviceId}:`, error);
    
    // Return a default non-compliant status in case of error
    return {
      serviceId,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
        type: sla.evaluationPeriod,
      },
      targetUptime: sla.targetUptime,
      actualUptime: 0,
      compliant: false,
      downtime: {
        total: 0,
        planned: 0,
        unplanned: 0,
      },
      incidents: [],
      responseTime: {
        average: 0,
        p95: 0,
        p99: 0,
      },
      errorRate: 0,
      errorBudget: {
        total: 0,
        used: 0,
        remaining: 0,
        percentRemaining: 0,
      },
    };
  }
}

/**
 * Handle SLA breach
 */
async function handleSLABreach(service: SLAMonitoringConfig['services'][0], status: SLAComplianceStatus): Promise<void> {
  console.log(`Handling SLA breach for service ${service.id}`);
  
  try {
    // Create an incident for the SLA breach
    const incident = await createIncident({
      title: `SLA Breach: ${service.name}`,
      description: `Service ${service.name} has breached its SLA. Target uptime: ${status.targetUptime}%, Actual uptime: ${status.actualUptime.toFixed(2)}%`,
      severity: 'high',
      serviceId: service.id,
      detectedBy: 'automatic',
      detectionSource: 'sla-monitoring',
      isPublic: false, // SLA breaches are typically internal
      notifiedUsers: false,
    });
    
    // Send alerts to appropriate channels
    // In a real implementation, this would use the configured alert channels
    await sendAlert({
      channelId: 'slack-ops',
      title: `🚨 SLA Breach: ${service.name}`,
      message: `Service ${service.name} has breached its SLA.\nTarget uptime: ${status.targetUptime}%\nActual uptime: ${status.actualUptime.toFixed(2)}%\nPeriod: ${status.period.start.toLocaleDateString()} to ${status.period.end.toLocaleDateString()}`,
      severity: 'high',
      incidentId: incident.id,
    });
    
    // Log the breach
    console.log(`SLA breach for ${service.name}: Target ${status.targetUptime}%, Actual ${status.actualUptime.toFixed(2)}%`);
  } catch (error) {
    console.error('Error handling SLA breach:', error);
  }
}

/**
 * Store compliance results
 */
async function storeComplianceResults(results: Record<string, SLAComplianceStatus>): Promise<void> {
  try {
    // In a production environment, this would store the results in a database
    // For now, we'll just log them
    console.log('Storing SLA compliance results:', results);
    
    // Example of storing in Supabase
    if (supabaseAdmin) {
      for (const [serviceId, result] of Object.entries(results)) {
        const { error } = await supabaseAdmin
          .from('sla_compliance')
          .insert([{
            service_id: serviceId,
            period_start: result.period.start.toISOString(),
            period_end: result.period.end.toISOString(),
            period_type: result.period.type,
            target_uptime: result.targetUptime,
            actual_uptime: result.actualUptime,
            compliant: result.compliant,
            downtime_total: result.downtime.total,
            downtime_planned: result.downtime.planned,
            downtime_unplanned: result.downtime.unplanned,
            avg_response_time: result.responseTime.average,
            p95_response_time: result.responseTime.p95,
            p99_response_time: result.responseTime.p99,
            error_rate: result.errorRate,
            error_budget_total: result.errorBudget.total,
            error_budget_used: result.errorBudget.used,
            error_budget_remaining: result.errorBudget.remaining,
            error_budget_percent_remaining: result.errorBudget.percentRemaining,
            created_at: new Date().toISOString(),
          }]);
        
        if (error) {
          console.error(`Error storing SLA compliance for ${serviceId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error storing compliance results:', error);
  }
}

// ==========================================================
// PERFORMANCE MONITORING
// ==========================================================

/**
 * Collect performance metrics for all services
 */
export async function collectPerformanceMetrics(): Promise<void> {
  console.log('Collecting performance metrics for all services');
  
  try {
    // Get all services
    const services = DEFAULT_SLA_MONITORING_CONFIG.services;
    
    // Collect metrics for each service
    for (const service of services) {
      await collectServiceMetrics(service);
    }
  } catch (error) {
    console.error('Error collecting performance metrics:', error);
  }
}

/**
 * Collect metrics for a specific service
 */
async function collectServiceMetrics(service: SLAMonitoringConfig['services'][0]): Promise<void> {
  console.log(`Collecting metrics for service ${service.id}`);
  
  try {
    // In a production environment, this would collect real metrics
    // For now, we'll simulate it
    
    // Simulate response time
    const responseTime = Math.random() * 1000; // Random between 0 and 1000ms
    
    // Simulate error rate
    const errorRate = Math.random() * 2; // Random between 0% and 2%
    
    // Simulate throughput
    const throughput = Math.floor(Math.random() * 100) + 50; // Random between 50 and 150 requests per minute
    
    // Create metric data points
    const timestamp = new Date();
    
    const responseTimeMetric: MetricDataPoint = {
      timestamp,
      value: responseTime,
      tags: {
        service: service.id,
        environment: process.env.NODE_ENV || 'development',
      },
    };
    
    const errorRateMetric: MetricDataPoint = {
      timestamp,
      value: errorRate,
      tags: {
        service: service.id,
        environment: process.env.NODE_ENV || 'development',
      },
    };
    
    const throughputMetric: MetricDataPoint = {
      timestamp,
      value: throughput,
      tags: {
        service: service.id,
        environment: process.env.NODE_ENV || 'development',
      },
    };
    
    // Store metrics
    await storeMetrics(service.id, 'responseTime', responseTimeMetric);
    await storeMetrics(service.id, 'errorRate', errorRateMetric);
    await storeMetrics(service.id, 'throughput', throughputMetric);
    
    // Check thresholds
    await checkPerformanceThresholds(service.id, {
      responseTime,
      errorRate,
      throughput,
    });
  } catch (error) {
    console.error(`Error collecting metrics for service ${service.id}:`, error);
  }
}

/**
 * Store metrics
 */
async function storeMetrics(serviceId: string, metricType: MetricType, dataPoint: MetricDataPoint): Promise<void> {
  try {
    // In a production environment, this would store metrics in a time-series database
    // For now, we'll just log them
    console.log(`Storing ${metricType} metric for ${serviceId}:`, dataPoint);
    
    // Example of storing in Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('service_metrics')
        .insert([{
          service_id: serviceId,
          metric_type: metricType,
          timestamp: dataPoint.timestamp.toISOString(),
          value: dataPoint.value,
          tags: dataPoint.tags,
        }]);
      
      if (error) {
        console.error(`Error storing ${metricType} metric for ${serviceId}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error storing ${metricType} metric for ${serviceId}:`, error);
  }
}

/**
 * Check performance thresholds
 */
async function checkPerformanceThresholds(
  serviceId: string,
  metrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  }
): Promise<void> {
  try {
    // Get thresholds for this service
    const thresholds = DEFAULT_SLA_MONITORING_CONFIG.performanceThresholds.filter(
      threshold => threshold.serviceId === serviceId && threshold.enabled
    );
    
    // Check each threshold
    for (const threshold of thresholds) {
      let metricValue: number | undefined;
      
      // Get the appropriate metric value
      switch (threshold.metricType) {
        case 'responseTime':
          metricValue = metrics.responseTime;
          break;
        case 'errorRate':
          metricValue = metrics.errorRate;
          break;
        case 'throughput':
          metricValue = metrics.throughput;
          break;
        default:
          continue; // Skip unknown metric types
      }
      
      // Check if threshold is exceeded
      let thresholdExceeded = false;
      let severity: IncidentSeverity = 'low';
      
      switch (threshold.operator) {
        case '>':
          if (metricValue > threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue > threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
        case '>=':
          if (metricValue >= threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue >= threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
        case '<':
          if (metricValue < threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue < threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
        case '<=':
          if (metricValue <= threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue <= threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
        case '==':
          if (metricValue === threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue === threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
        case '!=':
          if (metricValue !== threshold.critical) {
            thresholdExceeded = true;
            severity = 'high';
          } else if (metricValue !== threshold.warning) {
            thresholdExceeded = true;
            severity = 'medium';
          }
          break;
      }
      
      // Handle threshold breach
      if (thresholdExceeded) {
        await handlePerformanceThresholdBreach(serviceId, threshold, metricValue, severity);
      }
    }
  } catch (error) {
    console.error(`Error checking performance thresholds for ${serviceId}:`, error);
  }
}

/**
 * Handle performance threshold breach
 */
async function handlePerformanceThresholdBreach(
  serviceId: string,
  threshold: PerformanceThreshold,
  actualValue: number,
  severity: IncidentSeverity
): Promise<void> {
  console.log(`Performance threshold breach for ${serviceId}: ${threshold.metricType} = ${actualValue}`);
  
  try {
    // Find service
    const service = DEFAULT_SLA_MONITORING_CONFIG.services.find(s => s.id === serviceId);
    if (!service) {
      console.error(`Service ${serviceId} not found`);
      return;
    }
    
    // Create an incident for critical breaches
    if (severity === 'high') {
      const incident = await createIncident({
        title: `Performance Alert: ${service.name} ${threshold.metricType}`,
        description: `Service ${service.name} has exceeded the critical threshold for ${threshold.metricType}. Current value: ${actualValue}, Critical threshold: ${threshold.critical}`,
        severity,
        serviceId,
        detectedBy: 'automatic',
        detectionSource: 'performance-monitoring',
        isPublic: false,
        notifiedUsers: false,
      });
      
      // Send alert
      await sendAlert({
        channelId: 'slack-ops',
        title: `⚠️ Performance Alert: ${service.name}`,
        message: `Service ${service.name} has exceeded the critical threshold for ${threshold.metricType}.\nCurrent value: ${actualValue}\nCritical threshold: ${threshold.critical}`,
        severity,
        incidentId: incident.id,
      });
    } else {
      // For medium severity, just send an alert without creating an incident
      await sendAlert({
        channelId: 'slack-ops',
        title: `⚠️ Performance Warning: ${service.name}`,
        message: `Service ${service.name} has exceeded the warning threshold for ${threshold.metricType}.\nCurrent value: ${actualValue}\nWarning threshold: ${threshold.warning}`,
        severity,
      });
    }
  } catch (error) {
    console.error('Error handling performance threshold breach:', error);
  }
}

// ==========================================================
// INCIDENT MANAGEMENT
// ==========================================================

/**
 * Create a new incident
 */
export async function createIncident(
  params: {
    title: string;
    description: string;
    severity: IncidentSeverity;
    serviceId: string;
    componentId?: string;
    detectedBy: 'automatic' | 'manual';
    detectionSource?: string;
    assignedTo?: string;
    impactedServices?: string[];
    tags?: string[];
    isPublic: boolean;
    notifiedUsers: boolean;
    metadata?: Record<string, any>;
  }
): Promise<ServiceIncident> {
  console.log(`Creating incident: ${params.title}`);
  
  try {
    const now = new Date();
    
    // Create incident
    const incident: ServiceIncident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: params.title,
      description: params.description,
      severity: params.severity,
      status: 'investigating',
      serviceId: params.serviceId,
      componentId: params.componentId,
      createdAt: now,
      updatedAt: now,
      detectedBy: params.detectedBy,
      detectionSource: params.detectionSource,
      assignedTo: params.assignedTo,
      updates: [
        {
          id: `update_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          incidentId: '', // Will be filled in after incident ID is generated
          status: 'investigating',
          message: 'Incident detected, investigation started.',
          createdAt: now,
          createdBy: params.detectedBy === 'automatic' ? 'system' : params.assignedTo || 'unknown',
          isPublic: params.isPublic,
        }
      ],
      impactedServices: params.impactedServices || [params.serviceId],
      tags: params.tags || [],
      isPublic: params.isPublic,
      notifiedUsers: params.notifiedUsers,
      metadata: params.metadata,
    };
    
    // Set the incident ID in the first update
    incident.updates[0].incidentId = incident.id;
    
    // Store the incident
    await storeIncident(incident);
    
    // Update status page if the incident is public
    if (incident.isPublic) {
      await updateStatusPageForIncident(incident);
    }
    
    // Send notifications
    if (DEFAULT_SLA_MONITORING_CONFIG.notifications.incidentCreated) {
      await sendIncidentNotifications(incident);
    }
    
    return incident;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
}

/**
 * Update an incident
 */
export async function updateIncident(
  incidentId: string,
  update: {
    status?: IncidentStatus;
    message: string;
    createdBy: string;
    isPublic?: boolean;
    affectedComponents?: string[];
    resolvedAt?: Date;
    resolution?: string;
    rootCause?: string;
  }
): Promise<ServiceIncident> {
  console.log(`Updating incident ${incidentId}: ${update.message}`);
  
  try {
    // In a production environment, this would fetch the incident from the database
    // For now, we'll simulate it
    const incident: ServiceIncident = {
      id: incidentId,
      title: 'Simulated incident',
      description: 'This is a simulated incident for demonstration purposes',
      severity: 'medium',
      status: update.status || 'investigating',
      serviceId: 'kazi-web',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(),
      resolvedAt: update.resolvedAt,
      detectedBy: 'manual',
      updates: [],
      impactedServices: ['kazi-web'],
      rootCause: update.rootCause,
      resolution: update.resolution,
      tags: [],
      isPublic: true,
      notifiedUsers: true,
    };
    
    // Create a new update
    const incidentUpdate: IncidentUpdate = {
      id: `update_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      incidentId,
      status: update.status || incident.status,
      message: update.message,
      createdAt: new Date(),
      createdBy: update.createdBy,
      affectedComponents: update.affectedComponents,
      isPublic: update.isPublic !== undefined ? update.isPublic : incident.isPublic,
    };
    
    // Add the update to the incident
    incident.updates.push(incidentUpdate);
    
    // Update incident status and timestamps
    incident.status = update.status || incident.status;
    incident.updatedAt = new Date();
    
    if (update.status === 'resolved') {
      incident.resolvedAt = update.resolvedAt || new Date();
      incident.resolution = update.resolution;
    }
    
    if (update.rootCause) {
      incident.rootCause = update.rootCause;
    }
    
    // Store the updated incident
    await storeIncident(incident);
    
    // Update status page if the incident is public
    if (incident.isPublic) {
      await updateStatusPageForIncident(incident);
    }
    
    // Send notifications
    if (DEFAULT_SLA_MONITORING_CONFIG.notifications.incidentUpdated) {
      await sendIncidentUpdateNotifications(incident, incidentUpdate);
    }
    
    return incident;
  } catch (error) {
    console.error(`Error updating incident ${incidentId}:`, error);
    throw error;
  }
}

/**
 * Store an incident
 */
async function storeIncident(incident: ServiceIncident): Promise<void> {
  try {
    // In a production environment, this would store the incident in a database
    // For now, we'll just log it
    console.log('Storing incident:', incident);
    
    // Example of storing in Supabase
    if (supabaseAdmin) {
      // Store the incident
      const { error: incidentError } = await supabaseAdmin
        .from('incidents')
        .upsert([{
          id: incident.id,
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          status: incident.status,
          service_id: incident.serviceId,
          component_id: incident.componentId,
          created_at: incident.createdAt.toISOString(),
          updated_at: incident.updatedAt.toISOString(),
          resolved_at: incident.resolvedAt?.toISOString(),
          detected_by: incident.detectedBy,
          detection_source: incident.detectionSource,
          assigned_to: incident.assignedTo,
          acknowledged_at: incident.acknowledgedAt?.toISOString(),
          acknowledged_by: incident.acknowledgedBy,
          impacted_services: incident.impactedServices,
          root_cause: incident.rootCause,
          resolution: incident.resolution,
          post_mortem_url: incident.postMortemUrl,
          tags: incident.tags,
          is_public: incident.isPublic,
          notified_users: incident.notifiedUsers,
          metadata: incident.metadata,
        }]);
      
      if (incidentError) {
        console.error('Error storing incident:', incidentError);
      }
      
      // Store the updates
      for (const update of incident.updates) {
        const { error: updateError } = await supabaseAdmin
          .from('incident_updates')
          .upsert([{
            id: update.id,
            incident_id: update.incidentId,
            status: update.status,
            message: update.message,
            created_at: update.createdAt.toISOString(),
            created_by: update.createdBy,
            affected_components: update.affectedComponents,
            is_public: update.isPublic,
          }]);
        
        if (updateError) {
          console.error('Error storing incident update:', updateError);
        }
      }
    }
  } catch (error) {
    console.error('Error storing incident:', error);
  }
}

/**
 * Update status page for an incident
 */
async function updateStatusPageForIncident(incident: ServiceIncident): Promise<void> {
  try {
    // In a production environment, this would update the status page
    // For now, we'll just log it
    console.log(`Updating status page for incident ${incident.id}`);
    
    // Update component status
    const componentStatus: ServiceStatus = 
      incident.status === 'resolved' ? 'operational' :
      incident.severity === 'critical' ? 'major_outage' :
      incident.severity === 'high' ? 'partial_outage' : 'degraded';
    
    // Update each impacted service
    for (const serviceId of incident.impactedServices) {
      await updateStatusPageComponent(serviceId, componentStatus);
    }
    
    // Update Upptime if enabled
    if (DEFAULT_SLA_MONITORING_CONFIG.upptime.enabled) {
      await updateUpptimeIncident(incident);
    }
  } catch (error) {
    console.error(`Error updating status page for incident ${incident.id}:`, error);
  }
}

/**
 * Update Upptime incident
 */
async function updateUpptimeIncident(incident: ServiceIncident): Promise<void> {
  // In a real implementation, this would update the Upptime incident via GitHub API
  console.log(`Updating Upptime incident ${incident.id}`);
}

/**
 * Send incident notifications
 */
async function sendIncidentNotifications(incident: ServiceIncident): Promise<void> {
  try {
    console.log(`Sending notifications for incident ${incident.id}`);
    
    // Find service
    const service = DEFAULT_SLA_MONITORING_CONFIG.services.find(s => s.id === incident.serviceId);
    if (!service) {
      console.error(`Service ${incident.serviceId} not found`);
      return;
    }
    
    // Determine which channels to notify based on severity
    let channelIds: string[] = [];
    
    if (incident.severity === 'critical') {
      // For critical incidents, notify all channels
      channelIds = DEFAULT_SLA_MONITORING_CONFIG.alertChannels
        .filter(channel => channel.enabled)
        .map(channel => channel.id);
    } else if (incident.severity === 'high') {
      // For high severity, notify main channels
      channelIds = ['slack-ops', 'email-ops'];
    } else {
      // For medium and low severity, just notify Slack
      channelIds = ['slack-ops'];
    }
    
    // Send alerts to each channel
    for (const channelId of channelIds) {
      await sendAlert({
        channelId,
        title: `🚨 New Incident: ${incident.title}`,
        message: `A new incident has been created for ${service?.name || incident.serviceId}.\n\nSeverity: ${incident.severity}\nStatus: ${incident.status}\n\n${incident.description}`,
        severity: incident.severity,
        incidentId: incident.id,
      });
    }
    
    // If the incident is public, notify users if configured
    if (incident.isPublic && incident.notifiedUsers) {
      await notifyUsers(incident);
    }
  } catch (error) {
    console.error(`Error sending notifications for incident ${incident.id}:`, error);
  }
}

/**
 * Send incident update notifications
 */
async function sendIncidentUpdateNotifications(incident: ServiceIncident, update: IncidentUpdate): Promise<void> {
  try {
    console.log(`Sending notifications for incident update ${update.id}`);
    
    // Find service
    const service = DEFAULT_SLA_MONITORING_CONFIG.services.find(s => s.id === incident.serviceId);
    if (!service) {
      console.error(`Service ${incident.serviceId} not found`);
      return;
    }
    
    // Determine which channels to notify based on severity and status
    let channelIds: string[] = [];
    
    if (update.status === 'resolved') {
      // For resolutions, notify all channels that were notified about the incident
      channelIds = DEFAULT_SLA_MONITORING_CONFIG.alertChannels
        .filter(channel => channel.enabled)
        .map(channel => channel.id);
    } else if (incident.severity === 'critical' || incident.severity === 'high') {
      // For critical and high severity, notify main channels
      channelIds = ['slack-ops', 'email-ops'];
    } else {
      // For medium and low severity, just notify Slack
      channelIds = ['slack-ops'];
    }
    
    // Prepare message based on status
    let emoji = '📝';
    if (update.status === 'resolved') {
      emoji = '✅';
    } else if (update.status === 'identified') {
      emoji = '🔍';
    }
    
    // Send alerts to each channel
    for (const channelId of channelIds) {
      await sendAlert({
        channelId,
        title: `${emoji} Incident Update: ${incident.title}`,
        message: `Update for incident affecting ${service?.name || incident.serviceId}.\n\nStatus: ${update.status}\n\n${update.message}`,
        severity: incident.severity,
        incidentId: incident.id,
      });
    }
    
    // If the incident is public and the update is public, notify users if configured
    if (incident.isPublic && update.isPublic && incident.notifiedUsers) {
      await notifyUsersAboutUpdate(incident, update);
    }
  } catch (error) {
    console.error(`Error sending notifications for incident update ${update.id}:`, error);
  }
}

/**
 * Notify users about an incident
 */
async function notifyUsers(incident: ServiceIncident): Promise<void> {
  try {
    // In a production environment, this would notify users via email, SMS, etc.
    // For now, we'll just log it
    console.log(`Notifying users about incident ${incident.id}`);
    
    // Find service
    const service = DEFAULT_SLA_MONITORING_CONFIG.services.find(s => s.id === incident.serviceId);
    if (!service) {
      console.error(`Service ${incident.serviceId} not found`);
      return;
    }
    
    // Simulate sending notifications
    console.log(`Would send email to all users about incident affecting ${service.name}`);
    console.log(`Email subject: "Service Disruption: ${service.name}"`);
    console.log(`Email body: "We are currently experiencing issues with ${service.name}. Our team is investigating. We apologize for any inconvenience."`);
  } catch (error) {
    console.error(`Error notifying users about incident ${incident.id}:`, error);
  }
}

/**
 * Notify users about an incident update
 */
async function notifyUsersAboutUpdate(incident: ServiceIncident, update: IncidentUpdate): Promise<void> {
  try {