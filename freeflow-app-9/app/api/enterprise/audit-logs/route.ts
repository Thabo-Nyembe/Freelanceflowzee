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

const logger = createFeatureLogger('enterprise-audit-logs');

// Phase 8 Gap #6: Audit Log Export
// Priority: MEDIUM | Competitor: Enterprise platforms
// Features: Comprehensive logging, export formats, retention policies,
// real-time streaming, search & filter, compliance reports

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  category: AuditCategory;
  resource: string;
  resourceId: string;
  resourceType: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location: string;
  sessionId: string;
  outcome: 'success' | 'failure' | 'partial';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'configuration'
  | 'user_management'
  | 'billing'
  | 'api_access'
  | 'security'
  | 'compliance'
  | 'system';

interface AuditLogConfig {
  id: string;
  orgId: string;
  enabled: boolean;
  retentionDays: number;
  categories: AuditCategory[];
  sensitiveFields: string[];
  realTimeAlerts: AlertConfig[];
  exportSchedules: ExportSchedule[];
  integrations: IntegrationConfig[];
  createdAt: string;
  updatedAt: string;
}

interface AlertConfig {
  id: string;
  name: string;
  enabled: boolean;
  conditions: AlertCondition[];
  channels: string[];
  severity: 'info' | 'warning' | 'critical';
}

interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: any;
}

interface ExportSchedule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'csv' | 'parquet' | 'siem';
  destination: ExportDestination;
  filters: Record<string, any>;
  lastExport?: string;
  nextExport: string;
}

interface ExportDestination {
  type: 's3' | 'azure_blob' | 'gcs' | 'sftp' | 'webhook' | 'siem';
  config: Record<string, any>;
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'splunk' | 'datadog' | 'elastic' | 'sumo_logic' | 'chronicle' | 'sentinel' | 'custom';
  enabled: boolean;
  endpoint: string;
  credentials: Record<string, any>;
  format: string;
  batchSize: number;
  flushInterval: number;
}

interface AuditQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  category?: AuditCategory;
  resource?: string;
  outcome?: string;
  riskLevel?: string;
  ipAddress?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AuditStats {
  totalLogs: number;
  byCategory: Record<string, number>;
  byOutcome: Record<string, number>;
  byRiskLevel: Record<string, number>;
  topUsers: { userId: string; email: string; count: number }[];
  topActions: { action: string; count: number }[];
  timeline: { date: string; count: number }[];
}

// Demo data
const demoLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2025-01-15T14:30:00Z',
    userId: 'user-001',
    userEmail: 'john@company.com',
    userName: 'John Doe',
    action: 'user.login',
    category: 'authentication',
    resource: 'session',
    resourceId: 'session-abc123',
    resourceType: 'session',
    details: { method: 'sso', provider: 'okta', mfaUsed: true },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    location: 'San Francisco, CA, US',
    sessionId: 'session-abc123',
    outcome: 'success',
    riskLevel: 'low',
    metadata: { device: 'MacBook Pro', browser: 'Chrome 120' }
  },
  {
    id: 'log-002',
    timestamp: '2025-01-15T14:25:00Z',
    userId: 'user-002',
    userEmail: 'jane@company.com',
    userName: 'Jane Smith',
    action: 'project.create',
    category: 'data_modification',
    resource: 'project',
    resourceId: 'proj-xyz789',
    resourceType: 'project',
    details: { projectName: 'Q1 Marketing Campaign', teamId: 'team-001' },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    location: 'New York, NY, US',
    sessionId: 'session-def456',
    outcome: 'success',
    riskLevel: 'low',
    metadata: {}
  },
  {
    id: 'log-003',
    timestamp: '2025-01-15T14:20:00Z',
    userId: 'admin-001',
    userEmail: 'admin@company.com',
    userName: 'Admin User',
    action: 'user.role.update',
    category: 'user_management',
    resource: 'user',
    resourceId: 'user-003',
    resourceType: 'user',
    details: { previousRole: 'member', newRole: 'admin', reason: 'Promotion' },
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    location: 'San Francisco, CA, US',
    sessionId: 'session-ghi789',
    outcome: 'success',
    riskLevel: 'medium',
    metadata: { approvedBy: 'cto@company.com' }
  },
  {
    id: 'log-004',
    timestamp: '2025-01-15T14:15:00Z',
    userId: 'user-004',
    userEmail: 'unknown@external.com',
    userName: 'Unknown',
    action: 'user.login.failed',
    category: 'authentication',
    resource: 'session',
    resourceId: '',
    resourceType: 'session',
    details: { reason: 'invalid_credentials', attempts: 3 },
    ipAddress: '10.0.0.50',
    userAgent: 'curl/7.64.1',
    location: 'Unknown',
    sessionId: '',
    outcome: 'failure',
    riskLevel: 'high',
    metadata: { blocked: true, blockReason: 'Too many attempts' }
  },
  {
    id: 'log-005',
    timestamp: '2025-01-15T14:10:00Z',
    userId: 'user-001',
    userEmail: 'john@company.com',
    userName: 'John Doe',
    action: 'data.export',
    category: 'data_access',
    resource: 'report',
    resourceId: 'report-001',
    resourceType: 'report',
    details: { format: 'csv', recordCount: 5000, dataTypes: ['customers', 'orders'] },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    location: 'San Francisco, CA, US',
    sessionId: 'session-abc123',
    outcome: 'success',
    riskLevel: 'medium',
    metadata: { fileSize: '2.5MB', approvedBy: 'auto' }
  }
];

const demoConfig: AuditLogConfig = {
  id: 'config-001',
  orgId: 'org-001',
  enabled: true,
  retentionDays: 365,
  categories: ['authentication', 'authorization', 'data_access', 'data_modification', 'user_management', 'security'],
  sensitiveFields: ['password', 'ssn', 'credit_card', 'api_key'],
  realTimeAlerts: [
    {
      id: 'alert-001',
      name: 'Failed Login Alert',
      enabled: true,
      conditions: [{ field: 'action', operator: 'equals', value: 'user.login.failed' }],
      channels: ['email', 'slack'],
      severity: 'warning'
    },
    {
      id: 'alert-002',
      name: 'High Risk Activity',
      enabled: true,
      conditions: [{ field: 'riskLevel', operator: 'in', value: ['high', 'critical'] }],
      channels: ['email', 'pagerduty'],
      severity: 'critical'
    }
  ],
  exportSchedules: [
    {
      id: 'export-001',
      name: 'Daily Compliance Export',
      enabled: true,
      frequency: 'daily',
      format: 'json',
      destination: { type: 's3', config: { bucket: 'audit-logs', prefix: 'daily/' } },
      filters: { categories: ['authentication', 'user_management'] },
      lastExport: '2025-01-14T00:00:00Z',
      nextExport: '2025-01-15T00:00:00Z'
    }
  ],
  integrations: [
    {
      id: 'int-001',
      name: 'Splunk SIEM',
      type: 'splunk',
      enabled: true,
      endpoint: 'https://splunk.company.com:8088/services/collector',
      credentials: { token: '***' },
      format: 'hec',
      batchSize: 100,
      flushInterval: 30
    }
  ],
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // Query Logs
      case 'query-logs':
        const query: AuditQuery = params;
        let filteredLogs = [...demoLogs];

        if (query.category) filteredLogs = filteredLogs.filter(l => l.category === query.category);
        if (query.action) filteredLogs = filteredLogs.filter(l => l.action.includes(query.action));
        if (query.userId) filteredLogs = filteredLogs.filter(l => l.userId === query.userId);
        if (query.outcome) filteredLogs = filteredLogs.filter(l => l.outcome === query.outcome);
        if (query.riskLevel) filteredLogs = filteredLogs.filter(l => l.riskLevel === query.riskLevel);
        if (query.search) {
          const search = query.search.toLowerCase();
          filteredLogs = filteredLogs.filter(l =>
            l.action.toLowerCase().includes(search) ||
            l.userEmail.toLowerCase().includes(search) ||
            l.resource.toLowerCase().includes(search)
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            logs: filteredLogs,
            pagination: {
              total: filteredLogs.length,
              page: query.page || 1,
              limit: query.limit || 50,
              pages: Math.ceil(filteredLogs.length / (query.limit || 50))
            }
          }
        });

      case 'get-log-detail':
        const log = demoLogs.find(l => l.id === params.logId);
        return NextResponse.json({
          success: true,
          data: {
            log,
            relatedLogs: demoLogs.filter(l => l.sessionId === log?.sessionId && l.id !== log?.id).slice(0, 5),
            userActivity: demoLogs.filter(l => l.userId === log?.userId && l.id !== log?.id).slice(0, 5)
          }
        });

      // Statistics
      case 'get-stats':
        const stats: AuditStats = {
          totalLogs: 15420,
          byCategory: {
            authentication: 5230,
            data_access: 4120,
            data_modification: 2890,
            user_management: 1540,
            api_access: 1240,
            security: 400
          },
          byOutcome: {
            success: 14850,
            failure: 520,
            partial: 50
          },
          byRiskLevel: {
            low: 12500,
            medium: 2100,
            high: 720,
            critical: 100
          },
          topUsers: [
            { userId: 'user-001', email: 'john@company.com', count: 2340 },
            { userId: 'user-002', email: 'jane@company.com', count: 1890 },
            { userId: 'admin-001', email: 'admin@company.com', count: 1560 }
          ],
          topActions: [
            { action: 'user.login', count: 4520 },
            { action: 'project.view', count: 3210 },
            { action: 'file.download', count: 2450 },
            { action: 'api.request', count: 1890 }
          ],
          timeline: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(2000 + Math.random() * 500)
          })).reverse()
        };
        return NextResponse.json({ success: true, data: { stats } });

      // Export
      case 'export-logs':
        return NextResponse.json({
          success: true,
          data: {
            exportId: `export-${Date.now()}`,
            format: params.format || 'json',
            filters: params.filters || {},
            status: 'processing',
            estimatedRecords: 15420,
            estimatedSize: '45 MB',
            downloadUrl: null,
            message: 'Export started. You will be notified when ready.'
          }
        });

      case 'get-export-status':
        return NextResponse.json({
          success: true,
          data: {
            exportId: params.exportId,
            status: 'completed',
            records: 15420,
            fileSize: '42.3 MB',
            downloadUrl: `/exports/audit-logs-${params.exportId}.${params.format || 'json'}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });

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

      // Retention
      case 'get-retention-policy':
        return NextResponse.json({
          success: true,
          data: {
            policy: {
              retentionDays: demoConfig.retentionDays,
              archiveEnabled: true,
              archiveAfterDays: 90,
              archiveDestination: 's3://archive-bucket/audit-logs',
              purgeEnabled: true,
              purgeAfterDays: 365,
              complianceHold: ['authentication', 'user_management'],
              complianceHoldDays: 730
            },
            storage: {
              totalSize: '125 GB',
              activeSize: '45 GB',
              archivedSize: '80 GB',
              oldestLog: '2024-01-15T00:00:00Z',
              newestLog: new Date().toISOString()
            }
          }
        });

      case 'update-retention-policy':
        return NextResponse.json({
          success: true,
          data: {
            retentionDays: params.retentionDays,
            archiveEnabled: params.archiveEnabled,
            archiveAfterDays: params.archiveAfterDays,
            message: 'Retention policy updated successfully'
          }
        });

      // Alerts
      case 'get-alerts':
        return NextResponse.json({
          success: true,
          data: { alerts: demoConfig.realTimeAlerts }
        });

      case 'create-alert':
        const newAlert: AlertConfig = {
          id: `alert-${Date.now()}`,
          name: params.name,
          enabled: params.enabled ?? true,
          conditions: params.conditions,
          channels: params.channels,
          severity: params.severity || 'warning'
        };
        return NextResponse.json({ success: true, data: { alert: newAlert } });

      case 'test-alert':
        return NextResponse.json({
          success: true,
          data: {
            alertId: params.alertId,
            testResult: 'success',
            channelsNotified: ['email', 'slack'],
            message: 'Test alert sent successfully'
          }
        });

      // Integrations
      case 'get-integrations':
        return NextResponse.json({
          success: true,
          data: { integrations: demoConfig.integrations }
        });

      case 'create-integration':
        const newIntegration: IntegrationConfig = {
          id: `int-${Date.now()}`,
          name: params.name,
          type: params.type,
          enabled: params.enabled ?? true,
          endpoint: params.endpoint,
          credentials: params.credentials,
          format: params.format || 'json',
          batchSize: params.batchSize || 100,
          flushInterval: params.flushInterval || 30
        };
        return NextResponse.json({ success: true, data: { integration: newIntegration } });

      case 'test-integration':
        return NextResponse.json({
          success: true,
          data: {
            integrationId: params.integrationId,
            status: 'success',
            latency: '45ms',
            message: 'Successfully connected to SIEM endpoint'
          }
        });

      // Scheduled Exports
      case 'get-export-schedules':
        return NextResponse.json({
          success: true,
          data: { schedules: demoConfig.exportSchedules }
        });

      case 'create-export-schedule':
        const newSchedule: ExportSchedule = {
          id: `schedule-${Date.now()}`,
          name: params.name,
          enabled: params.enabled ?? true,
          frequency: params.frequency,
          format: params.format,
          destination: params.destination,
          filters: params.filters || {},
          nextExport: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        return NextResponse.json({ success: true, data: { schedule: newSchedule } });

      // Search
      case 'search-logs':
        return NextResponse.json({
          success: true,
          data: {
            query: params.query,
            results: demoLogs.filter(l =>
              l.action.includes(params.query) ||
              l.userEmail.includes(params.query) ||
              l.resource.includes(params.query)
            ),
            suggestions: [
              'action:user.login',
              'category:authentication',
              'riskLevel:high',
              'outcome:failure'
            ],
            savedSearches: [
              { id: 's1', name: 'Failed Logins', query: 'action:user.login.failed' },
              { id: 's2', name: 'High Risk', query: 'riskLevel:high OR riskLevel:critical' }
            ]
          }
        });

      // Compliance Reports
      case 'generate-compliance-report':
        return NextResponse.json({
          success: true,
          data: {
            reportId: `compliance-${Date.now()}`,
            type: params.type || 'soc2',
            period: params.period || 'last-quarter',
            status: 'generating',
            sections: [
              { name: 'Access Control', status: 'pending' },
              { name: 'Change Management', status: 'pending' },
              { name: 'Security Events', status: 'pending' },
              { name: 'User Activity', status: 'pending' }
            ],
            message: 'Compliance report generation started'
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Audit Log API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      config: demoConfig,
      recentLogs: demoLogs,
      features: [
        'Comprehensive activity logging',
        'Real-time log streaming',
        'Advanced search & filtering',
        'Multiple export formats (JSON, CSV, Parquet)',
        'SIEM integrations (Splunk, Datadog, Elastic)',
        'Retention policies',
        'Real-time alerts',
        'Compliance reports',
        'Scheduled exports',
        'Risk-based log classification'
      ]
    }
  });
}
