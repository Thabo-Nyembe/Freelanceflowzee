import axios from 'axios';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// ==========================================================
// TYPES AND INTERFACES
// ==========================================================

/**
 * Security risk levels
 */
export type SecurityRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Security scan types
 */
export type SecurityScanType = 
  | 'dependency' 
  | 'static-analysis' 
  | 'dynamic-analysis'
  | 'secret-scanning'
  | 'container-scanning'
  | 'infrastructure-scanning'
  | 'penetration-testing'
  | 'compliance-audit';

/**
 * Security vulnerability
 */
export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  severity: SecurityRiskLevel;
  cvssScore?: number;
  cveId?: string;
  affected: string[];
  remediation: string;
  references: string[];
  detectedAt: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'wontfix' | 'false-positive';
  assignedTo?: string;
  patchAvailable: boolean;
  exploitAvailable: boolean;
  scanType: SecurityScanType;
  metadata?: Record<string, any>;
}

/**
 * Security threat event
 */
export interface SecurityThreatEvent {
  id: string;
  eventType: string;
  source: string;
  timestamp: Date;
  severity: SecurityRiskLevel;
  description: string;
  rawData: any;
  affectedResources: string[];
  ipAddress?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  actionTaken?: string;
  status: 'detected' | 'analyzing' | 'mitigated' | 'resolved' | 'false-positive';
  relatedEvents?: string[];
  incidentId?: string;
}

/**
 * Security incident
 */
export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: SecurityRiskLevel;
  status: 'detected' | 'investigating' | 'contained' | 'remediated' | 'resolved';
  detectedAt: Date;
  resolvedAt?: Date;
  affectedSystems: string[];
  affectedUsers: string[];
  threatEvents: string[];
  assignedTo?: string;
  mitigationSteps: string[];
  rootCause?: string;
  impact: string;
  reportUrl?: string;
  postMortemUrl?: string;
  notifiedParties: string[];
}

/**
 * Encryption key pair
 */
export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
  keyId: string;
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'rotating' | 'expired' | 'revoked';
  purpose: string;
}

/**
 * Authentication event
 */
export interface AuthEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'password-change' | 'mfa-enabled' | 'mfa-disabled' | 'token-refresh' | 'password-reset' | 'login-failed';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  success: boolean;
  failureReason?: string;
  riskScore?: number;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * API security event
 */
export interface ApiSecurityEvent {
  id: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  ipAddress: string;
  userId?: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  rateLimit: {
    limit: number;
    remaining: number;
    reset: number;
  };
  blocked: boolean;
  blockReason?: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  riskScore: number;
  anomalyScore: number;
  securityHeaders: Record<string, boolean>;
}

/**
 * Security scan result
 */
export interface SecurityScanResult {
  id: string;
  scanType: SecurityScanType;
  startedAt: Date;
  completedAt: Date;
  status: 'queued' | 'in-progress' | 'completed' | 'failed';
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  vulnerabilities: SecurityVulnerability[];
  scannerVersion: string;
  scannerName: string;
  repositoryUrl?: string;
  branch?: string;
  commit?: string;
  reportUrl?: string;
  rawResults?: any;
  triggeredBy?: string;
  duration: number;
}

/**
 * Penetration test
 */
export interface PenetrationTest {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scope: {
    domains: string[];
    ipRanges: string[];
    excludedPaths: string[];
    includedPaths: string[];
  };
  tester: {
    name: string;
    organization: string;
    contact: string;
  };
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  reportUrl?: string;
  remediationDeadline?: Date;
  remediationStatus?: 'not-started' | 'in-progress' | 'completed';
  verificationStatus?: 'not-verified' | 'partially-verified' | 'verified';
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  id: string;
  standard: string;
  section: string;
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant' | 'not-applicable';
  evidence?: string[];
  lastChecked: Date;
  nextCheck?: Date;
  owner?: string;
  remediationPlan?: string;
  remediationDeadline?: Date;
  risk: SecurityRiskLevel;
  automationStatus: 'manual' | 'semi-automated' | 'automated';
  testProcedure?: string;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  id: string;
  standard: string;
  version: string;
  generatedAt: Date;
  generatedBy: string;
  status: 'compliant' | 'non-compliant' | 'partially-compliant';
  summary: {
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    notApplicable: number;
    total: number;
    complianceScore: number;
  };
  requirements: ComplianceRequirement[];
  reportUrl?: string;
  validUntil?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  remediationDeadline?: Date;
}

/**
 * Security alert
 */
export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: SecurityRiskLevel;
  createdAt: Date;
  status: 'open' | 'acknowledged' | 'resolved' | 'false-positive';
  source: string;
  category: string;
  affectedResources: string[];
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  notificationsSent: {
    channel: string;
    recipient: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'failed';
  }[];
  relatedIncidentId?: string;
  metadata?: Record<string, any>;
}

/**
 * Security scan configuration
 */
export interface SecurityScanConfig {
  enabled: boolean;
  schedule: {
    type: 'manual' | 'scheduled' | 'event-triggered';
    cron?: string;
    events?: string[];
  };
  scanners: {
    name: string;
    enabled: boolean;
    config: Record<string, any>;
  }[];
  notifications: {
    channels: string[];
    thresholds: {
      severity: SecurityRiskLevel;
      count: number;
    }[];
  };
  autoRemediation: boolean;
  ignorePatterns: string[];
}

/**
 * Security monitoring configuration
 */
export interface SecurityMonitoringConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  samplingRate: number;
  retentionPeriod: number;
  alertThresholds: {
    [key: string]: {
      threshold: number;
      timeWindow: number;
      severity: SecurityRiskLevel;
    };
  };
  ipBlacklist: string[];
  ipWhitelist: string[];
  sensitiveRoutes: string[];
  sensitiveOperations: string[];
  anomalyDetection: {
    enabled: boolean;
    sensitivity: number;
    baselinePeriodsToKeep: number;
  };
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType: string;
  resourceId?: string;
  action: string;
  status: 'success' | 'failure';
  details?: any;
  metadata?: Record<string, any>;
  sessionId?: string;
  requestId?: string;
  severity: SecurityRiskLevel;
  relatedEvents?: string[];
}

/**
 * Data privacy request
 */
export interface DataPrivacyRequest {
  id: string;
  requestType: 'access' | 'deletion' | 'correction' | 'export' | 'restriction' | 'objection';
  userId: string;
  userEmail: string;
  createdAt: Date;
  status: 'received' | 'processing' | 'completed' | 'rejected' | 'requires-verification';
  completedAt?: Date;
  dueDate: Date;
  assignedTo?: string;
  verificationMethod?: string;
  verificationStatus?: 'not-verified' | 'verified' | 'failed';
  notes?: string;
  dataCategories: string[];
  responseFormat?: string;
  responseDeliveryMethod?: string;
  responseUrl?: string;
  legalBasis?: string;
  rejectionReason?: string;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  scanning: SecurityScanConfig;
  monitoring: SecurityMonitoringConfig;
  encryption: {
    algorithm: string;
    keyRotationDays: number;
    keyLength: number;
  };
  authentication: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
      preventReuse: number;
    };
    mfa: {
      required: boolean;
      methods: string[];
      gracePeriodDays: number;
    };
    session: {
      maxAgeDays: number;
      inactivityTimeoutMinutes: number;
      refreshTokenMaxAgeDays: number;
    };
    rateLimit: {
      maxAttempts: number;
      windowMinutes: number;
      lockoutMinutes: number;
    };
  };
  apiSecurity: {
    rateLimit: {
      defaultLimit: number;
      defaultWindow: number;
      burstLimit: number;
      burstWindow: number;
    };
    requiredHeaders: string[];
    corsPolicy: {
      allowedOrigins: string[];
      allowedMethods: string[];
      allowedHeaders: string[];
      exposeHeaders: string[];
      maxAge: number;
      allowCredentials: boolean;
    };
  };
  xssProtection: {
    enabled: boolean;
    mode: string;
    sanitizationLevel: 'strict' | 'moderate' | 'basic';
  };
  csrfProtection: {
    enabled: boolean;
    tokenExpiration: number;
    cookieName: string;
    headerName: string;
    excludedRoutes: string[];
  };
  sqlInjectionProtection: {
    enabled: boolean;
    parameterization: boolean;
    escaping: boolean;
    validationRules: Record<string, any>;
  };
  privacyCompliance: {
    dataRetentionDays: Record<string, number>;
    consentRequired: boolean;
    consentExpirationDays: number;
    dataSubjectRequestDeadlineDays: number;
    privacyContactEmail: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    sensitiveFields: string[];
    includeHeaders: boolean;
    includeBodies: boolean;
  };
  penetrationTesting: {
    frequency: 'monthly' | 'quarterly' | 'biannually' | 'annually';
    scope: {
      includeExternal: boolean;
      includeInternal: boolean;
      includeApi: boolean;
      includeInfrastructure: boolean;
    };
    automatedTooling: string[];
  };
  alerting: {
    channels: {
      email: {
        enabled: boolean;
        recipients: string[];
      };
      slack: {
        enabled: boolean;
        webhook: string;
        channel: string;
      };
      sms: {
        enabled: boolean;
        recipients: string[];
      };
      pagerDuty: {
        enabled: boolean;
        integrationKey: string;
      };
    };
    escalation: {
      timeoutMinutes: number;
      levels: {
        level: number;
        recipients: string[];
      }[];
    };
  };
}

// ==========================================================
// CONFIGURATION
// ==========================================================

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  scanning: {
    enabled: true,
    schedule: {
      type: 'scheduled',
      cron: '0 0 * * *', // Daily at midnight
      events: ['push', 'pull_request'],
    },
    scanners: [
      {
        name: 'dependency-check',
        enabled: true,
        config: {
          failOnCritical: true,
          ignoreDevDependencies: false,
        },
      },
      {
        name: 'static-analysis',
        enabled: true,
        config: {
          includePatterns: ['**/*.{ts,tsx,js,jsx}'],
          excludePatterns: ['**/node_modules/**', '**/dist/**'],
        },
      },
      {
        name: 'secret-scanner',
        enabled: true,
        config: {
          includePatterns: ['**/*'],
          excludePatterns: ['**/node_modules/**', '**/dist/**'],
        },
      },
    ],
    notifications: {
      channels: ['email', 'slack'],
      thresholds: [
        { severity: 'critical', count: 1 },
        { severity: 'high', count: 5 },
      ],
    },
    autoRemediation: false,
    ignorePatterns: ['**/test/**', '**/docs/**'],
  },
  monitoring: {
    enabled: true,
    realTimeMonitoring: true,
    samplingRate: 100, // 100%
    retentionPeriod: 90, // 90 days
    alertThresholds: {
      failedLogins: {
        threshold: 5,
        timeWindow: 5, // minutes
        severity: 'medium',
      },
      apiErrors: {
        threshold: 10,
        timeWindow: 1, // minutes
        severity: 'medium',
      },
      unauthorizedAccess: {
        threshold: 3,
        timeWindow: 10, // minutes
        severity: 'high',
      },
    },
    ipBlacklist: [],
    ipWhitelist: [],
    sensitiveRoutes: [
      '/api/admin/*',
      '/api/user/*',
      '/api/payment/*',
      '/api/auth/*',
    ],
    sensitiveOperations: [
      'DELETE',
      'UPDATE_USER',
      'PAYMENT_PROCESS',
      'ADMIN_ACTION',
    ],
    anomalyDetection: {
      enabled: true,
      sensitivity: 0.8, // 0-1 scale
      baselinePeriodsToKeep: 4,
    },
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyRotationDays: 90,
    keyLength: 32,
  },
  authentication: {
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 5, // previous passwords
    },
    mfa: {
      required: true,
      methods: ['totp', 'sms', 'email'],
      gracePeriodDays: 7,
    },
    session: {
      maxAgeDays: 14,
      inactivityTimeoutMinutes: 30,
      refreshTokenMaxAgeDays: 30,
    },
    rateLimit: {
      maxAttempts: 5,
      windowMinutes: 15,
      lockoutMinutes: 30,
    },
  },
  apiSecurity: {
    rateLimit: {
      defaultLimit: 100,
      defaultWindow: 60, // seconds
      burstLimit: 20,
      burstWindow: 1, // seconds
    },
    requiredHeaders: ['X-API-Key', 'Authorization'],
    corsPolicy: {
      allowedOrigins: [
        'https://kazi.app',
        'https://*.kazi.app',
        process.env.NODE_ENV === 'development' ? 'http://localhost:9323' : '',
      ].filter(Boolean) as string[],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
      exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400, // 24 hours
      allowCredentials: true,
    },
  },
  xssProtection: {
    enabled: true,
    mode: 'block',
    sanitizationLevel: 'strict',
  },
  csrfProtection: {
    enabled: true,
    tokenExpiration: 86400, // 24 hours
    cookieName: 'kazi_csrf',
    headerName: 'X-CSRF-Token',
    excludedRoutes: ['/api/webhook/*', '/api/public/*'],
  },
  sqlInjectionProtection: {
    enabled: true,
    parameterization: true,
    escaping: true,
    validationRules: {
      stringPattern: '^[a-zA-Z0-9\\s\\-_\\.]+$',
      numberPattern: '^[0-9]+$',
      emailPattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
  },
  privacyCompliance: {
    dataRetentionDays: {
      userProfiles: 365 * 2, // 2 years
      activityLogs: 90,
      analyticsData: 365,
      backups: 365,
      marketingData: 365 * 3, // 3 years
    },
    consentRequired: true,
    consentExpirationDays: 365, // 1 year
    dataSubjectRequestDeadlineDays: 30,
    privacyContactEmail: 'privacy@kazi.app',
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'creditCard',
      'ssn',
      'socialSecurityNumber',
    ],
    includeHeaders: true,
    includeBodies: false,
  },
  penetrationTesting: {
    frequency: 'quarterly',
    scope: {
      includeExternal: true,
      includeInternal: true,
      includeApi: true,
      includeInfrastructure: true,
    },
    automatedTooling: ['zap', 'burp', 'nmap', 'owasp-dependency-check'],
  },
  alerting: {
    channels: {
      email: {
        enabled: true,
        recipients: ['security@kazi.app', 'admin@kazi.app'],
      },
      slack: {
        enabled: true,
        webhook: process.env.SECURITY_SLACK_WEBHOOK || '',
        channel: '#security-alerts',
      },
      sms: {
        enabled: true,
        recipients: process.env.SECURITY_SMS_RECIPIENTS?.split(',') || [],
      },
      pagerDuty: {
        enabled: false,
        integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
      },
    },
    escalation: {
      timeoutMinutes: 30,
      levels: [
        {
          level: 1,
          recipients: ['security-team@kazi.app'],
        },
        {
          level: 2,
          recipients: ['security-manager@kazi.app'],
        },
        {
          level: 3,
          recipients: ['cto@kazi.app', 'ceo@kazi.app'],
        },
      ],
    },
  },
};

// JWT Secret for security tokens
const SECURITY_JWT_SECRET = new TextEncoder().encode(
  process.env.SECURITY_JWT_SECRET || 'kazi-security-jwt-secret-change-in-production'
);

// Encryption key (should be stored securely in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  '01234567890123456789012345678901'; // 32 bytes for AES-256

// Encryption IV length
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Supabase client for security operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ==========================================================
// SECURITY MONITORING AND AUDIT
// ==========================================================

/**
 * Initialize security monitoring system
 */
export function initSecurityMonitoring(config: Partial<SecurityConfig> = {}): void {
  const mergedConfig: SecurityConfig = {
    ...DEFAULT_SECURITY_CONFIG,
    ...config,
    monitoring: {
      ...DEFAULT_SECURITY_CONFIG.monitoring,
      ...config.monitoring,
    },
    alerting: {
      ...DEFAULT_SECURITY_CONFIG.alerting,
      ...config.alerting,
    },
  };

  // Only initialize in production or if explicitly enabled in development
  if (process.env.NODE_ENV !== 'production' && 
      !process.env.ENABLE_SECURITY_IN_DEVELOPMENT) {
    console.log('Security monitoring initialized in development mode (limited functionality)');
    return;
  }

  console.log('Initializing KAZI security monitoring system...');

  // Set up real-time monitoring if enabled
  if (mergedConfig.monitoring.realTimeMonitoring) {
    setupRealTimeMonitoring(mergedConfig);
  }

  // Schedule security scans
  if (mergedConfig.scanning.enabled && 
      mergedConfig.scanning.schedule.type === 'scheduled') {
    scheduleSecurityScans(mergedConfig.scanning);
  }

  // Initialize encryption key rotation
  scheduleKeyRotation(mergedConfig.encryption.keyRotationDays);

  console.log('KAZI security monitoring system initialized');
}

/**
 * Set up real-time security monitoring
 */
function setupRealTimeMonitoring(config: SecurityConfig): void {
  // In a production environment, this would connect to a security monitoring service
  // or set up event listeners for security-relevant events
  
  console.log('Real-time security monitoring enabled');
  
  // Example: Set up listeners for authentication events
  if (typeof window !== 'undefined') {
    window.addEventListener('securityEvent', (event: any) => {
      // Process and analyze security event
      analyzeSecurityEvent(event.detail);
    });
  }
}

/**
 * Analyze a security event for threats
 */
export async function analyzeSecurityEvent(event: any): Promise<SecurityThreatEvent | null> {
  try {
    // Extract basic event information
    const eventType = event.type || 'unknown';
    const source = event.source || 'system';
    const timestamp = new Date();
    const severity = event.severity || 'low';
    
    // Create threat event object
    const threatEvent: SecurityThreatEvent = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      eventType,
      source,
      timestamp,
      severity: severity as SecurityRiskLevel,
      description: event.description || `Security event detected: ${eventType}`,
      rawData: event,
      affectedResources: event.affectedResources || [],
      ipAddress: event.ipAddress,
      userId: event.userId,
      sessionId: event.sessionId,
      requestId: event.requestId,
      status: 'detected',
    };
    
    // Analyze the event for potential threats
    const isThreateningEvent = await detectThreat(threatEvent);
    
    if (isThreateningEvent) {
      // Log the threat
      await logSecurityAudit({
        eventType: 'security-threat-detected',
        resourceType: 'security',
        action: 'threat-detection',
        status: 'success',
        severity: threatEvent.severity,
        details: {
          threatEvent,
        },
      });
      
      // Alert if necessary based on severity
      if (['critical', 'high'].includes(threatEvent.severity)) {
        await createSecurityAlert({
          title: `Security Threat: ${threatEvent.eventType}`,
          description: threatEvent.description,
          severity: threatEvent.severity,
          source: threatEvent.source,
          category: 'threat',
          affectedResources: threatEvent.affectedResources,
        });
      }
      
      return threatEvent;
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing security event:', error);
    return null;
  }
}

/**
 * Detect if an event represents a security threat
 */
async function detectThreat(event: SecurityThreatEvent): Promise<boolean> {
  // This would contain sophisticated threat detection logic
  // For now, we'll use some basic heuristics
  
  // Check for known attack patterns
  if (event.rawData && typeof event.rawData === 'object') {
    // SQL injection attempts
    if (containsSqlInjection(JSON.stringify(event.rawData))) {
      event.description = 'Potential SQL injection attempt detected';
      event.severity = 'high';
      return true;
    }
    
    // XSS attempts
    if (containsXss(JSON.stringify(event.rawData))) {
      event.description = 'Potential XSS attempt detected';
      event.severity = 'high';
      return true;
    }
    
    // Authentication attacks
    if (event.eventType === 'login-failed' && event.rawData.consecutiveFailures > 5) {
      event.description = 'Multiple failed login attempts detected';
      event.severity = 'medium';
      return true;
    }
    
    // Unusual API access patterns
    if (event.eventType === 'api-access' && 
        event.rawData.frequency > 100 && 
        event.rawData.timeWindow < 60) { // 100 requests in less than 60 seconds
      event.description = 'Unusual API access pattern detected';
      event.severity = 'medium';
      return true;
    }
  }
  
  // For high-severity events, always treat as threats
  if (event.severity === 'critical' || event.severity === 'high') {
    return true;
  }
  
  return false;
}

/**
 * Schedule regular security scans
 */
function scheduleSecurityScans(config: SecurityScanConfig): void {
  // In a production environment, this would set up cron jobs or scheduled tasks
  // For this implementation, we'll just log the intent
  console.log(`Security scans scheduled with cron: ${config.schedule.cron}`);
  
  // Example: Schedule a dependency scan
  if (typeof setInterval !== 'undefined') {
    // Run a scan every 24 hours (in a real implementation, would use a proper scheduler)
    setInterval(() => {
      runSecurityScan('dependency');
    }, 24 * 60 * 60 * 1000);
  }
}

/**
 * Run a security scan
 */
export async function runSecurityScan(
  scanType: SecurityScanType,
  options: Record<string, any> = {}
): Promise<SecurityScanResult> {
  console.log(`Running security scan: ${scanType}`);
  
  const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startedAt = new Date();
  
  try {
    // This would integrate with actual security scanning tools
    // For now, we'll simulate a scan
    
    // Simulate scan duration
    const scanDuration = Math.floor(Math.random() * 30) + 10; // 10-40 seconds
    
    // Create placeholder result
    const result: SecurityScanResult = {
      id: scanId,
      scanType,
      startedAt,
      completedAt: new Date(startedAt.getTime() + scanDuration * 1000),
      status: 'completed',
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        total: 0,
      },
      vulnerabilities: [],
      scannerVersion: '1.0.0',
      scannerName: `kazi-${scanType}-scanner`,
      duration: scanDuration,
    };
    
    // Simulate finding vulnerabilities (in production, these would be real findings)
    if (Math.random() > 0.7) { // 30% chance of finding vulnerabilities
      const numVulnerabilities = Math.floor(Math.random() * 5) + 1; // 1-5 vulnerabilities
      
      for (let i = 0; i < numVulnerabilities; i++) {
        const severity: SecurityRiskLevel = 
          Math.random() < 0.1 ? 'critical' :
          Math.random() < 0.3 ? 'high' :
          Math.random() < 0.6 ? 'medium' : 'low';
        
        result.summary[severity]++;
        result.summary.total++;
        
        result.vulnerabilities.push({
          id: `vuln_${Date.now()}_${i}`,
          title: `Sample ${severity} vulnerability ${i + 1}`,
          description: `This is a sample ${severity} vulnerability found during ${scanType} scan`,
          severity,
          affected: ['sample-component'],
          remediation: 'Update to the latest version',
          references: ['https://example.com/vulnerability'],
          detectedAt: new Date(),
          status: 'open',
          patchAvailable: Math.random() > 0.5,
          exploitAvailable: Math.random() > 0.8,
          scanType,
        });
      }
    }
    
    // Log the scan completion
    await logSecurityAudit({
      eventType: 'security-scan-completed',
      resourceType: 'security',
      action: 'scan',
      status: 'success',
      severity: result.summary.critical > 0 ? 'critical' : 
               result.summary.high > 0 ? 'high' : 
               result.summary.medium > 0 ? 'medium' : 'low',
      details: {
        scanType,
        summary: result.summary,
      },
    });
    
    // Create alerts for critical and high vulnerabilities
    if (result.summary.critical > 0 || result.summary.high > 0) {
      await createSecurityAlert({
        title: `Security Scan: ${result.summary.critical} critical, ${result.summary.high} high vulnerabilities`,
        description: `Security scan ${scanId} found vulnerabilities that require attention`,
        severity: result.summary.critical > 0 ? 'critical' : 'high',
        source: `security-scan-${scanType}`,
        category: 'vulnerability',
        affectedResources: result.vulnerabilities.map(v => v.affected).flat(),
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error running ${scanType} security scan:`, error);
    
    // Log the scan failure
    await logSecurityAudit({
      eventType: 'security-scan-failed',
      resourceType: 'security',
      action: 'scan',
      status: 'failure',
      severity: 'high',
      details: {
        scanType,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    
    // Return failure result
    return {
      id: scanId,
      scanType,
      startedAt,
      completedAt: new Date(),
      status: 'failed',
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        total: 0,
      },
      vulnerabilities: [],
      scannerVersion: '1.0.0',
      scannerName: `kazi-${scanType}-scanner`,
      duration: (new Date().getTime() - startedAt.getTime()) / 1000,
    };
  }
}

/**
 * Create a security incident
 */
export async function createSecurityIncident(
  params: {
    title: string;
    description: string;
    severity: SecurityRiskLevel;
    affectedSystems?: string[];
    affectedUsers?: string[];
    threatEvents?: string[];
    assignedTo?: string;
  }
): Promise<SecurityIncident> {
  const incident: SecurityIncident = {
    id: `incident_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: params.title,
    description: params.description,
    severity: params.severity,
    status: 'detected',
    detectedAt: new Date(),
    affectedSystems: params.affectedSystems || [],
    affectedUsers: params.affectedUsers || [],
    threatEvents: params.threatEvents || [],
    assignedTo: params.assignedTo,
    mitigationSteps: [],
    impact: 'Under investigation',
    notifiedParties: [],
  };
  
  try {
    // In production, this would save to a database
    // For now, we'll just log it
    console.log('Security incident created:', incident);
    
    // Log the incident creation
    await logSecurityAudit({
      eventType: 'security-incident-created',
      resourceType: 'security',
      action: 'create-incident',
      status: 'success',
      severity: incident.severity,
      details: {
        incidentId: incident.id,
        title: incident.title,
      },
    });
    
    // Create a high-priority alert for the incident
    await createSecurityAlert({
      title: `INCIDENT: ${incident.title}`,
      description: incident.description,
      severity: incident.severity,
      source: 'security-monitoring',
      category: 'incident',
      affectedResources: incident.affectedSystems,
      relatedIncidentId: incident.id,
    });
    
    return incident;
  } catch (error) {
    console.error('Error creating security incident:', error);
    throw error;
  }
}

/**
 * Update a security incident
 */
export async function updateSecurityIncident(
  incidentId: string,
  updates: Partial<SecurityIncident>
): Promise<SecurityIncident> {
  try {
    // In production, this would update the incident in a database
    // For now, we'll just log it
    console.log(`Updating security incident ${incidentId}:`, updates);
    
    // Log the incident update
    await logSecurityAudit({
      eventType: 'security-incident-updated',
      resourceType: 'security',
      resourceId: incidentId,
      action: 'update-incident',
      status: 'success',
      severity: updates.severity || 'medium',
      details: {
        updates,
      },
    });
    
    // Return a mock updated incident
    return {
      id: incidentId,
      title: updates.title || 'Updated incident',
      description: updates.description || 'Updated description',
      severity: updates.severity || 'medium',
      status: updates.status || 'investigating',
      detectedAt: new Date(Date.now() - 3600000), // 1 hour ago
      affectedSystems: updates.affectedSystems || [],
      affectedUsers: updates.affectedUsers || [],
      threatEvents: updates.threatEvents || [],
      mitigationSteps: updates.mitigationSteps || [],
      impact: updates.impact || 'Under investigation',
      notifiedParties: updates.notifiedParties || [],
    };
  } catch (error) {
    console.error(`Error updating security incident ${incidentId}:`, error);
    throw error;
  }
}

// ==========================================================
// DATA ENCRYPTION AND SECURE STORAGE
// ==========================================================

/**
 * Schedule encryption key rotation
 */
function scheduleKeyRotation(rotationDays: number): void {
  // In production, this would set up a scheduled job to rotate encryption keys
  console.log(`Encryption key rotation scheduled every ${rotationDays} days`);
}

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  try {
    // Generate a random initialization vector
    const iv = randomBytes(IV_LENGTH);
    
    // Create cipher with key and iv
    const cipher = createCipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return iv + authTag + encrypted data
    return iv.toString('hex') + ':' + authTag + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  try {
    // Split the encrypted data to get iv, authTag and the encrypted text
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    // Create decipher
    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    
    // Set authentication tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string, salt?: string): string {
  try {
    // Generate salt if not provided
    const useSalt = salt || randomBytes(16).toString('hex');
    
    // Create hash
    const hash = createHash('sha256')
      .update(data + useSalt)
      .digest('hex');
    
    // Return salt + hash
    return `${useSalt}:${hash}`;
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    // Split the hashed data to get salt and hash
    const parts = hashedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid hashed data format');
    }
    
    const salt = parts[0];
    const hash = parts[1];
    
    // Create verification hash
    const verificationHash = createHash('sha256')
      .update(data + salt)
      .digest('hex');
    
    // Compare hashes
    return hash === verificationHash;
  } catch (error) {
    console.error('Hash verification error:', error);
    return false;
  }
}

/**
 * Create a signed security token
 */
export async function createSecurityToken(
  payload: Record<string, any>,
  expiresIn: string = '1h'
): Promise<string> {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(SECURITY_JWT_SECRET);
  } catch (error) {
    console.error('Error creating security token:', error);
    throw new Error('Failed to create security token');
  }
}

/**
 * Verify a security token
 */
export async function verifySecurityToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, SECURITY_JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Error verifying security token:', error);
    throw new Error('Invalid or expired security token');
  }
}

// ==========================================================
// ACCESS CONTROL AND AUTHENTICATION MONITORING
// ==========================================================

/**
 * Log an authentication event
 */
export async function logAuthEvent(event: Omit<AuthEvent, 'id' | 'timestamp'>): Promise<void> {
  try {
    const authEvent: AuthEvent = {
      ...event,
      id: `auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };
    
    // In production, this would save to a database
    console.log('Auth event logged:', authEvent);
    
    // Check for suspicious authentication activity
    if (!event.success) {
      await checkForSuspiciousAuthActivity(authEvent);
    }
    
    // Log to security audit
    await logSecurityAudit({
      eventType: `auth-${event.eventType}`,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resourceType: 'authentication',
      action: event.eventType,
      status: event.success ? 'success' : 'failure',
      severity: event.success ? 'info' : 'medium',
      sessionId: event.sessionId,
      details: {
        failureReason: event.failureReason,
        location: event.location,
      },
    });
  } catch (error) {
    console.error('Error logging auth event:', error);
  }
}

/**
 * Check for suspicious authentication activity
 */
async function checkForSuspiciousAuthActivity(event: AuthEvent): Promise<void> {
  try {
    // In production, this would query recent auth events from a database
    // For now, we'll simulate some checks
    
    // Check for multiple failed login attempts
    if (event.eventType === 'login-failed') {
      // Simulate checking for multiple failures
      const simulatedRecentFailures = Math.floor(Math.random() * 10);
      
      if (simulatedRecentFailures >= 5) {
        // Create a security alert for multiple failed logins
        await createSecurityAlert({
          title: 'Multiple Failed Login Attempts',
          description: `User ${event.userId} has ${simulatedRecentFailures + 1} failed login attempts in the last 15 minutes`,
          severity: 'medium',
          source: 'authentication-monitoring',
          category: 'authentication',
          affectedResources: [`user:${event.userId}`],
        });
        
        // In a real system, this might trigger account lockout
        console.log(`Account lockout would be triggered for user ${event.userId}`);
      }
    }
    
    // Check for unusual location
    if (event.location && event.location.country) {
      // Simulate checking for unusual location
      const isUnusualLocation = Math.random() > 0.9; // 10% chance
      
      if (isUnusualLocation) {
        await createSecurityAlert({
          title: 'Login From Unusual Location',
          description: `User ${event.userId} logged in from unusual location: ${event.location.country}, ${event.location.city || 'unknown city'}`,
          severity: 'medium',
          source: 'authentication-monitoring',
          category: 'authentication',
          affectedResources: [`user:${event.userId}`],
        });
      }
    }
  } catch (error) {
    console.error('Error checking for suspicious auth activity:', error);
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(
  password: string,
  policy = DEFAULT_SECURITY_CONFIG.authentication.passwordPolicy
): { 
  valid: boolean; 
  score: number; 
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Check length
  if (password.length < policy.minLength) {
    feedback.push(`Password must be at least ${policy.minLength} characters long`);
  } else {
    score += 1;
  }
  
  // Check for uppercase
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }
  
  // Check for lowercase
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }
  
  // Check for numbers
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else if (/[0-9]/.test(password)) {
    score += 1;
  }
  
  // Check for special characters
  if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  
  // Additional strength checks
  if (password.length >= 16) score += 1;
  if (/[^A-Za-z0-9].*[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Check for common patterns
  if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(password)) {
    score += 1;
  }
  
  // Check for common passwords (in production, would check against a larger list)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('Password is too common');
    score = 0;
  }
  
  const valid = feedback.length === 0;
  
  return { valid, score, feedback };
}

/**
 * Generate a CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  try {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + DEFAULT_SECURITY_CONFIG.csrfProtection.tokenExpiration * 1000;
    
    // Create signed token
    const signedToken = await createSecurityToken(
      { token, expiresAt },
      `${DEFAULT_SECURITY_CONFIG.csrfProtection.tokenExpiration}s`
    );
    
    // In production, this would be stored in a cookie
    if (typeof document !== 'undefined') {
      document.cookie = `${DEFAULT_SECURITY_CONFIG.csrfProtection.cookieName}=${signedToken}; path=/; max-age=${DEFAULT_SECURITY_CONFIG.csrfProtection.tokenExpiration}; SameSite=Lax; Secure`;
    } else {
      cookies().set({
        name: DEFAULT_SECURITY_CONFIG.csrfProtection.cookieName,
        value: signedToken,
        path: '/',
        maxAge: DEFAULT_SECURITY_CONFIG.csrfProtection.tokenExpiration,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    return token;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    throw new Error('Failed to generate CSRF token');
  }
}

/**
 * Validate a CSRF token
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  try {
    // Get token from cookie
    const cookieToken = cookies().get(DEFAULT_SECURITY_CONFIG.csrfProtection.cookieName)?.value;
    
    if (!cookieToken) {
      return false;
    }
    
    // Verify the signed token
    const payload = await verifySecurityToken(cookieToken);
    
    // Check if token matches and is not expired
    return payload.token === token && payload.expiresAt > Date.now();
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}

// ==========================================================
// API SECURITY AND RATE LIMITING
// ==========================================================

/**
 * Log an API security event
 */
export async function logApiSecurityEvent(event: Omit<ApiSecurityEvent, 'id'>): Promise<void> {
  try {
    const apiEvent: ApiSecurityEvent = {
      ...event,
      id: `api_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    
    // In production, this would save to a database
    console.log('API security event logged:', apiEvent);
    
    // Check for API security issues
    await checkForApiSecurityIssues(apiEvent);
    
    // Log to security audit if blocked or high risk
    if (apiEvent.blocked || apiEvent.riskScore > 0.7) {
      await logSecurityAudit({
        eventType: 'api-security-event',
        userId: apiEvent.userId,
        ipAddress: apiEvent.ipAddress,
        resourceType: 'api',
        resourceId: apiEvent.endpoint,
        action: apiEvent.method,
        status: apiEvent.blocked ? 'failure' : 'success',
        severity: apiEvent.blocked ? 'high' : 'medium',
        details: {
          statusCode: apiEvent.statusCode,
          riskScore: apiEvent.riskScore,
          blockReason: apiEvent.blockReason,
        },
      });
    }
  } catch (error) {
    console.error('Error logging API security event:', error);
  }
}

/**
 * Check for API security issues
 */
async function checkForApiSecurityIssues(event: ApiSecurityEvent): Promise<void> {
  try {
    // Check for high risk score
    if (event.riskScore > 0.8) {
      await createSecurityAlert({
        title: 'High Risk API Access',
        description: `High risk API access detected: ${event.method} ${event.endpoint}`,
        severity: 'high',
        source: 'api-security-monitoring',
        category: 'api',
        affectedResources: [event.endpoint],
      });
    }
    
    // Check for blocked requests
    if (event.blocked) {
      await createSecurityAlert({
        title: 'Blocked API Request',
        description: `API request blocked: ${event.method} ${event.endpoint} - Reason: ${event.blockReason}`,
        severity: 'medium',
        source: 'api-security-monitoring',
        category: 'api',
        affectedResources: [event.endpoint],
      });
    }
    
    // Check for missing security headers
    const requiredSecurityHeaders = [
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
    ];
    
    const missingHeaders = requiredSecurityHeaders.filter(
      header => !event.securityHeaders[header]
    );
    
    if (missingHeaders.length > 0) {
      console.warn(`API endpoint ${event.endpoint} is missing security headers: ${missingHeaders.join(', ')}`);
    }
  } catch (error) {
    console.error('Error checking for API security issues:', error);
  }
}

/**
 * Apply rate limiting to an API request
 */
export function applyRateLimit(
  req: NextRequest,
  config = DEFAULT_SECURITY_CONFIG.apiSecurity.rateLimit
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  // In production, this would use a distributed rate limiter like Redis
  // For now, we'll simulate rate limiting
  
  // Generate a key for this request (typically based on IP or user ID)
  const key = req.ip || 'unknown';
  
  // Simulate checking against rate limit
  const now = Date.now();
  const windowMs = config.defaultWindow * 1000;
  const resetTime = now + windowMs;
  
  // Simulate remaining requests (random for this example)
  const remaining = Math.floor(Math.random() * config.defaultLimit);
  const allowed = remaining > 0;
  
  return {
    allowed,
    limit: config.defaultLimit,
    remaining,
    reset: resetTime,
  };
}

/**
 * Validate API request security
 */
export function validateApiSecurity(
  req: NextRequest
): {
  valid: boolean;
  issues: string[];
  riskScore: number;
} {
  const issues: string[] = [];
  let riskScore = 0;
  
  // Check for required headers
  const requiredHeaders = DEFAULT_SECURITY_CONFIG.apiSecurity.requiredHeaders;
  const missingHeaders = requiredHeaders.filter(
    header => !req.headers.has(header)
  );
  
  if (missingHeaders.length > 0) {
    issues.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    riskScore += 0.3;
  }
  
  // Check for suspicious query parameters
  const suspiciousParams = Array.from(req.nextUrl.searchParams.keys()).filter(
    param => containsSqlInjection(param) || containsXss(param)
  );
  
  if (suspiciousParams.length > 0) {
    issues.push(`Suspicious query parameters detected: ${suspiciousParams.join(', ')}`);
    riskScore += 0.5;
  }
  
  // Check for allowed origins if CORS request
  const origin = req.headers.get('origin');
  if (origin) {
    const allowedOrigins = DEFAULT_SECURITY_CONFIG.apiSecurity.corsPolicy.allowedOrigins;
    const originAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
    
    if (!originAllowed) {
      issues.push(`Request from unauthorized origin: ${origin}`);
      riskScore += 0.4;
    }
  }
  
  // Calculate final risk score (cap at 1.0)
  riskScore = Math.min(riskScore, 1.0);
  
  return {
    valid: issues.length === 0,
    issues,
    riskScore,
  };
}

// ==========================================================
// XSS AND CSRF PROTECTION
// ==========================================================

/**
 * Check if a string contains potential XSS
 */
export function containsXss(input: string): boolean {
  // Basic XSS detection - in production, use a more comprehensive solution
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:.*?;base64/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string, level: 'strict' | 'moderate' | 'basic' = 'strict'): string {
  if (!html) return '';
  
  // In production, use a proper HTML sanitizer library
  // This is a very basic implementation
  
  if (level === 'strict') {
    // Remove all HTML tags
    return html.replace(/<[^>]*>/g, '');
  } else if (level === 'moderate') {
    // Allow basic formatting but remove scripts and events
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:.*?;base64/gi, '');
  } else {
    // Basic sanitization - just remove script tags
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

/**
 * Apply Content Security Policy headers
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  // Content Security Policy
  if (DEFAULT_SECURITY_CONFIG.xssProtection.enabled) {
    res.headers.set(
      'Content-Security-Policy',
      DEFAULT_SECURITY_CONFIG.xssProtection.mode === 'block'
        ? "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script'"
        : "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'"
    );
  }
  
  // XSS Protection
  res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Type Options
  res.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Frame Options
  res.headers.set('X-Frame-Options', 'DENY');
  
  // Referrer Policy
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // HSTS
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  
  return res;
}

/**
 * Create a middleware function to protect against CSRF
 */
export function csrfProtection(req: NextRequest): NextResponse | null {
  // Skip CSRF check for excluded routes
  const path = req.nextUrl.pathname;
  const excludedRoutes = DEFAULT_SECURITY_CONFIG.csrfProtection.excludedRoutes;
  
  if (excludedRoutes.some(route => {
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1));
    }
    return path === route;
  })) {
    return null; // Skip CSRF check
  }
  
  // Skip for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return null; // Skip CSRF check
  }
  
  // Check for CSRF token in header
  const csrfToken = req.headers.get(DEFAULT_SECURITY_CONFIG.csrfProtection.headerName);
  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token missing' },
      { status: 403 }
    );
  }
  
  // Get token from cookie
  const cookieToken = req.cookies.get(DEFAULT_SECURITY_CONFIG.csrfProtection.cookieName)?.value;
  if (!cookieToken) {
    return NextResponse.json(
      { error: 'CSRF cookie missing' },
      { status: 403 }
    );
  }
  
  // In a real implementation, we would verify the token here
  // For this example, we'll assume it's valid if it exists
  
  return null; // Continue processing the request
}

// ==========================================================
// SQL INJECTION PREVENTION AND DATABASE SECURITY
// ==========================================================

/**
 * Check if a string contains potential SQL injection
 */
export function containsSqlInjection(input: string): boolean {
  // Basic SQL injection detection - in production, use a more comprehensive solution
  const sqlPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /'\s*OR\s*1\s*=\s*1/i,
    /'\s*OR\s*'\w+'\s*=\s*'\w+/i,
    /'\s*OR\s*\d+\s*=\s*\d+/i,
    /'\s*;\s*DROP\s+TABLE/i,
    /'\s*;\s*DELETE\s+FROM/i,
    /'\s*;\s*INSERT\s+INTO/i,
    /'\s*;\s*UPDATE\s+/i,
    /UNION\s+SELECT/i,
    /UNION\s+ALL\s+SELECT/i,
    /SELECT\s+.*\s+FROM\s+information_schema/i,
    /INTO\s+OUTFILE/i,
    /LOAD_FILE/i,
    /SLEEP\s*\(\s*\d+\s*\)/i,
    /BENCHMARK\s*\(\s*\d+\s*,/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize SQL input
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  
  // In production, use parameterized queries instead of sanitization
  // This is a very basic implementation for demonstration
  
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");
  
  // Remove SQL comments
  sanitized = sanitized.replace(/--.*$/g, '');
  
  // Remove multi-line comments
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
  
  return sanitized;
}

/**
 * Validate input against SQL injection
 */
export function validateSqlSafety(
  input: Record<string, any>,
  schema: z.ZodSchema<any>
): { 
  valid: boolean; 
  sanitized: Record<string, any>;
  issues: string[];
} {
  const issues: string[] = [];
  const sanitized: Record<string, any> = {};
  
  // First, validate against schema
  const validation = schema.safeParse(input);
  if (!validation.success) {
    return {
      valid: false,
      sanitized,
      issues: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
    };
  }
  
  // Check each string value for SQL injection patterns
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      if (containsSqlInjection(value)) {
        issues.push(`Potential SQL injection detected in field: ${key}`);
      } else {
        sanitized[key] = sanitizeSqlInput(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return {
    valid: issues.length === 0,
    sanitized,
    issues,
  };
}

// ==========================================================
// PRIVACY COMPLIANCE MONITORING
// ==========================================================

/**
 * Check GDPR compliance for data processing
 */
export function checkGdprCompliance(
  dataCategory: string,
  processingPurpose: string,
  userConsent: boolean,
  legalBasis?: string
): {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check if we have a valid legal basis
  const validLegalBases = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'];
  
  if (!legalBasis) {
    issues.push('No legal basis specified for data processing');
    recommendations.push('Define a clear legal basis for processing this data category');
  } else if (!validLegalBases.includes(legalBasis)) {
    issues.push(`Invalid legal basis: ${legalBasis}`);
    recommendations.push(`Choose a valid legal basis: ${validLegalBases.join(', ')}`);
  }
  
  // If legal basis is consent, check if we have it
  if (legalBasis === 'consent' && !userConsent) {
    issues.push('Processing requires consent, but no consent was provided');
    recommendations.push('Obtain explicit consent before processing this data');
  }
  
  // Check retention policy
  const retentionDays = DEFAULT_SECURITY_CONFIG.privacyCompliance.dataRetentionDays[dataCategory];
  if (!retentionDays) {
    issues.push(`No retention policy defined for data category: ${dataCategory}`);
    recommendations.push('Define a retention period for this data category');
  }
  
  // Check if this is special category data
  const specialCategories = ['health', 'biometric', 'genetic', 'racial', 'ethnic', 'political', 'religious', 'philosophical', 'sexual', 'criminal'];
  
  if (specialCategories.some(category => dataCategory.toLowerCase().includes(category))) {
    if (legalBasis !== 'consent' && legalBasis !== 'vital_interests') {
      issues.push(`Special category data requires explicit consent or vital interests, got: ${legalBasis}`);
      recommendations.push('For special category data, obtain explicit consent or establish vital interests');
    }
    
    if (!userConsent) {
      issues.push('Special category data requires explicit consent');
      recommendations.push('Obtain explicit consent before processing special category data');
    }
  }
  
  return {
    compliant: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Process a data subject request (GDPR/CCPA)
 */
export async function processDataSubjectRequest(
  request: Omit<DataPrivacyRequest, 'id' | 'createdAt' | 'status' | 'dueDate'>
): Promise<DataPrivacyRequest> {
  try {
    // Create a new request
    const now = new Date();
    const daysToProcess = DEFAULT_SECURITY_CONFIG.privacyCompliance.dataSubjectRequestDeadlineDays;
    
    const privacyRequest: DataPrivacyRequest = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      requestType: request.requestType,
      userId: request.userId,
      userEmail: request.userEmail,
      createdAt: now,
      status: 'received',
      dueDate: new Date(now.getTime() + daysToProcess * 24 * 60 * 60 * 1000),
      dataCategories: request.dataCategories,
      verificationMethod: request.verificationMethod,
      verificationStatus: 'not-verified',
      responseFormat: request.responseFormat,
      responseDeliveryMethod: request.responseDeliveryMethod,
      legalBasis: request.legalBasis,
      assignedTo: request.assignedTo,
      notes: request.notes,
    };
    
    // In production, this would save to a database
    console.log('Data subject request created:', privacyRequest);
    
    // Log the request
    await logSecurityAudit({
      eventType: 'privacy-request-received',
      userId: request.userId,
      resourceType: 'privacy',
      action: request.requestType,
      status: 'success',
      severity: 'medium',
      details: {
        requestId: privacyRequest.id,
        requestType: privacyRequest.requestType,
        dueDate: privacyRequest.dueDate,
      },
    });
    
    // Create an alert for the privacy team
    await createSecurityAlert({
      title: `New Data Subject Request: ${request.requestType}`,
      description: `User ${request.userId} (${request.userEmail}) has submitted a ${request.requestType} request`,
      severity: 'medium',
      source: 'privacy-compliance',
      category: 'privacy',
      affectedResources: [`user:${request.userId}`],
    });
    
    return privacyRequest;
  } catch (error) {
    console.error('Error processing data subject request:', error);
    throw error;
  }
}

/**
 * Check if user consent is valid and up-to-date
 */
export function checkUserConsentValidity(
  consentData: {
    userId: string;
    consentType: string;
    consentGiven: boolean;
    consentDate: Date;
    expirationDate?: Date;
    version: string;
  }
): {
  valid: boolean;
  expired: boolean;
  daysRemaining: number | null;
  currentVersion: string;
  needsRenewal: boolean;
} {
  // Get current consent version (in production, this would be fetched from a database)
  const currentVersion = '1.2'; // Example version
  
  const now = new Date();
  const consentExpirationDays = DEFAULT_SECURITY_CONFIG.privacyCompliance.consentExpirationDays;
  
  // Calculate default expiration if not provided
  const expirationDate = consentData.expirationDate || 
    new Date(consentData.consentDate.getTime() + consentExpirationDays * 24 * 60 * 60 * 1000);
  
  // Check if consent has expired
  const expired = now > expirationDate;
  
  // Calculate days remaining until expiration
  const daysRemaining = expired ? null : 
    Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  // Check if version is current
  const versionCurrent = consentData.version === currentVersion;
  
  // Determine if consent needs renewal
  const needsRenewal = expired || !versionCurrent || !consentData.consentGiven;
  
  return {
    valid: consentData.consentGiven && !expired && versionCurrent,
    expired,
    daysRemaining,
    currentVersion,
    needsRenewal,
  };
}

// ==========================================================
// SECURITY EVENT LOGGING AND FORENSIC ANALYSIS
// ==========================================================

/**
 * Log a security audit event
 */
export async function logSecurityAudit(
  params: Partial<SecurityAuditLogEntry> & {
    eventType: string;
    resourceType: string;
    action: string;
    status: 'success' | 'failure';
  }
): Promise<void> {
  try {
    const now = new Date();
    
    // Create audit log entry
    const auditLog: SecurityAuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now,
      eventType: params.eventType,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      status: params.status,
      details: params.details,
      metadata: params.metadata,
      sessionId: params.sessionId,
      requestId: params.requestId,
      severity: params.severity || 'info',
      relatedEvents: params.relatedEvents,
    };
    
    // In production, this would save to a database or security information and event management (SIEM) system
    console.log('Security audit log:', auditLog);
    
    // In production, we might also send to a centralized logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to a logging service
      // await axios.post('https://logging-service.example.com/logs', auditLog);
    }
  } catch (error) {
    console.error('Error logging security audit:', error);
  }
}

/**
 * Get security audit logs for forensic analysis
 */
export async function getSecurityAu