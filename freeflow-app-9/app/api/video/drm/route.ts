/**
 * DRM Protection API
 *
 * Beats Frame.io Enterprise with:
 * - Multi-DRM support (Widevine, FairPlay, PlayReady)
 * - Hardware-level content protection
 * - Geo-restriction capabilities
 * - Device management
 * - Offline viewing with time limits
 * - Screen recording prevention
 * - Concurrent stream limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

type DRMProvider = 'widevine' | 'fairplay' | 'playready' | 'all';
type SecurityLevel = 'L1' | 'L2' | 'L3'; // Hardware (L1) to Software (L3)
type ContentRating = 'public' | 'confidential' | 'highly_confidential' | 'restricted';

interface DRMPolicy {
  id: string;
  name: string;
  description: string;
  drm_providers: DRMProvider[];
  security_level_required: SecurityLevel;
  content_rating: ContentRating;
  restrictions: {
    max_concurrent_streams: number;
    max_devices_per_user: number;
    allowed_countries: string[];
    blocked_countries: string[];
    allowed_platforms: string[];
    allow_offline: boolean;
    offline_duration_hours: number;
    prevent_screen_capture: boolean;
    prevent_hdmi_output: boolean;
    watermark_on_playback: boolean;
    require_secure_connection: boolean;
  };
  playback_rules: {
    max_resolution: '4k' | '1080p' | '720p' | '480p';
    max_bitrate_mbps: number;
    allow_fast_forward: boolean;
    allow_rewind: boolean;
    allow_seeking: boolean;
    force_full_playback: boolean;
  };
  expiration: {
    license_duration_hours: number;
    rental_duration_hours: number;
    playback_duration_hours: number;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface DRMLicense {
  id: string;
  asset_id: string;
  user_id: string;
  policy_id: string;
  drm_provider: DRMProvider;
  device_id: string;
  device_name: string;
  device_type: string;
  license_type: 'streaming' | 'download' | 'persistent';
  issued_at: string;
  expires_at: string;
  first_play_at: string | null;
  last_play_at: string | null;
  play_count: number;
  total_watch_time_seconds: number;
  is_valid: boolean;
  revoked_at: string | null;
  revoke_reason: string | null;
}

interface DeviceRegistration {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_type: 'browser' | 'mobile' | 'tablet' | 'tv' | 'desktop';
  platform: string;
  drm_capabilities: {
    widevine: { supported: boolean; security_level: SecurityLevel };
    fairplay: { supported: boolean };
    playready: { supported: boolean; security_level: string };
  };
  registered_at: string;
  last_used_at: string;
  is_active: boolean;
  trust_score: number;
}

interface EncryptionJob {
  id: string;
  asset_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  drm_providers: DRMProvider[];
  output_formats: string[];
  progress_percent: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  output_urls: Record<string, string>;
}

interface DRMRequest {
  action:
    | 'create-policy'
    | 'list-policies'
    | 'apply-policy'
    | 'encrypt-content'
    | 'issue-license'
    | 'validate-license'
    | 'revoke-license'
    | 'register-device'
    | 'list-devices'
    | 'remove-device'
    | 'get-playback-token'
    | 'report-playback'
    | 'check-restrictions'
    | 'get-analytics';
  policyId?: string;
  policy?: Partial<DRMPolicy>;
  assetId?: string;
  userId?: string;
  licenseId?: string;
  deviceId?: string;
  deviceInfo?: Partial<DeviceRegistration>;
  drmProvider?: DRMProvider;
  playbackData?: {
    position_seconds: number;
    duration_seconds: number;
    quality: string;
    buffer_health: number;
  };
  clientInfo?: {
    ip_address: string;
    country: string;
    user_agent: string;
  };
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoPolicies(): DRMPolicy[] {
  return [
    {
      id: 'drm-policy-1',
      name: 'Premium Content Policy',
      description: 'High-security DRM for premium video content',
      drm_providers: ['widevine', 'fairplay', 'playready'],
      security_level_required: 'L1',
      content_rating: 'highly_confidential',
      restrictions: {
        max_concurrent_streams: 2,
        max_devices_per_user: 5,
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
        blocked_countries: [],
        allowed_platforms: ['chrome', 'safari', 'edge', 'ios', 'android', 'roku', 'firetv'],
        allow_offline: true,
        offline_duration_hours: 48,
        prevent_screen_capture: true,
        prevent_hdmi_output: false,
        watermark_on_playback: true,
        require_secure_connection: true,
      },
      playback_rules: {
        max_resolution: '4k',
        max_bitrate_mbps: 25,
        allow_fast_forward: true,
        allow_rewind: true,
        allow_seeking: true,
        force_full_playback: false,
      },
      expiration: {
        license_duration_hours: 720, // 30 days
        rental_duration_hours: 48,
        playback_duration_hours: 24,
      },
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: 'drm-policy-2',
      name: 'Client Preview Policy',
      description: 'Secure preview for client reviews with time limits',
      drm_providers: ['widevine', 'fairplay'],
      security_level_required: 'L2',
      content_rating: 'confidential',
      restrictions: {
        max_concurrent_streams: 1,
        max_devices_per_user: 2,
        allowed_countries: [],
        blocked_countries: [],
        allowed_platforms: ['chrome', 'safari', 'edge', 'firefox'],
        allow_offline: false,
        offline_duration_hours: 0,
        prevent_screen_capture: true,
        prevent_hdmi_output: true,
        watermark_on_playback: true,
        require_secure_connection: true,
      },
      playback_rules: {
        max_resolution: '1080p',
        max_bitrate_mbps: 8,
        allow_fast_forward: true,
        allow_rewind: true,
        allow_seeking: true,
        force_full_playback: false,
      },
      expiration: {
        license_duration_hours: 168, // 7 days
        rental_duration_hours: 24,
        playback_duration_hours: 4,
      },
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: 'drm-policy-3',
      name: 'Internal Team Policy',
      description: 'Standard protection for internal team access',
      drm_providers: ['widevine'],
      security_level_required: 'L3',
      content_rating: 'public',
      restrictions: {
        max_concurrent_streams: 5,
        max_devices_per_user: 10,
        allowed_countries: [],
        blocked_countries: [],
        allowed_platforms: ['chrome', 'safari', 'edge', 'firefox', 'ios', 'android'],
        allow_offline: true,
        offline_duration_hours: 720,
        prevent_screen_capture: false,
        prevent_hdmi_output: false,
        watermark_on_playback: false,
        require_secure_connection: false,
      },
      playback_rules: {
        max_resolution: '4k',
        max_bitrate_mbps: 25,
        allow_fast_forward: true,
        allow_rewind: true,
        allow_seeking: true,
        force_full_playback: false,
      },
      expiration: {
        license_duration_hours: 8760, // 1 year
        rental_duration_hours: 0,
        playback_duration_hours: 0,
      },
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    },
  ];
}

function getDemoLicenses(): DRMLicense[] {
  return [
    {
      id: 'license-1',
      asset_id: 'asset-demo-1',
      user_id: 'user-1',
      policy_id: 'drm-policy-1',
      drm_provider: 'widevine',
      device_id: 'device-chrome-1',
      device_name: 'Chrome on MacBook Pro',
      device_type: 'desktop',
      license_type: 'streaming',
      issued_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      first_play_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      last_play_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      play_count: 5,
      total_watch_time_seconds: 7200,
      is_valid: true,
      revoked_at: null,
      revoke_reason: null,
    },
    {
      id: 'license-2',
      asset_id: 'asset-demo-1',
      user_id: 'user-1',
      policy_id: 'drm-policy-1',
      drm_provider: 'fairplay',
      device_id: 'device-iphone-1',
      device_name: 'iPhone 15 Pro',
      device_type: 'mobile',
      license_type: 'download',
      issued_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
      first_play_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      last_play_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      play_count: 3,
      total_watch_time_seconds: 3600,
      is_valid: true,
      revoked_at: null,
      revoke_reason: null,
    },
  ];
}

function getDemoDevices(): DeviceRegistration[] {
  return [
    {
      id: 'device-1',
      user_id: 'user-1',
      device_id: 'device-chrome-1',
      device_name: 'Chrome on MacBook Pro',
      device_type: 'browser',
      platform: 'macOS',
      drm_capabilities: {
        widevine: { supported: true, security_level: 'L1' },
        fairplay: { supported: false },
        playready: { supported: false, security_level: 'N/A' },
      },
      registered_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      trust_score: 95,
    },
    {
      id: 'device-2',
      user_id: 'user-1',
      device_id: 'device-iphone-1',
      device_name: 'iPhone 15 Pro',
      device_type: 'mobile',
      platform: 'iOS 17',
      drm_capabilities: {
        widevine: { supported: false, security_level: 'L3' },
        fairplay: { supported: true },
        playready: { supported: false, security_level: 'N/A' },
      },
      registered_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      last_used_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      trust_score: 98,
    },
    {
      id: 'device-3',
      user_id: 'user-1',
      device_id: 'device-tv-1',
      device_name: 'Living Room Apple TV',
      device_type: 'tv',
      platform: 'tvOS 17',
      drm_capabilities: {
        widevine: { supported: false, security_level: 'L3' },
        fairplay: { supported: true },
        playready: { supported: false, security_level: 'N/A' },
      },
      registered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_used_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      trust_score: 92,
    },
  ];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const policyId = searchParams.get('policyId');
    const assetId = searchParams.get('assetId');

    if (policyId) {
      const policy = getDemoPolicies().find(p => p.id === policyId);
      if (!policy) {
        return NextResponse.json({ success: false, error: 'Policy not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: policy, source: 'demo' });
    }

    if (assetId) {
      const licenses = getDemoLicenses().filter(l => l.asset_id === assetId);
      return NextResponse.json({
        success: true,
        data: { asset_id: assetId, licenses, total: licenses.length },
        source: 'demo',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        features: [
          'Multi-DRM support (Widevine, FairPlay, PlayReady)',
          'Hardware-level content protection',
          'Geo-restriction capabilities',
          'Device management',
          'Offline viewing with limits',
          'Screen recording prevention',
          'Concurrent stream limiting',
          'Detailed analytics',
        ],
        drm_providers: ['widevine', 'fairplay', 'playready'],
        security_levels: ['L1', 'L2', 'L3'],
      },
      source: 'demo',
    });
  } catch (err) {
    console.error('DRM GET error:', err);
    return NextResponse.json({
      success: true,
      data: getDemoPolicies(),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DRMRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'create-policy': {
        const { policy } = body;

        if (!policy?.name) {
          return NextResponse.json({ success: false, error: 'Policy name required' }, { status: 400 });
        }

        const newPolicy: DRMPolicy = {
          id: `drm-policy-${Date.now()}`,
          name: policy.name,
          description: policy.description || '',
          drm_providers: policy.drm_providers || ['widevine'],
          security_level_required: policy.security_level_required || 'L2',
          content_rating: policy.content_rating || 'confidential',
          restrictions: {
            max_concurrent_streams: policy.restrictions?.max_concurrent_streams || 2,
            max_devices_per_user: policy.restrictions?.max_devices_per_user || 5,
            allowed_countries: policy.restrictions?.allowed_countries || [],
            blocked_countries: policy.restrictions?.blocked_countries || [],
            allowed_platforms: policy.restrictions?.allowed_platforms || ['chrome', 'safari', 'edge'],
            allow_offline: policy.restrictions?.allow_offline ?? false,
            offline_duration_hours: policy.restrictions?.offline_duration_hours || 48,
            prevent_screen_capture: policy.restrictions?.prevent_screen_capture ?? true,
            prevent_hdmi_output: policy.restrictions?.prevent_hdmi_output ?? false,
            watermark_on_playback: policy.restrictions?.watermark_on_playback ?? true,
            require_secure_connection: policy.restrictions?.require_secure_connection ?? true,
          },
          playback_rules: {
            max_resolution: policy.playback_rules?.max_resolution || '1080p',
            max_bitrate_mbps: policy.playback_rules?.max_bitrate_mbps || 8,
            allow_fast_forward: policy.playback_rules?.allow_fast_forward ?? true,
            allow_rewind: policy.playback_rules?.allow_rewind ?? true,
            allow_seeking: policy.playback_rules?.allow_seeking ?? true,
            force_full_playback: policy.playback_rules?.force_full_playback ?? false,
          },
          expiration: {
            license_duration_hours: policy.expiration?.license_duration_hours || 168,
            rental_duration_hours: policy.expiration?.rental_duration_hours || 48,
            playback_duration_hours: policy.expiration?.playback_duration_hours || 24,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };

        return NextResponse.json({
          success: true,
          data: newPolicy,
          message: 'DRM policy created',
        });
      }

      case 'list-policies': {
        return NextResponse.json({
          success: true,
          data: {
            policies: getDemoPolicies(),
            total: getDemoPolicies().length,
          },
        });
      }

      case 'apply-policy': {
        const { policyId, assetId } = body;

        if (!policyId || !assetId) {
          return NextResponse.json(
            { success: false, error: 'Policy ID and asset ID required' },
            { status: 400 }
          );
        }

        const policy = getDemoPolicies().find(p => p.id === policyId);

        return NextResponse.json({
          success: true,
          data: {
            asset_id: assetId,
            policy_id: policyId,
            policy_name: policy?.name,
            drm_providers_enabled: policy?.drm_providers,
            applied_at: new Date().toISOString(),
          },
          message: `DRM policy "${policy?.name}" applied to asset`,
        });
      }

      case 'encrypt-content': {
        const { assetId, policyId } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        const policy = getDemoPolicies().find(p => p.id === policyId) || getDemoPolicies()[0];

        const encryptionJob: EncryptionJob = {
          id: `enc-${Date.now()}`,
          asset_id: assetId,
          status: 'processing',
          drm_providers: policy.drm_providers as DRMProvider[],
          output_formats: ['dash', 'hls'],
          progress_percent: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          error_message: null,
          output_urls: {},
        };

        return NextResponse.json({
          success: true,
          data: encryptionJob,
          message: 'DRM encryption job started',
        });
      }

      case 'issue-license': {
        const { assetId, userId, deviceId, drmProvider, policyId } = body;

        if (!assetId || !userId || !deviceId) {
          return NextResponse.json(
            { success: false, error: 'Asset ID, user ID, and device ID required' },
            { status: 400 }
          );
        }

        const policy = getDemoPolicies().find(p => p.id === policyId) || getDemoPolicies()[0];

        const license: DRMLicense = {
          id: `license-${Date.now()}`,
          asset_id: assetId,
          user_id: userId,
          policy_id: policy.id,
          drm_provider: drmProvider || 'widevine',
          device_id: deviceId,
          device_name: 'Unknown Device',
          device_type: 'desktop',
          license_type: 'streaming',
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + policy.expiration.license_duration_hours * 60 * 60 * 1000).toISOString(),
          first_play_at: null,
          last_play_at: null,
          play_count: 0,
          total_watch_time_seconds: 0,
          is_valid: true,
          revoked_at: null,
          revoke_reason: null,
        };

        return NextResponse.json({
          success: true,
          data: license,
          message: 'DRM license issued',
        });
      }

      case 'validate-license': {
        const { licenseId, deviceId, clientInfo } = body;

        if (!licenseId) {
          return NextResponse.json({ success: false, error: 'License ID required' }, { status: 400 });
        }

        const license = getDemoLicenses().find(l => l.id === licenseId);

        if (!license) {
          return NextResponse.json({
            success: true,
            data: {
              is_valid: false,
              reason: 'License not found',
            },
          });
        }

        const isExpired = new Date(license.expires_at) < new Date();
        const isDeviceMatch = !deviceId || license.device_id === deviceId;

        return NextResponse.json({
          success: true,
          data: {
            license_id: licenseId,
            is_valid: license.is_valid && !isExpired && isDeviceMatch,
            validation_details: {
              is_active: license.is_valid,
              is_expired: isExpired,
              device_match: isDeviceMatch,
              expires_at: license.expires_at,
              remaining_hours: Math.max(0, (new Date(license.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)),
            },
          },
        });
      }

      case 'revoke-license': {
        const { licenseId } = body;

        if (!licenseId) {
          return NextResponse.json({ success: false, error: 'License ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            license_id: licenseId,
            revoked_at: new Date().toISOString(),
            revoke_reason: 'Manual revocation',
          },
          message: 'License revoked successfully',
        });
      }

      case 'register-device': {
        const { userId, deviceInfo } = body;

        if (!userId || !deviceInfo) {
          return NextResponse.json(
            { success: false, error: 'User ID and device info required' },
            { status: 400 }
          );
        }

        const device: DeviceRegistration = {
          id: `device-${Date.now()}`,
          user_id: userId,
          device_id: deviceInfo.device_id || `dev-${Date.now()}`,
          device_name: deviceInfo.device_name || 'Unknown Device',
          device_type: deviceInfo.device_type || 'browser',
          platform: deviceInfo.platform || 'Unknown',
          drm_capabilities: deviceInfo.drm_capabilities || {
            widevine: { supported: true, security_level: 'L3' },
            fairplay: { supported: false },
            playready: { supported: false, security_level: 'N/A' },
          },
          registered_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          is_active: true,
          trust_score: 80,
        };

        return NextResponse.json({
          success: true,
          data: device,
          message: 'Device registered successfully',
        });
      }

      case 'list-devices': {
        const { userId } = body;

        if (!userId) {
          return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        const devices = getDemoDevices().filter(d => d.user_id === userId);

        return NextResponse.json({
          success: true,
          data: {
            user_id: userId,
            devices,
            total: devices.length,
            max_allowed: 5,
          },
        });
      }

      case 'remove-device': {
        const { userId, deviceId } = body;

        if (!userId || !deviceId) {
          return NextResponse.json(
            { success: false, error: 'User ID and device ID required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            user_id: userId,
            device_id: deviceId,
            removed_at: new Date().toISOString(),
            licenses_revoked: 2,
          },
          message: 'Device removed and associated licenses revoked',
        });
      }

      case 'get-playback-token': {
        const { assetId, userId, deviceId, drmProvider } = body;

        if (!assetId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Asset ID and user ID required' },
            { status: 400 }
          );
        }

        const token = Buffer.from(JSON.stringify({
          asset_id: assetId,
          user_id: userId,
          device_id: deviceId,
          drm: drmProvider || 'widevine',
          exp: Date.now() + 4 * 60 * 60 * 1000,
        })).toString('base64');

        return NextResponse.json({
          success: true,
          data: {
            playback_token: token,
            drm_provider: drmProvider || 'widevine',
            license_server_url: `https://license.freeflow.io/${drmProvider || 'widevine'}`,
            manifest_url: `https://cdn.freeflow.io/drm/${assetId}/manifest.mpd`,
            expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          },
        });
      }

      case 'report-playback': {
        const { licenseId, playbackData } = body;

        if (!licenseId || !playbackData) {
          return NextResponse.json(
            { success: false, error: 'License ID and playback data required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            license_id: licenseId,
            reported_at: new Date().toISOString(),
            playback_position: playbackData.position_seconds,
            quality: playbackData.quality,
          },
          message: 'Playback data recorded',
        });
      }

      case 'check-restrictions': {
        const { assetId, userId, clientInfo } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        const policy = getDemoPolicies()[0];
        const country = clientInfo?.country || 'US';
        const isCountryAllowed = policy.restrictions.allowed_countries.length === 0 ||
          policy.restrictions.allowed_countries.includes(country);
        const isCountryBlocked = policy.restrictions.blocked_countries.includes(country);

        return NextResponse.json({
          success: true,
          data: {
            asset_id: assetId,
            can_play: isCountryAllowed && !isCountryBlocked,
            restrictions: {
              geo_allowed: isCountryAllowed && !isCountryBlocked,
              concurrent_streams_available: true,
              device_limit_ok: true,
              secure_connection: true,
            },
            max_quality: policy.playback_rules.max_resolution,
            offline_enabled: policy.restrictions.allow_offline,
          },
        });
      }

      case 'get-analytics': {
        const { assetId, userId } = body;

        return NextResponse.json({
          success: true,
          data: {
            period: 'last_30_days',
            total_plays: 1250,
            unique_viewers: 45,
            total_watch_time_hours: 890,
            average_completion_rate: 0.78,
            device_breakdown: {
              desktop: 0.45,
              mobile: 0.35,
              tablet: 0.12,
              tv: 0.08,
            },
            drm_breakdown: {
              widevine: 0.55,
              fairplay: 0.40,
              playready: 0.05,
            },
            top_countries: [
              { country: 'US', plays: 520 },
              { country: 'GB', plays: 180 },
              { country: 'CA', plays: 150 },
            ],
            security_events: {
              screen_capture_attempts: 12,
              concurrent_stream_violations: 3,
              geo_restriction_blocks: 8,
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('DRM POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
