import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('enterprise-rate-limiting');

// Phase 8 Gap #9: API Rate Limiting Dashboard
// Priority: MEDIUM | Competitor: Enterprise platforms
// Features: Rate limit configuration, usage monitoring, quota management,
// throttling policies, abuse detection, real-time analytics

interface RateLimitConfig {
  id: string;
  orgId: string;
  enabled: boolean;
  globalLimits: GlobalLimits;
  endpointLimits: EndpointLimit[];
  userTiers: UserTier[];
  throttlingPolicies: ThrottlingPolicy[];
  abuseDetection: AbuseDetectionConfig;
  alertSettings: AlertConfig;
  createdAt: string;
  updatedAt: string;
}

interface GlobalLimits {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  burstWindow: number; // seconds
  concurrentConnections: number;
}

interface EndpointLimit {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*';
  enabled: boolean;
  limits: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  priority: number;
  description: string;
  category: string;
}

interface UserTier {
  id: string;
  name: string;
  description: string;
  limits: TierLimits;
  features: string[];
  price: number;
  default: boolean;
}

interface TierLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  requestsPerMonth: number;
  concurrentRequests: number;
  webhooksPerHour: number;
  fileUploadSizeMB: number;
  apiKeysAllowed: number;
}

interface ThrottlingPolicy {
  id: string;
  name: string;
  enabled: boolean;
  trigger: ThrottleTrigger;
  action: ThrottleAction;
  duration: number; // seconds
  escalation: EscalationConfig;
}

interface ThrottleTrigger {
  type: 'rate_exceeded' | 'error_rate' | 'latency' | 'abuse_score';
  threshold: number;
  window: number; // seconds
}

interface ThrottleAction {
  type: 'slow_down' | 'queue' | 'reject' | 'captcha' | 'block';
  retryAfter: number; // seconds
  message: string;
}

interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
}

interface EscalationLevel {
  attempts: number;
  action: 'warn' | 'throttle' | 'block' | 'alert';
  duration: number; // seconds
}

interface AbuseDetectionConfig {
  enabled: boolean;
  patterns: AbusePattern[];
  autoBlock: boolean;
  blockDuration: number; // minutes
  alertOnDetection: boolean;
  whitelistIPs: string[];
}

interface AbusePattern {
  id: string;
  name: string;
  type: 'brute_force' | 'scraping' | 'dos' | 'credential_stuffing' | 'api_abuse';
  enabled: boolean;
  threshold: number;
  window: number;
  action: string;
}

interface AlertConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: string[];
  cooldown: number; // minutes
}

interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: 'info' | 'warning' | 'critical';
}

interface UsageStats {
  period: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  blockedRequests: number;
  averageLatency: number;
  p99Latency: number;
  errorRate: number;
  topEndpoints: EndpointUsage[];
  topUsers: UserUsage[];
  topIPs: IPUsage[];
  byHour: HourlyUsage[];
}

interface EndpointUsage {
  endpoint: string;
  method: string;
  requests: number;
  errors: number;
  avgLatency: number;
}

interface UserUsage {
  userId: string;
  email: string;
  tier: string;
  requests: number;
  percentOfQuota: number;
}

interface IPUsage {
  ip: string;
  requests: number;
  blocked: number;
  country: string;
}

interface HourlyUsage {
  hour: string;
  requests: number;
  rateLimited: number;
  errors: number;
}

interface QuotaStatus {
  userId: string;
  tier: string;
  current: {
    minute: number;
    hour: number;
    day: number;
    month: number;
  };
  limits: {
    minute: number;
    hour: number;
    day: number;
    month: number;
  };
  remaining: {
    minute: number;
    hour: number;
    day: number;
    month: number;
  };
  resetTimes: {
    minute: string;
    hour: string;
    day: string;
    month: string;
  };
}

// Demo data
const demoConfig: RateLimitConfig = {
  id: 'rate-config-001',
  orgId: 'org-001',
  enabled: true,
  globalLimits: {
    requestsPerSecond: 100,
    requestsPerMinute: 3000,
    requestsPerHour: 100000,
    requestsPerDay: 1000000,
    burstLimit: 500,
    burstWindow: 10,
    concurrentConnections: 1000
  },
  endpointLimits: [
    { id: 'ep-001', endpoint: '/api/auth/*', method: 'POST', enabled: true, limits: { requestsPerSecond: 5, requestsPerMinute: 20, requestsPerHour: 100 }, priority: 1, description: 'Auth endpoints - strict limits', category: 'authentication' },
    { id: 'ep-002', endpoint: '/api/ai/*', method: '*', enabled: true, limits: { requestsPerSecond: 2, requestsPerMinute: 30, requestsPerHour: 500 }, priority: 1, description: 'AI endpoints - resource intensive', category: 'ai' },
    { id: 'ep-003', endpoint: '/api/upload/*', method: 'POST', enabled: true, limits: { requestsPerSecond: 1, requestsPerMinute: 10, requestsPerHour: 100 }, priority: 1, description: 'File uploads - bandwidth limits', category: 'storage' },
    { id: 'ep-004', endpoint: '/api/export/*', method: '*', enabled: true, limits: { requestsPerSecond: 1, requestsPerMinute: 5, requestsPerHour: 50 }, priority: 1, description: 'Data exports - heavy operations', category: 'export' },
    { id: 'ep-005', endpoint: '/api/*', method: '*', enabled: true, limits: { requestsPerSecond: 50, requestsPerMinute: 1000, requestsPerHour: 30000 }, priority: 10, description: 'Default API limits', category: 'general' }
  ],
  userTiers: [
    {
      id: 'tier-free',
      name: 'Free',
      description: 'Basic access for individuals',
      limits: { requestsPerMinute: 60, requestsPerHour: 1000, requestsPerDay: 5000, requestsPerMonth: 50000, concurrentRequests: 5, webhooksPerHour: 10, fileUploadSizeMB: 10, apiKeysAllowed: 2 },
      features: ['Basic API access', 'Community support'],
      price: 0,
      default: true
    },
    {
      id: 'tier-pro',
      name: 'Professional',
      description: 'For growing teams',
      limits: { requestsPerMinute: 300, requestsPerHour: 10000, requestsPerDay: 100000, requestsPerMonth: 1000000, concurrentRequests: 20, webhooksPerHour: 100, fileUploadSizeMB: 100, apiKeysAllowed: 10 },
      features: ['Priority API access', 'Email support', 'Webhooks', 'Advanced analytics'],
      price: 49,
      default: false
    },
    {
      id: 'tier-enterprise',
      name: 'Enterprise',
      description: 'Unlimited access with SLA',
      limits: { requestsPerMinute: 1000, requestsPerHour: 50000, requestsPerDay: 500000, requestsPerMonth: 10000000, concurrentRequests: 100, webhooksPerHour: 1000, fileUploadSizeMB: 1000, apiKeysAllowed: 100 },
      features: ['Unlimited API access', 'Dedicated support', 'Custom limits', 'SLA guarantee', '24/7 support'],
      price: 499,
      default: false
    }
  ],
  throttlingPolicies: [
    {
      id: 'throttle-001',
      name: 'Gradual Slowdown',
      enabled: true,
      trigger: { type: 'rate_exceeded', threshold: 80, window: 60 },
      action: { type: 'slow_down', retryAfter: 5, message: 'Rate limit approaching. Requests slowed.' },
      duration: 300,
      escalation: {
        enabled: true,
        levels: [
          { attempts: 3, action: 'warn', duration: 60 },
          { attempts: 5, action: 'throttle', duration: 300 },
          { attempts: 10, action: 'block', duration: 900 }
        ]
      }
    },
    {
      id: 'throttle-002',
      name: 'Hard Block',
      enabled: true,
      trigger: { type: 'rate_exceeded', threshold: 100, window: 60 },
      action: { type: 'reject', retryAfter: 60, message: 'Rate limit exceeded. Please wait before retrying.' },
      duration: 60,
      escalation: { enabled: false, levels: [] }
    }
  ],
  abuseDetection: {
    enabled: true,
    patterns: [
      { id: 'abuse-001', name: 'Brute Force Login', type: 'brute_force', enabled: true, threshold: 10, window: 60, action: 'block' },
      { id: 'abuse-002', name: 'Credential Stuffing', type: 'credential_stuffing', enabled: true, threshold: 50, window: 300, action: 'captcha' },
      { id: 'abuse-003', name: 'API Scraping', type: 'scraping', enabled: true, threshold: 1000, window: 3600, action: 'throttle' },
      { id: 'abuse-004', name: 'DoS Detection', type: 'dos', enabled: true, threshold: 500, window: 10, action: 'block' }
    ],
    autoBlock: true,
    blockDuration: 30,
    alertOnDetection: true,
    whitelistIPs: ['192.168.1.0/24', '10.0.0.0/8']
  },
  alertSettings: {
    enabled: true,
    thresholds: [
      { metric: 'rate_limit_percentage', operator: 'gt', value: 80, severity: 'warning' },
      { metric: 'rate_limit_percentage', operator: 'gt', value: 95, severity: 'critical' },
      { metric: 'error_rate', operator: 'gt', value: 5, severity: 'warning' },
      { metric: 'blocked_requests', operator: 'gt', value: 100, severity: 'critical' }
    ],
    channels: ['email', 'slack', 'pagerduty'],
    cooldown: 15
  },
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Configuration
      case 'get-config':
        return NextResponse.json({
          success: true,
          data: { config: demoConfig }
        });

      case 'update-config':
        return NextResponse.json({
          success: true,
          data: {
            config: {
              ...demoConfig,
              ...params.updates,
              updatedAt: new Date().toISOString()
            }
          }
        });

      case 'update-global-limits':
        return NextResponse.json({
          success: true,
          data: {
            globalLimits: {
              ...demoConfig.globalLimits,
              ...params.limits
            },
            message: 'Global limits updated successfully'
          }
        });

      // Endpoint Limits
      case 'get-endpoint-limits':
        return NextResponse.json({
          success: true,
          data: { limits: demoConfig.endpointLimits }
        });

      case 'create-endpoint-limit':
        const newLimit: EndpointLimit = {
          id: `ep-${Date.now()}`,
          endpoint: params.endpoint,
          method: params.method || '*',
          enabled: params.enabled ?? true,
          limits: params.limits,
          priority: params.priority || 5,
          description: params.description || '',
          category: params.category || 'custom'
        };
        return NextResponse.json({ success: true, data: { limit: newLimit } });

      case 'update-endpoint-limit':
        return NextResponse.json({
          success: true,
          data: {
            limitId: params.limitId,
            updates: params.updates,
            updatedAt: new Date().toISOString()
          }
        });

      // User Tiers
      case 'get-tiers':
        return NextResponse.json({
          success: true,
          data: { tiers: demoConfig.userTiers }
        });

      case 'create-tier':
        const newTier: UserTier = {
          id: `tier-${Date.now()}`,
          name: params.name,
          description: params.description || '',
          limits: params.limits,
          features: params.features || [],
          price: params.price || 0,
          default: false
        };
        return NextResponse.json({ success: true, data: { tier: newTier } });

      case 'assign-tier':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            tierId: params.tierId,
            previousTier: 'tier-free',
            effectiveAt: new Date().toISOString(),
            message: 'User tier updated successfully'
          }
        });

      // Quota Management
      case 'get-quota-status':
        const quota: QuotaStatus = {
          userId: params.userId || 'user-001',
          tier: 'Professional',
          current: { minute: 45, hour: 850, day: 12500, month: 285000 },
          limits: { minute: 300, hour: 10000, day: 100000, month: 1000000 },
          remaining: { minute: 255, hour: 9150, day: 87500, month: 715000 },
          resetTimes: {
            minute: new Date(Date.now() + 30 * 1000).toISOString(),
            hour: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
            day: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            month: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        return NextResponse.json({ success: true, data: { quota } });

      case 'reset-quota':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            quotaReset: true,
            resetAt: new Date().toISOString(),
            reason: params.reason || 'Manual reset by admin'
          }
        });

      case 'grant-temporary-quota':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            additionalRequests: params.amount,
            expiresAt: params.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            reason: params.reason,
            grantedBy: params.grantedBy || 'admin@company.com'
          }
        });

      // Usage Analytics
      case 'get-usage-stats':
        const stats: UsageStats = {
          period: params.period || 'last-24h',
          totalRequests: 1250000,
          successfulRequests: 1235000,
          rateLimitedRequests: 12500,
          blockedRequests: 2500,
          averageLatency: 45,
          p99Latency: 250,
          errorRate: 1.2,
          topEndpoints: [
            { endpoint: '/api/projects', method: 'GET', requests: 350000, errors: 500, avgLatency: 25 },
            { endpoint: '/api/users', method: 'GET', requests: 250000, errors: 200, avgLatency: 30 },
            { endpoint: '/api/ai/generate', method: 'POST', requests: 150000, errors: 1500, avgLatency: 450 }
          ],
          topUsers: [
            { userId: 'user-001', email: 'john@company.com', tier: 'Enterprise', requests: 125000, percentOfQuota: 25 },
            { userId: 'user-002', email: 'jane@company.com', tier: 'Professional', requests: 85000, percentOfQuota: 85 }
          ],
          topIPs: [
            { ip: '192.168.1.100', requests: 250000, blocked: 0, country: 'US' },
            { ip: '10.0.0.50', requests: 180000, blocked: 0, country: 'US' }
          ],
          byHour: Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            requests: Math.floor(40000 + Math.random() * 20000),
            rateLimited: Math.floor(400 + Math.random() * 200),
            errors: Math.floor(100 + Math.random() * 100)
          }))
        };
        return NextResponse.json({ success: true, data: { stats } });

      case 'get-real-time-metrics':
        return NextResponse.json({
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            requestsPerSecond: 85,
            activeConnections: 450,
            queueDepth: 12,
            averageLatency: 42,
            errorRate: 0.8,
            throttledRequests: 5,
            blockedRequests: 1,
            healthStatus: 'healthy'
          }
        });

      // Throttling
      case 'get-throttling-policies':
        return NextResponse.json({
          success: true,
          data: { policies: demoConfig.throttlingPolicies }
        });

      case 'create-throttling-policy':
        const newPolicy: ThrottlingPolicy = {
          id: `throttle-${Date.now()}`,
          name: params.name,
          enabled: params.enabled ?? true,
          trigger: params.trigger,
          action: params.action,
          duration: params.duration,
          escalation: params.escalation || { enabled: false, levels: [] }
        };
        return NextResponse.json({ success: true, data: { policy: newPolicy } });

      // Abuse Detection
      case 'get-abuse-patterns':
        return NextResponse.json({
          success: true,
          data: {
            patterns: demoConfig.abuseDetection.patterns,
            recentDetections: [
              { id: 'd1', pattern: 'brute_force', ip: '198.51.100.50', timestamp: '2025-01-15T14:00:00Z', blocked: true },
              { id: 'd2', pattern: 'scraping', ip: '203.0.113.100', timestamp: '2025-01-15T13:30:00Z', blocked: false }
            ]
          }
        });

      case 'block-ip':
        return NextResponse.json({
          success: true,
          data: {
            ip: params.ip,
            blocked: true,
            duration: params.duration || 3600,
            reason: params.reason || 'Manual block',
            blockedAt: new Date().toISOString()
          }
        });

      case 'unblock-ip':
        return NextResponse.json({
          success: true,
          data: {
            ip: params.ip,
            unblocked: true,
            unblockedAt: new Date().toISOString()
          }
        });

      // API Keys
      case 'get-api-key-usage':
        return NextResponse.json({
          success: true,
          data: {
            apiKeyId: params.apiKeyId,
            usage: {
              today: 12500,
              thisWeek: 85000,
              thisMonth: 285000,
              lastRequest: '2025-01-15T14:30:00Z',
              topEndpoints: [
                { endpoint: '/api/projects', requests: 5000 },
                { endpoint: '/api/ai/generate', requests: 2500 }
              ]
            }
          }
        });

      // Export
      case 'export-usage-report':
        return NextResponse.json({
          success: true,
          data: {
            reportId: `report-${Date.now()}`,
            format: params.format || 'csv',
            period: params.period,
            status: 'generating',
            downloadUrl: null,
            message: 'Report generation started'
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Rate Limiting API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      config: demoConfig,
      features: [
        'Global rate limits',
        'Per-endpoint limits',
        'User tier management',
        'Quota monitoring',
        'Real-time analytics',
        'Throttling policies',
        'Abuse detection',
        'IP blocking',
        'Usage dashboards',
        'Custom alerts'
      ]
    }
  });
}
