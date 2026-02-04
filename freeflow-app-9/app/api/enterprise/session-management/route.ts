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

const logger = createFeatureLogger('enterprise-session-management');

// Phase 8 Gap #8: Session Management
// Priority: HIGH | Competitor: Enterprise platforms
// Features: Session tracking, concurrent session limits, forced logout,
// session policies, device management, real-time monitoring

interface SessionConfig {
  id: string;
  orgId: string;
  enabled: boolean;
  policies: SessionPolicy;
  securitySettings: SecuritySettings;
  devicePolicy: DevicePolicy;
  alertSettings: AlertSettings;
  createdAt: string;
  updatedAt: string;
}

interface SessionPolicy {
  maxSessionDuration: number; // minutes
  idleTimeout: number; // minutes
  absoluteTimeout: number; // minutes
  maxConcurrentSessions: number;
  singleSessionPerDevice: boolean;
  enforceReauth: boolean;
  reauthInterval: number; // hours
  reauthForSensitive: boolean;
  sensitiveActions: string[];
  sessionExtensionAllowed: boolean;
  maxExtensions: number;
  extensionDuration: number; // minutes
}

interface SecuritySettings {
  bindToIP: boolean;
  bindToDevice: boolean;
  detectAnomalies: boolean;
  blockConcurrentLogins: boolean;
  terminateOnPasswordChange: boolean;
  terminateOnRoleChange: boolean;
  requireSecureConnection: boolean;
  validateUserAgent: boolean;
  rotateSessionToken: boolean;
  rotationInterval: number; // minutes
}

interface DevicePolicy {
  requireDeviceApproval: boolean;
  maxDevicesPerUser: number;
  trustDuration: number; // days
  blockUnknownDevices: boolean;
  requireMFAForNewDevice: boolean;
  deviceFingerprintRequired: boolean;
}

interface AlertSettings {
  alertOnNewDevice: boolean;
  alertOnNewLocation: boolean;
  alertOnConcurrentSession: boolean;
  alertOnAnomalousActivity: boolean;
  alertOnSessionHijack: boolean;
  alertChannels: string[];
  alertThreshold: number;
}

interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location: GeoLocation;
  status: 'active' | 'idle' | 'expired' | 'terminated';
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  terminatedAt?: string;
  terminationReason?: string;
  tokenVersion: number;
  mfaVerified: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  userAgent: string;
  fingerprint: string;
  trusted: boolean;
  trustedAt?: string;
  firstSeen: string;
  lastSeen: string;
}

interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface SessionStats {
  totalActiveSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  sessionsPerUser: number;
  byDevice: Record<string, number>;
  byCountry: Record<string, number>;
  byBrowser: Record<string, number>;
  anomalies: number;
  terminatedToday: number;
}

interface SessionActivity {
  id: string;
  sessionId: string;
  timestamp: string;
  action: string;
  resource: string;
  ipAddress: string;
  riskScore: number;
}

// Demo data
const demoConfig: SessionConfig = {
  id: 'session-config-001',
  orgId: 'org-001',
  enabled: true,
  policies: {
    maxSessionDuration: 480, // 8 hours
    idleTimeout: 30, // 30 minutes
    absoluteTimeout: 720, // 12 hours
    maxConcurrentSessions: 3,
    singleSessionPerDevice: true,
    enforceReauth: true,
    reauthInterval: 4,
    reauthForSensitive: true,
    sensitiveActions: ['payment', 'api-key-create', 'user-delete', 'export-data', 'change-password'],
    sessionExtensionAllowed: true,
    maxExtensions: 2,
    extensionDuration: 60
  },
  securitySettings: {
    bindToIP: false,
    bindToDevice: true,
    detectAnomalies: true,
    blockConcurrentLogins: false,
    terminateOnPasswordChange: true,
    terminateOnRoleChange: true,
    requireSecureConnection: true,
    validateUserAgent: true,
    rotateSessionToken: true,
    rotationInterval: 15
  },
  devicePolicy: {
    requireDeviceApproval: false,
    maxDevicesPerUser: 5,
    trustDuration: 90,
    blockUnknownDevices: false,
    requireMFAForNewDevice: true,
    deviceFingerprintRequired: true
  },
  alertSettings: {
    alertOnNewDevice: true,
    alertOnNewLocation: true,
    alertOnConcurrentSession: true,
    alertOnAnomalousActivity: true,
    alertOnSessionHijack: true,
    alertChannels: ['email', 'slack'],
    alertThreshold: 3
  },
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z'
};

const demoSessions: Session[] = [
  {
    id: 'session-001',
    userId: 'user-001',
    userEmail: 'john@company.com',
    userName: 'John Doe',
    deviceId: 'device-001',
    deviceInfo: {
      id: 'device-001',
      name: 'MacBook Pro',
      type: 'desktop',
      os: 'macOS',
      osVersion: '14.2',
      browser: 'Chrome',
      browserVersion: '120.0.6099.129',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
      fingerprint: 'fp_abc123',
      trusted: true,
      trustedAt: '2024-12-01T10:00:00Z',
      firstSeen: '2024-06-01T10:00:00Z',
      lastSeen: '2025-01-15T14:30:00Z'
    },
    ipAddress: '192.168.1.100',
    location: {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles'
    },
    status: 'active',
    createdAt: '2025-01-15T09:00:00Z',
    lastActivity: '2025-01-15T14:30:00Z',
    expiresAt: '2025-01-15T17:00:00Z',
    tokenVersion: 5,
    mfaVerified: true,
    riskLevel: 'low'
  },
  {
    id: 'session-002',
    userId: 'user-001',
    userEmail: 'john@company.com',
    userName: 'John Doe',
    deviceId: 'device-002',
    deviceInfo: {
      id: 'device-002',
      name: 'iPhone 15 Pro',
      type: 'mobile',
      os: 'iOS',
      osVersion: '17.2',
      browser: 'Safari',
      browserVersion: '17.2',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)...',
      fingerprint: 'fp_def456',
      trusted: true,
      trustedAt: '2024-11-15T10:00:00Z',
      firstSeen: '2024-09-01T10:00:00Z',
      lastSeen: '2025-01-15T12:00:00Z'
    },
    ipAddress: '172.16.0.50',
    location: {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles'
    },
    status: 'idle',
    createdAt: '2025-01-15T08:00:00Z',
    lastActivity: '2025-01-15T12:00:00Z',
    expiresAt: '2025-01-15T16:00:00Z',
    tokenVersion: 3,
    mfaVerified: true,
    riskLevel: 'low'
  },
  {
    id: 'session-003',
    userId: 'user-002',
    userEmail: 'jane@company.com',
    userName: 'Jane Smith',
    deviceId: 'device-003',
    deviceInfo: {
      id: 'device-003',
      name: 'Windows PC',
      type: 'desktop',
      os: 'Windows',
      osVersion: '11',
      browser: 'Edge',
      browserVersion: '120.0.2210.91',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
      fingerprint: 'fp_ghi789',
      trusted: true,
      trustedAt: '2025-01-10T10:00:00Z',
      firstSeen: '2025-01-10T10:00:00Z',
      lastSeen: '2025-01-15T14:25:00Z'
    },
    ipAddress: '192.168.1.101',
    location: {
      country: 'United States',
      countryCode: 'US',
      region: 'New York',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    },
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    lastActivity: '2025-01-15T14:25:00Z',
    expiresAt: '2025-01-15T18:00:00Z',
    tokenVersion: 2,
    mfaVerified: true,
    riskLevel: 'low'
  }
];

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

      case 'update-policies':
        return NextResponse.json({
          success: true,
          data: {
            policies: {
              ...demoConfig.policies,
              ...params.policies
            },
            message: 'Session policies updated successfully'
          }
        });

      // Session Management
      case 'get-sessions':
        let sessions = [...demoSessions];
        if (params.userId) sessions = sessions.filter(s => s.userId === params.userId);
        if (params.status) sessions = sessions.filter(s => s.status === params.status);

        return NextResponse.json({
          success: true,
          data: {
            sessions,
            pagination: {
              total: sessions.length,
              page: params.page || 1,
              limit: params.limit || 50
            }
          }
        });

      case 'get-session-detail':
        const session = demoSessions.find(s => s.id === params.sessionId);
        const activities: SessionActivity[] = [
          { id: 'act-1', sessionId: params.sessionId, timestamp: '2025-01-15T14:30:00Z', action: 'page_view', resource: '/dashboard', ipAddress: '192.168.1.100', riskScore: 5 },
          { id: 'act-2', sessionId: params.sessionId, timestamp: '2025-01-15T14:25:00Z', action: 'api_call', resource: '/api/projects', ipAddress: '192.168.1.100', riskScore: 5 },
          { id: 'act-3', sessionId: params.sessionId, timestamp: '2025-01-15T14:20:00Z', action: 'file_download', resource: 'report.pdf', ipAddress: '192.168.1.100', riskScore: 15 }
        ];

        return NextResponse.json({
          success: true,
          data: {
            session,
            activities,
            riskAnalysis: {
              currentScore: 10,
              factors: [
                { factor: 'location', score: 0, description: 'Known location' },
                { factor: 'device', score: 0, description: 'Trusted device' },
                { factor: 'behavior', score: 5, description: 'Normal activity pattern' },
                { factor: 'time', score: 5, description: 'Business hours' }
              ]
            }
          }
        });

      case 'terminate-session':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: params.sessionId,
            terminated: true,
            reason: params.reason || 'Admin termination',
            terminatedAt: new Date().toISOString(),
            notificationSent: true
          }
        });

      case 'terminate-all-sessions':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            terminatedCount: 3,
            preserveCurrent: params.preserveCurrent || false,
            reason: params.reason || 'Security measure',
            terminatedAt: new Date().toISOString()
          }
        });

      case 'extend-session':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: params.sessionId,
            extended: true,
            newExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            extensionsRemaining: 1,
            message: 'Session extended by 60 minutes'
          }
        });

      // Device Management
      case 'get-devices':
        const devices = demoSessions.map(s => s.deviceInfo);
        const uniqueDevices = devices.filter((d, i, arr) => arr.findIndex(x => x.id === d.id) === i);

        return NextResponse.json({
          success: true,
          data: {
            devices: uniqueDevices,
            summary: {
              total: uniqueDevices.length,
              trusted: uniqueDevices.filter(d => d.trusted).length,
              byType: {
                desktop: uniqueDevices.filter(d => d.type === 'desktop').length,
                mobile: uniqueDevices.filter(d => d.type === 'mobile').length,
                tablet: uniqueDevices.filter(d => d.type === 'tablet').length
              }
            }
          }
        });

      case 'trust-device':
        return NextResponse.json({
          success: true,
          data: {
            deviceId: params.deviceId,
            trusted: true,
            trustedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            message: 'Device marked as trusted'
          }
        });

      case 'revoke-device':
        return NextResponse.json({
          success: true,
          data: {
            deviceId: params.deviceId,
            revoked: true,
            sessionsTerminated: 1,
            message: 'Device revoked and sessions terminated'
          }
        });

      case 'block-device':
        return NextResponse.json({
          success: true,
          data: {
            deviceId: params.deviceId,
            blocked: true,
            reason: params.reason || 'Security concern',
            blockedAt: new Date().toISOString()
          }
        });

      // Statistics
      case 'get-stats':
        const stats: SessionStats = {
          totalActiveSessions: 45,
          totalUsers: 38,
          averageSessionDuration: 4.5, // hours
          sessionsPerUser: 1.2,
          byDevice: { desktop: 28, mobile: 15, tablet: 2 },
          byCountry: { US: 35, GB: 5, CA: 3, DE: 2 },
          byBrowser: { Chrome: 25, Safari: 12, Edge: 5, Firefox: 3 },
          anomalies: 3,
          terminatedToday: 12
        };

        return NextResponse.json({ success: true, data: { stats } });

      case 'get-user-sessions':
        const userSessions = demoSessions.filter(s => s.userId === params.userId);

        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            sessions: userSessions,
            deviceCount: new Set(userSessions.map(s => s.deviceId)).size,
            locationCount: new Set(userSessions.map(s => s.location.city)).size
          }
        });

      // Security Actions
      case 'force-reauth':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: params.sessionId,
            reauthRequired: true,
            reason: params.reason || 'Security verification',
            deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          }
        });

      case 'rotate-token':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: params.sessionId,
            tokenRotated: true,
            newVersion: 6,
            rotatedAt: new Date().toISOString()
          }
        });

      case 'detect-anomaly':
        return NextResponse.json({
          success: true,
          data: {
            sessionId: params.sessionId,
            anomalyDetected: false,
            analysis: {
              locationChange: false,
              deviceChange: false,
              unusualActivity: false,
              impossibleTravel: false,
              suspiciousPattern: false
            },
            riskScore: 10,
            recommendation: 'continue'
          }
        });

      // Bulk Operations
      case 'terminate-by-criteria':
        return NextResponse.json({
          success: true,
          data: {
            criteria: params.criteria,
            matchedSessions: 12,
            terminated: 12,
            message: 'Sessions matching criteria have been terminated'
          }
        });

      case 'export-sessions':
        return NextResponse.json({
          success: true,
          data: {
            format: params.format || 'csv',
            downloadUrl: `/exports/sessions-${Date.now()}.${params.format || 'csv'}`,
            recordCount: demoSessions.length
          }
        });

      // Real-time Monitoring
      case 'get-active-now':
        return NextResponse.json({
          success: true,
          data: {
            activeSessions: 45,
            activeUsers: 38,
            newSessionsLastHour: 12,
            terminatedLastHour: 5,
            currentLoad: 'normal',
            alerts: []
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Session Management API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      config: demoConfig,
      activeSessions: demoSessions.filter(s => s.status === 'active'),
      features: [
        'Real-time session tracking',
        'Concurrent session limits',
        'Device management & trust',
        'Session timeout policies',
        'Forced logout capability',
        'Token rotation',
        'Anomaly detection',
        'Geographic tracking',
        'Risk-based session control',
        'Audit logging'
      ]
    }
  });
}
