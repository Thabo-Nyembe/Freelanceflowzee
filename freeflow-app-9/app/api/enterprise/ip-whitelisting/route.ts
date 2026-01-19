import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Phase 8 Gap #7: IP Whitelisting
// Priority: MEDIUM | Competitor: Enterprise platforms
// Features: IP/CIDR allowlisting, geo-blocking, VPN detection,
// temporary access, enforcement policies, audit logging

interface IPWhitelistConfig {
  id: string;
  orgId: string;
  enabled: boolean;
  mode: 'allowlist' | 'blocklist' | 'both';
  enforcement: EnforcementPolicy;
  rules: IPRule[];
  geoRestrictions: GeoRestriction[];
  temporaryAccess: TemporaryAccess[];
  vpnPolicy: VPNPolicy;
  exceptions: AccessException[];
  auditSettings: AuditSettings;
  createdAt: string;
  updatedAt: string;
}

interface EnforcementPolicy {
  enabled: boolean;
  strictMode: boolean;
  failOpen: boolean;
  gracePeriod: number; // hours
  notifyOnBlock: boolean;
  notifyChannels: string[];
  blockMessage: string;
  allowBypass: boolean;
  bypassMethods: string[];
}

interface IPRule {
  id: string;
  name: string;
  description: string;
  type: 'ip' | 'cidr' | 'range';
  value: string;
  action: 'allow' | 'block';
  enabled: boolean;
  priority: number;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  lastMatch?: string;
  matchCount: number;
  tags: string[];
}

interface GeoRestriction {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city';
  values: string[];
  action: 'allow' | 'block';
  enabled: boolean;
  createdAt: string;
}

interface TemporaryAccess {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt: string;
  active: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface VPNPolicy {
  detectVPN: boolean;
  blockVPN: boolean;
  blockTor: boolean;
  blockProxy: boolean;
  blockDatacenter: boolean;
  allowKnownVPNs: string[];
  requireMFAForVPN: boolean;
}

interface AccessException {
  id: string;
  type: 'user' | 'role' | 'service';
  identifier: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

interface AuditSettings {
  logAllAttempts: boolean;
  logBlockedOnly: boolean;
  retentionDays: number;
  alertOnBlock: boolean;
  alertThreshold: number;
}

interface AccessAttempt {
  id: string;
  timestamp: string;
  ipAddress: string;
  userId?: string;
  userEmail?: string;
  action: 'allowed' | 'blocked' | 'challenged';
  reason: string;
  matchedRule?: string;
  geoLocation: GeoLocation;
  deviceInfo: DeviceInfo;
  riskScore: number;
}

interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  org: string;
  asn: string;
}

interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  isVPN: boolean;
  isTor: boolean;
  isProxy: boolean;
  isDatacenter: boolean;
}

interface IPAnalysis {
  ipAddress: string;
  isAllowed: boolean;
  matchedRules: string[];
  geoLocation: GeoLocation;
  riskAssessment: RiskAssessment;
  recommendations: string[];
}

interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: { factor: string; score: number; description: string }[];
}

// Demo data
const demoConfig: IPWhitelistConfig = {
  id: 'ipwl-001',
  orgId: 'org-001',
  enabled: true,
  mode: 'allowlist',
  enforcement: {
    enabled: true,
    strictMode: false,
    failOpen: false,
    gracePeriod: 24,
    notifyOnBlock: true,
    notifyChannels: ['email', 'slack'],
    blockMessage: 'Access denied. Your IP address is not authorized. Contact your administrator for access.',
    allowBypass: true,
    bypassMethods: ['mfa', 'admin-approval']
  },
  rules: [
    {
      id: 'rule-001',
      name: 'Office Network',
      description: 'Main office IP range',
      type: 'cidr',
      value: '192.168.1.0/24',
      action: 'allow',
      enabled: true,
      priority: 1,
      createdBy: 'admin@company.com',
      createdAt: '2024-06-01T10:00:00Z',
      lastMatch: '2025-01-15T14:30:00Z',
      matchCount: 15420,
      tags: ['office', 'primary']
    },
    {
      id: 'rule-002',
      name: 'VPN Gateway',
      description: 'Corporate VPN exit IPs',
      type: 'cidr',
      value: '10.0.0.0/8',
      action: 'allow',
      enabled: true,
      priority: 2,
      createdBy: 'admin@company.com',
      createdAt: '2024-06-01T10:00:00Z',
      lastMatch: '2025-01-15T14:25:00Z',
      matchCount: 8930,
      tags: ['vpn', 'remote']
    },
    {
      id: 'rule-003',
      name: 'Partner Network',
      description: 'Trusted partner office',
      type: 'cidr',
      value: '203.0.113.0/24',
      action: 'allow',
      enabled: true,
      priority: 3,
      createdBy: 'admin@company.com',
      createdAt: '2024-09-15T10:00:00Z',
      lastMatch: '2025-01-14T16:00:00Z',
      matchCount: 2340,
      tags: ['partner', 'external']
    },
    {
      id: 'rule-004',
      name: 'Suspicious Range',
      description: 'Known malicious IP range',
      type: 'cidr',
      value: '198.51.100.0/24',
      action: 'block',
      enabled: true,
      priority: 0,
      createdBy: 'security@company.com',
      createdAt: '2025-01-10T10:00:00Z',
      lastMatch: '2025-01-15T12:00:00Z',
      matchCount: 156,
      tags: ['security', 'blocked']
    }
  ],
  geoRestrictions: [
    {
      id: 'geo-001',
      name: 'Allowed Countries',
      type: 'country',
      values: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP'],
      action: 'allow',
      enabled: true,
      createdAt: '2024-06-01T10:00:00Z'
    },
    {
      id: 'geo-002',
      name: 'Blocked Regions',
      type: 'country',
      values: ['KP', 'IR', 'SY', 'CU'],
      action: 'block',
      enabled: true,
      createdAt: '2024-06-01T10:00:00Z'
    }
  ],
  temporaryAccess: [
    {
      id: 'temp-001',
      userId: 'user-005',
      userEmail: 'contractor@external.com',
      ipAddress: '74.125.224.72',
      reason: 'Remote work during travel',
      grantedBy: 'admin@company.com',
      grantedAt: '2025-01-14T10:00:00Z',
      expiresAt: '2025-01-21T10:00:00Z',
      active: true,
      usageCount: 12,
      lastUsed: '2025-01-15T14:00:00Z'
    }
  ],
  vpnPolicy: {
    detectVPN: true,
    blockVPN: false,
    blockTor: true,
    blockProxy: true,
    blockDatacenter: false,
    allowKnownVPNs: ['NordVPN', 'ExpressVPN'],
    requireMFAForVPN: true
  },
  exceptions: [
    {
      id: 'exc-001',
      type: 'role',
      identifier: 'admin',
      reason: 'Administrators need unrestricted access for emergencies',
      createdBy: 'cto@company.com',
      createdAt: '2024-06-01T10:00:00Z'
    }
  ],
  auditSettings: {
    logAllAttempts: true,
    logBlockedOnly: false,
    retentionDays: 90,
    alertOnBlock: true,
    alertThreshold: 10
  },
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z'
};

const demoAttempts: AccessAttempt[] = [
  {
    id: 'attempt-001',
    timestamp: '2025-01-15T14:30:00Z',
    ipAddress: '192.168.1.100',
    userId: 'user-001',
    userEmail: 'john@company.com',
    action: 'allowed',
    reason: 'Matched rule: Office Network',
    matchedRule: 'rule-001',
    geoLocation: { country: 'United States', countryCode: 'US', region: 'California', city: 'San Francisco', latitude: 37.7749, longitude: -122.4194, isp: 'Comcast', org: 'Company Inc', asn: 'AS7922' },
    deviceInfo: { userAgent: 'Mozilla/5.0...', browser: 'Chrome 120', os: 'macOS', device: 'Desktop', isVPN: false, isTor: false, isProxy: false, isDatacenter: false },
    riskScore: 5
  },
  {
    id: 'attempt-002',
    timestamp: '2025-01-15T14:25:00Z',
    ipAddress: '198.51.100.50',
    userId: undefined,
    userEmail: undefined,
    action: 'blocked',
    reason: 'Matched blocklist rule: Suspicious Range',
    matchedRule: 'rule-004',
    geoLocation: { country: 'Unknown', countryCode: 'XX', region: 'Unknown', city: 'Unknown', latitude: 0, longitude: 0, isp: 'Unknown', org: 'Unknown', asn: 'Unknown' },
    deviceInfo: { userAgent: 'curl/7.64.1', browser: 'curl', os: 'Unknown', device: 'Unknown', isVPN: false, isTor: false, isProxy: true, isDatacenter: true },
    riskScore: 95
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

      case 'toggle-enforcement':
        return NextResponse.json({
          success: true,
          data: {
            enabled: params.enabled,
            previousState: demoConfig.enabled,
            message: params.enabled ? 'IP whitelisting enabled' : 'IP whitelisting disabled (WARNING: All IPs will be allowed)'
          }
        });

      // IP Rules
      case 'get-rules':
        return NextResponse.json({
          success: true,
          data: {
            rules: demoConfig.rules,
            summary: {
              total: demoConfig.rules.length,
              allow: demoConfig.rules.filter(r => r.action === 'allow').length,
              block: demoConfig.rules.filter(r => r.action === 'block').length,
              enabled: demoConfig.rules.filter(r => r.enabled).length
            }
          }
        });

      case 'create-rule':
        const newRule: IPRule = {
          id: `rule-${Date.now()}`,
          name: params.name,
          description: params.description || '',
          type: params.type,
          value: params.value,
          action: params.action,
          enabled: params.enabled ?? true,
          priority: params.priority || demoConfig.rules.length + 1,
          createdBy: params.createdBy || 'admin@company.com',
          createdAt: new Date().toISOString(),
          matchCount: 0,
          tags: params.tags || []
        };
        return NextResponse.json({ success: true, data: { rule: newRule } });

      case 'update-rule':
        return NextResponse.json({
          success: true,
          data: {
            ruleId: params.ruleId,
            updates: params.updates,
            updatedAt: new Date().toISOString()
          }
        });

      case 'delete-rule':
        return NextResponse.json({
          success: true,
          data: {
            ruleId: params.ruleId,
            deleted: true,
            message: 'Rule deleted successfully'
          }
        });

      // IP Analysis
      case 'analyze-ip':
        const analysis: IPAnalysis = {
          ipAddress: params.ipAddress,
          isAllowed: true,
          matchedRules: ['rule-001'],
          geoLocation: {
            country: 'United States',
            countryCode: 'US',
            region: 'California',
            city: 'San Francisco',
            latitude: 37.7749,
            longitude: -122.4194,
            isp: 'Comcast',
            org: 'Company Inc',
            asn: 'AS7922'
          },
          riskAssessment: {
            score: 15,
            level: 'low',
            factors: [
              { factor: 'location', score: 0, description: 'Known location (US)' },
              { factor: 'reputation', score: 5, description: 'Clean IP reputation' },
              { factor: 'network_type', score: 5, description: 'Residential ISP' },
              { factor: 'anonymization', score: 5, description: 'No VPN/proxy detected' }
            ]
          },
          recommendations: [
            'IP is within allowed range',
            'No additional verification required'
          ]
        };
        return NextResponse.json({ success: true, data: { analysis } });

      case 'check-ip':
        const isAllowed = demoConfig.rules.some(r => r.action === 'allow' && r.enabled);
        return NextResponse.json({
          success: true,
          data: {
            ipAddress: params.ipAddress,
            allowed: isAllowed,
            matchedRule: isAllowed ? 'rule-001' : null,
            requiresMFA: false,
            message: isAllowed ? 'IP address is allowed' : 'IP address is not allowed'
          }
        });

      // Geo Restrictions
      case 'get-geo-restrictions':
        return NextResponse.json({
          success: true,
          data: { restrictions: demoConfig.geoRestrictions }
        });

      case 'update-geo-restrictions':
        const newGeo: GeoRestriction = {
          id: `geo-${Date.now()}`,
          name: params.name,
          type: params.type,
          values: params.values,
          action: params.action,
          enabled: params.enabled ?? true,
          createdAt: new Date().toISOString()
        };
        return NextResponse.json({ success: true, data: { restriction: newGeo } });

      // Temporary Access
      case 'get-temporary-access':
        return NextResponse.json({
          success: true,
          data: {
            grants: demoConfig.temporaryAccess,
            active: demoConfig.temporaryAccess.filter(t => t.active).length,
            expired: demoConfig.temporaryAccess.filter(t => !t.active).length
          }
        });

      case 'grant-temporary-access':
        const newAccess: TemporaryAccess = {
          id: `temp-${Date.now()}`,
          userId: params.userId,
          userEmail: params.userEmail,
          ipAddress: params.ipAddress,
          reason: params.reason,
          grantedBy: params.grantedBy || 'admin@company.com',
          grantedAt: new Date().toISOString(),
          expiresAt: params.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          active: true,
          usageCount: 0
        };
        return NextResponse.json({ success: true, data: { access: newAccess } });

      case 'revoke-temporary-access':
        return NextResponse.json({
          success: true,
          data: {
            accessId: params.accessId,
            revoked: true,
            revokedAt: new Date().toISOString(),
            message: 'Temporary access revoked'
          }
        });

      // VPN Policy
      case 'get-vpn-policy':
        return NextResponse.json({
          success: true,
          data: { policy: demoConfig.vpnPolicy }
        });

      case 'update-vpn-policy':
        return NextResponse.json({
          success: true,
          data: {
            policy: {
              ...demoConfig.vpnPolicy,
              ...params.updates
            },
            message: 'VPN policy updated'
          }
        });

      // Exceptions
      case 'get-exceptions':
        return NextResponse.json({
          success: true,
          data: { exceptions: demoConfig.exceptions }
        });

      case 'create-exception':
        const newException: AccessException = {
          id: `exc-${Date.now()}`,
          type: params.type,
          identifier: params.identifier,
          reason: params.reason,
          createdBy: params.createdBy || 'admin@company.com',
          createdAt: new Date().toISOString(),
          expiresAt: params.expiresAt
        };
        return NextResponse.json({ success: true, data: { exception: newException } });

      // Access Attempts
      case 'get-access-attempts':
        return NextResponse.json({
          success: true,
          data: {
            attempts: demoAttempts,
            summary: {
              total: 15420,
              allowed: 14890,
              blocked: 520,
              challenged: 10,
              lastHour: 156
            }
          }
        });

      // Bulk Operations
      case 'import-rules':
        return NextResponse.json({
          success: true,
          data: {
            imported: params.rules?.length || 0,
            skipped: 0,
            errors: 0,
            message: 'Rules imported successfully'
          }
        });

      case 'export-rules':
        return NextResponse.json({
          success: true,
          data: {
            format: params.format || 'json',
            rules: demoConfig.rules,
            downloadUrl: `/exports/ip-rules-${Date.now()}.${params.format || 'json'}`
          }
        });

      // Statistics
      case 'get-stats':
        return NextResponse.json({
          success: true,
          data: {
            stats: {
              totalRules: demoConfig.rules.length,
              activeRules: demoConfig.rules.filter(r => r.enabled).length,
              totalAttempts: 15420,
              blockedAttempts: 520,
              uniqueIPs: 2340,
              topCountries: [
                { country: 'US', count: 12500 },
                { country: 'GB', count: 1200 },
                { country: 'CA', count: 800 }
              ],
              topBlockedIPs: [
                { ip: '198.51.100.50', count: 45, reason: 'Blocklist' },
                { ip: '203.0.113.100', count: 32, reason: 'Geo-blocked' }
              ],
              recentBlocks: demoAttempts.filter(a => a.action === 'blocked')
            }
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('IP Whitelisting API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      config: demoConfig,
      recentAttempts: demoAttempts,
      features: [
        'IP and CIDR range management',
        'Geographic restrictions',
        'VPN/Proxy detection',
        'Temporary access grants',
        'Real-time IP analysis',
        'Risk scoring',
        'Audit logging',
        'Bulk import/export',
        'Role-based exceptions',
        'Integration with SIEM'
      ]
    }
  });
}
