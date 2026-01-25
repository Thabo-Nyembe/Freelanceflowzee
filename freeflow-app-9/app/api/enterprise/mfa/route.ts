import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('enterprise-mfa');

// Phase 8 Gap #3: Two-Factor Authentication (Advanced)
// Priority: HIGH | Competitor: All platforms
// Features: Multiple MFA methods, backup codes, hardware keys,
// adaptive authentication, risk-based challenges, organization policies

interface MFAConfig {
  userId: string;
  enabled: boolean;
  methods: MFAMethod[];
  preferredMethod: string;
  backupCodes: BackupCode[];
  trustedDevices: TrustedDevice[];
  settings: MFASettings;
  lastVerified: string;
  enrolledAt: string;
}

interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'webauthn' | 'push' | 'recovery';
  name: string;
  enabled: boolean;
  verified: boolean;
  createdAt: string;
  lastUsed?: string;
  config: MethodConfig;
}

interface MethodConfig {
  // TOTP
  secret?: string;
  issuer?: string;

  // SMS
  phoneNumber?: string;
  countryCode?: string;

  // Email
  email?: string;

  // WebAuthn
  credentialId?: string;
  publicKey?: string;
  deviceName?: string;
  attestationType?: string;

  // Push
  deviceToken?: string;
  appId?: string;
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

interface TrustedDevice {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  trustedAt: string;
  expiresAt: string;
  lastUsed: string;
}

interface MFASettings {
  rememberDevice: boolean;
  rememberDuration: number; // days
  requireMFAForHighRisk: boolean;
  allowedMethods: string[];
  fallbackMethod: string;
  gracePeriod: number; // hours before MFA is required after enrollment
}

interface OrganizationMFAPolicy {
  id: string;
  orgId: string;
  enabled: boolean;
  required: boolean;
  allowedMethods: string[];
  requiredMethods: string[];
  exemptions: string[]; // user IDs
  gracePerion: number;
  enforcement: 'immediate' | 'next-login' | 'deadline';
  enforcementDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface MFAChallenge {
  id: string;
  userId: string;
  method: string;
  expiresAt: string;
  verified: boolean;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
}

interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendation: 'allow' | 'mfa-required' | 'step-up' | 'block';
  challengeType?: string;
}

interface RiskFactor {
  factor: string;
  weight: number;
  value: any;
  description: string;
}

// Demo data
const demoMFAConfig: MFAConfig = {
  userId: 'user-001',
  enabled: true,
  methods: [
    {
      id: 'method-totp',
      type: 'totp',
      name: 'Authenticator App',
      enabled: true,
      verified: true,
      createdAt: '2024-06-01T10:00:00Z',
      lastUsed: '2025-01-15T10:00:00Z',
      config: { issuer: 'FreeFlow' }
    },
    {
      id: 'method-sms',
      type: 'sms',
      name: 'SMS to +1***1234',
      enabled: true,
      verified: true,
      createdAt: '2024-06-01T10:00:00Z',
      lastUsed: '2025-01-10T15:00:00Z',
      config: { phoneNumber: '+1***1234', countryCode: 'US' }
    },
    {
      id: 'method-webauthn',
      type: 'webauthn',
      name: 'MacBook Pro Touch ID',
      enabled: true,
      verified: true,
      createdAt: '2024-09-15T10:00:00Z',
      lastUsed: '2025-01-15T09:00:00Z',
      config: { deviceName: 'MacBook Pro Touch ID' }
    }
  ],
  preferredMethod: 'totp',
  backupCodes: [
    { code: 'XXXX-XXXX-1', used: false, createdAt: '2024-06-01T10:00:00Z' },
    { code: 'XXXX-XXXX-2', used: true, usedAt: '2024-08-15T10:00:00Z', createdAt: '2024-06-01T10:00:00Z' },
    { code: 'XXXX-XXXX-3', used: false, createdAt: '2024-06-01T10:00:00Z' },
    { code: 'XXXX-XXXX-4', used: false, createdAt: '2024-06-01T10:00:00Z' },
    { code: 'XXXX-XXXX-5', used: false, createdAt: '2024-06-01T10:00:00Z' }
  ],
  trustedDevices: [
    {
      id: 'device-001',
      name: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 120',
      os: 'macOS Sonoma',
      ipAddress: '192.168.1.xxx',
      location: 'San Francisco, CA',
      trustedAt: '2025-01-01T10:00:00Z',
      expiresAt: '2025-04-01T10:00:00Z',
      lastUsed: '2025-01-15T10:00:00Z'
    }
  ],
  settings: {
    rememberDevice: true,
    rememberDuration: 90,
    requireMFAForHighRisk: true,
    allowedMethods: ['totp', 'sms', 'webauthn', 'push'],
    fallbackMethod: 'sms',
    gracePeriod: 24
  },
  lastVerified: '2025-01-15T10:00:00Z',
  enrolledAt: '2024-06-01T10:00:00Z'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      // MFA Configuration
      case 'get-mfa-config':
        return NextResponse.json({
          success: true,
          data: { config: demoMFAConfig }
        });

      case 'enable-mfa':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            enabled: true,
            message: 'MFA enabled successfully',
            nextStep: 'enroll-method'
          }
        });

      case 'disable-mfa':
        return NextResponse.json({
          success: true,
          data: {
            userId: params.userId,
            enabled: false,
            message: 'MFA disabled. Your account is now less secure.',
            warning: 'Re-enable MFA to protect your account'
          }
        });

      // Method Enrollment
      case 'enroll-totp':
        const secret = 'JBSWY3DPEHPK3PXP'; // Demo secret
        return NextResponse.json({
          success: true,
          data: {
            method: 'totp',
            secret: secret,
            qrCode: `otpauth://totp/FreeFlow:${params.email}?secret=${secret}&issuer=FreeFlow`,
            manualEntry: {
              secret: secret,
              issuer: 'FreeFlow',
              account: params.email
            },
            nextStep: 'verify-totp'
          }
        });

      case 'verify-totp':
        // Demo: Accept any 6-digit code
        const isValid = /^\d{6}$/.test(params.code);
        return NextResponse.json({
          success: isValid,
          data: isValid ? {
            verified: true,
            methodId: `method-totp-${Date.now()}`,
            message: 'Authenticator app verified successfully'
          } : {
            verified: false,
            message: 'Invalid code. Please try again.'
          }
        });

      case 'enroll-sms':
        return NextResponse.json({
          success: true,
          data: {
            method: 'sms',
            phoneNumber: params.phoneNumber,
            codeSent: true,
            expiresIn: 600, // 10 minutes
            message: 'Verification code sent to your phone'
          }
        });

      case 'verify-sms':
        return NextResponse.json({
          success: true,
          data: {
            verified: true,
            methodId: `method-sms-${Date.now()}`,
            message: 'Phone number verified successfully'
          }
        });

      case 'enroll-webauthn':
        return NextResponse.json({
          success: true,
          data: {
            challenge: Buffer.from('random-challenge').toString('base64'),
            rp: { name: 'FreeFlow', id: 'freeflow.com' },
            user: {
              id: Buffer.from(params.userId).toString('base64'),
              name: params.email,
              displayName: params.displayName
            },
            pubKeyCredParams: [
              { type: 'public-key', alg: -7 }, // ES256
              { type: 'public-key', alg: -257 } // RS256
            ],
            timeout: 60000,
            attestation: 'none'
          }
        });

      case 'verify-webauthn':
        return NextResponse.json({
          success: true,
          data: {
            verified: true,
            methodId: `method-webauthn-${Date.now()}`,
            deviceName: params.deviceName || 'Security Key',
            message: 'Security key registered successfully'
          }
        });

      // MFA Challenges
      case 'create-challenge':
        const challenge: MFAChallenge = {
          id: `challenge-${Date.now()}`,
          userId: params.userId,
          method: params.method || 'totp',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          verified: false,
          attempts: 0,
          maxAttempts: 5,
          createdAt: new Date().toISOString()
        };
        return NextResponse.json({ success: true, data: { challenge } });

      case 'verify-challenge':
        return NextResponse.json({
          success: true,
          data: {
            challengeId: params.challengeId,
            verified: true,
            sessionToken: `session-${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });

      // Trusted Devices
      case 'get-trusted-devices':
        return NextResponse.json({
          success: true,
          data: { devices: demoMFAConfig.trustedDevices }
        });

      case 'trust-device':
        const device: TrustedDevice = {
          id: `device-${Date.now()}`,
          name: params.deviceName || 'Unknown Device',
          deviceType: params.deviceType || 'desktop',
          browser: params.browser || 'Unknown',
          os: params.os || 'Unknown',
          ipAddress: params.ipAddress || '0.0.0.0',
          location: params.location || 'Unknown',
          trustedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date().toISOString()
        };
        return NextResponse.json({ success: true, data: { device } });

      case 'revoke-device':
        return NextResponse.json({
          success: true,
          data: {
            deviceId: params.deviceId,
            revoked: true,
            message: 'Device removed from trusted devices'
          }
        });

      // Backup Codes
      case 'generate-backup-codes':
        const codes = Array.from({ length: 10 }, () => ({
          code: `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          used: false,
          createdAt: new Date().toISOString()
        }));
        return NextResponse.json({
          success: true,
          data: {
            codes: codes.map(c => c.code),
            message: 'New backup codes generated. Previous codes are now invalid.',
            warning: 'Store these codes securely. They cannot be shown again.'
          }
        });

      case 'verify-backup-code':
        return NextResponse.json({
          success: true,
          data: {
            verified: true,
            codesRemaining: 4,
            message: 'Backup code verified. Consider generating new codes.'
          }
        });

      // Risk-Based Authentication
      case 'assess-risk':
        const riskFactors: RiskFactor[] = [
          { factor: 'location', weight: 0.2, value: params.location || 'Unknown', description: params.newLocation ? 'New location detected' : 'Known location' },
          { factor: 'device', weight: 0.2, value: params.deviceId || 'Unknown', description: params.trustedDevice ? 'Trusted device' : 'New device' },
          { factor: 'time', weight: 0.1, value: new Date().getHours(), description: params.unusualTime ? 'Unusual login time' : 'Normal hours' },
          { factor: 'velocity', weight: 0.2, value: params.loginAttempts || 1, description: params.loginAttempts > 3 ? 'Multiple attempts' : 'Normal behavior' },
          { factor: 'credentials', weight: 0.3, value: 'valid', description: 'Valid credentials' }
        ];

        const riskScore = riskFactors.reduce((score, f) => {
          if (f.factor === 'location' && params.newLocation) score += 25;
          if (f.factor === 'device' && !params.trustedDevice) score += 25;
          if (f.factor === 'time' && params.unusualTime) score += 10;
          if (f.factor === 'velocity' && params.loginAttempts > 3) score += 30;
          return score;
        }, 0);

        const assessment: RiskAssessment = {
          score: riskScore,
          level: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 80 ? 'high' : 'critical',
          factors: riskFactors,
          recommendation: riskScore < 20 ? 'allow' : riskScore < 50 ? 'mfa-required' : riskScore < 80 ? 'step-up' : 'block',
          challengeType: riskScore >= 20 ? (riskScore >= 50 ? 'webauthn' : 'totp') : undefined
        };

        return NextResponse.json({ success: true, data: { assessment } });

      // Organization Policies
      case 'get-org-policy':
        return NextResponse.json({
          success: true,
          data: {
            policy: {
              id: 'policy-001',
              orgId: params.orgId,
              enabled: true,
              required: true,
              allowedMethods: ['totp', 'webauthn', 'push'],
              requiredMethods: ['totp'],
              exemptions: [],
              gracePerion: 72,
              enforcement: 'next-login',
              createdAt: '2024-06-01T10:00:00Z',
              updatedAt: '2025-01-01T10:00:00Z'
            }
          }
        });

      case 'update-org-policy':
        return NextResponse.json({
          success: true,
          data: {
            policy: {
              id: params.policyId,
              ...params.updates,
              updatedAt: new Date().toISOString()
            },
            affectedUsers: 45,
            message: 'Policy updated. Affected users will be notified.'
          }
        });

      case 'get-org-mfa-status':
        return NextResponse.json({
          success: true,
          data: {
            orgId: params.orgId,
            totalUsers: 50,
            mfaEnabled: 47,
            mfaEnrollment: 94,
            methodBreakdown: {
              totp: 42,
              webauthn: 25,
              sms: 18,
              push: 12
            },
            pendingEnrollment: 3,
            recentActivity: [
              { user: 'john@company.com', action: 'enrolled-webauthn', timestamp: '2025-01-15T10:00:00Z' },
              { user: 'jane@company.com', action: 'verified-totp', timestamp: '2025-01-14T15:00:00Z' }
            ]
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('MFA API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      config: demoMFAConfig,
      features: [
        'TOTP Authenticator Apps',
        'SMS verification',
        'Email verification',
        'WebAuthn/FIDO2 security keys',
        'Push notifications',
        'Backup codes',
        'Trusted devices',
        'Risk-based authentication',
        'Organization policies',
        'Adaptive MFA challenges'
      ]
    }
  });
}
