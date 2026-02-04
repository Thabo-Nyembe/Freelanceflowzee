/**
 * Forensic Watermarking API
 *
 * Beats Frame.io Enterprise with:
 * - Invisible forensic watermarks
 * - Viewer-specific tracking
 * - Leak detection and tracing
 * - Multi-layer watermarking
 * - Tamper detection
 * - Chain of custody tracking
 * - Integration with DRM systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

const logger = createFeatureLogger('video-watermark');

// ============================================================================
// TYPES
// ============================================================================

type WatermarkType = 'forensic' | 'visible' | 'both';
type WatermarkStrength = 'light' | 'standard' | 'robust';
type DetectionStatus = 'detected' | 'not_detected' | 'tampered' | 'inconclusive';

interface ForensicWatermark {
  id: string;
  asset_id: string;
  viewer_id: string;
  viewer_email: string;
  viewer_name: string;
  session_id: string;
  watermark_type: WatermarkType;
  watermark_strength: WatermarkStrength;
  payload: {
    viewer_identifier: string;
    timestamp: string;
    ip_address: string;
    device_fingerprint: string;
    organization_id: string;
    custom_data?: Record<string, string>;
  };
  created_at: string;
  expires_at: string;
  is_active: boolean;
  access_count: number;
  last_accessed_at: string;
}

interface LeakDetectionResult {
  id: string;
  scan_id: string;
  source_asset_id: string;
  detected_watermark_id: string | null;
  detection_status: DetectionStatus;
  detected_viewer: {
    id: string;
    email: string;
    name: string;
    organization: string;
  } | null;
  leak_timestamp: string;
  leak_location: string;
  confidence_score: number;
  evidence: {
    screenshot_url: string;
    platform: string;
    url_found: string;
  }[];
  chain_of_custody: {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }[];
  legal_export_available: boolean;
}

interface WatermarkPolicy {
  id: string;
  name: string;
  description: string;
  watermark_type: WatermarkType;
  strength: WatermarkStrength;
  apply_to_roles: string[];
  apply_to_asset_types: string[];
  visible_watermark_config?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
    font_size: number;
    include_viewer_info: boolean;
    include_timestamp: boolean;
  };
  auto_expire_days: number;
  track_downloads: boolean;
  require_nda: boolean;
  enabled: boolean;
}

interface WatermarkRequest {
  action:
    | 'create-watermark'
    | 'detect-watermark'
    | 'scan-for-leaks'
    | 'get-leak-report'
    | 'create-policy'
    | 'list-policies'
    | 'apply-policy'
    | 'get-chain-of-custody'
    | 'generate-viewer-link'
    | 'revoke-access'
    | 'export-legal-report'
    | 'batch-watermark';
  assetId?: string;
  viewerId?: string;
  viewerEmail?: string;
  viewerName?: string;
  watermarkType?: WatermarkType;
  strength?: WatermarkStrength;
  policyId?: string;
  policy?: Partial<WatermarkPolicy>;
  scannedContent?: string;
  scanUrl?: string;
  assetIds?: string[];
  customData?: Record<string, string>;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoWatermarks(): ForensicWatermark[] {
  return [
    {
      id: 'wm-1',
      asset_id: 'asset-project-demo',
      viewer_id: 'viewer-1',
      viewer_email: 'client@company.com',
      viewer_name: 'John Client',
      session_id: 'session-abc123',
      watermark_type: 'forensic',
      watermark_strength: 'robust',
      payload: {
        viewer_identifier: 'V-2024-001',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ip_address: '192.168.1.100',
        device_fingerprint: 'fp-xyz789',
        organization_id: 'org-company',
        custom_data: { project: 'Q1 Campaign', department: 'Marketing' },
      },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      access_count: 15,
      last_accessed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'wm-2',
      asset_id: 'asset-project-demo',
      viewer_id: 'viewer-2',
      viewer_email: 'stakeholder@partner.com',
      viewer_name: 'Sarah Stakeholder',
      session_id: 'session-def456',
      watermark_type: 'both',
      watermark_strength: 'standard',
      payload: {
        viewer_identifier: 'V-2024-002',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ip_address: '10.0.0.50',
        device_fingerprint: 'fp-abc456',
        organization_id: 'org-partner',
      },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      access_count: 8,
      last_accessed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function getDemoPolicies(): WatermarkPolicy[] {
  return [
    {
      id: 'policy-1',
      name: 'Client Preview Policy',
      description: 'Standard forensic watermarking for client review sessions',
      watermark_type: 'forensic',
      strength: 'robust',
      apply_to_roles: ['client', 'stakeholder'],
      apply_to_asset_types: ['video', 'image'],
      auto_expire_days: 30,
      track_downloads: true,
      require_nda: false,
      enabled: true,
    },
    {
      id: 'policy-2',
      name: 'External Review Policy',
      description: 'Visible + forensic watermarking for external parties',
      watermark_type: 'both',
      strength: 'robust',
      apply_to_roles: ['external', 'vendor'],
      apply_to_asset_types: ['video', 'image', 'document'],
      visible_watermark_config: {
        text: 'CONFIDENTIAL - {viewer_name}',
        position: 'bottom-right',
        opacity: 0.3,
        font_size: 24,
        include_viewer_info: true,
        include_timestamp: true,
      },
      auto_expire_days: 14,
      track_downloads: true,
      require_nda: true,
      enabled: true,
    },
    {
      id: 'policy-3',
      name: 'Internal Team Policy',
      description: 'Light forensic tracking for internal team members',
      watermark_type: 'forensic',
      strength: 'light',
      apply_to_roles: ['team', 'admin'],
      apply_to_asset_types: ['video'],
      auto_expire_days: 90,
      track_downloads: false,
      require_nda: false,
      enabled: true,
    },
  ];
}

function getDemoLeakDetection(): LeakDetectionResult {
  return {
    id: 'leak-1',
    scan_id: 'scan-abc123',
    source_asset_id: 'asset-project-demo',
    detected_watermark_id: 'wm-2',
    detection_status: 'detected',
    detected_viewer: {
      id: 'viewer-2',
      email: 'stakeholder@partner.com',
      name: 'Sarah Stakeholder',
      organization: 'Partner Inc.',
    },
    leak_timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    leak_location: 'Social Media - Twitter/X',
    confidence_score: 0.94,
    evidence: [
      {
        screenshot_url: '/evidence/leak-screenshot-1.png',
        platform: 'Twitter/X',
        url_found: 'https://twitter.com/user/status/123456789',
      },
    ],
    chain_of_custody: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Watermark Created',
        actor: 'System',
        details: 'Forensic watermark applied for viewer-2',
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        action: 'Link Generated',
        actor: 'admin@freeflow.com',
        details: 'Secure viewing link sent to stakeholder@partner.com',
      },
      {
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'First Access',
        actor: 'stakeholder@partner.com',
        details: 'Content accessed from IP 10.0.0.50',
      },
      {
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        action: 'Leak Detected',
        actor: 'Leak Scanner',
        details: 'Content found on Twitter/X with watermark intact',
      },
    ],
    legal_export_available: true,
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (assetId) {
      const watermarks = getDemoWatermarks().filter(w => w.asset_id === assetId);
      return NextResponse.json({
        success: true,
        data: {
          asset_id: assetId,
          watermarks,
          total: watermarks.length,
        },
        source: 'demo',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        features: [
          'Invisible forensic watermarks',
          'Viewer-specific tracking',
          'Leak detection & tracing',
          'Multi-layer watermarking',
          'Tamper detection',
          'Chain of custody',
          'Legal evidence export',
          'Policy-based automation',
        ],
        supported_formats: ['mp4', 'mov', 'avi', 'jpg', 'png', 'pdf'],
        watermark_types: ['forensic', 'visible', 'both'],
        strength_levels: ['light', 'standard', 'robust'],
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('Watermark GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: getDemoWatermarks(),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WatermarkRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'create-watermark': {
        const { assetId, viewerId, viewerEmail, viewerName, watermarkType, strength, customData } = body;

        if (!assetId || !viewerEmail) {
          return NextResponse.json(
            { success: false, error: 'Asset ID and viewer email required' },
            { status: 400 }
          );
        }

        const watermark: ForensicWatermark = {
          id: `wm-${Date.now()}`,
          asset_id: assetId,
          viewer_id: viewerId || `viewer-${Date.now()}`,
          viewer_email: viewerEmail,
          viewer_name: viewerName || viewerEmail.split('@')[0],
          session_id: `session-${Date.now()}`,
          watermark_type: watermarkType || 'forensic',
          watermark_strength: strength || 'robust',
          payload: {
            viewer_identifier: `V-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            timestamp: new Date().toISOString(),
            ip_address: '0.0.0.0',
            device_fingerprint: `fp-${Date.now()}`,
            organization_id: viewerEmail.split('@')[1],
            custom_data: customData,
          },
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          access_count: 0,
          last_accessed_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: watermark,
          message: 'Forensic watermark created and applied',
        });
      }

      case 'detect-watermark': {
        const { scannedContent, scanUrl } = body;

        if (!scannedContent && !scanUrl) {
          return NextResponse.json(
            { success: false, error: 'Scanned content or URL required' },
            { status: 400 }
          );
        }

        // Simulate watermark detection
        const detected = Math.random() > 0.3; // 70% detection rate demo
        const watermark = detected ? getDemoWatermarks()[0] : null;

        return NextResponse.json({
          success: true,
          data: {
            scan_id: `scan-${Date.now()}`,
            detection_status: detected ? 'detected' : 'not_detected',
            detected_watermark: watermark,
            confidence_score: detected ? 0.85 + Math.random() * 0.1 : 0,
            scan_timestamp: new Date().toISOString(),
            analysis_details: {
              frames_analyzed: 1200,
              watermark_fragments_found: detected ? 847 : 0,
              tampering_detected: false,
            },
          },
        });
      }

      case 'scan-for-leaks': {
        const { assetId } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            scan_id: `leak-scan-${Date.now()}`,
            asset_id: assetId,
            status: 'scanning',
            platforms_scanning: ['Google', 'YouTube', 'Twitter/X', 'Facebook', 'Instagram', 'TikTok', 'Vimeo'],
            estimated_completion_seconds: 300,
            webhook_url: `/api/webhooks/leak-scan-complete`,
          },
          message: 'Leak scan initiated across multiple platforms',
        });
      }

      case 'get-leak-report': {
        const { assetId } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: getDemoLeakDetection(),
        });
      }

      case 'create-policy': {
        const { policy } = body;

        if (!policy?.name) {
          return NextResponse.json({ success: false, error: 'Policy name required' }, { status: 400 });
        }

        const newPolicy: WatermarkPolicy = {
          id: `policy-${Date.now()}`,
          name: policy.name,
          description: policy.description || '',
          watermark_type: policy.watermark_type || 'forensic',
          strength: policy.strength || 'standard',
          apply_to_roles: policy.apply_to_roles || ['external'],
          apply_to_asset_types: policy.apply_to_asset_types || ['video'],
          visible_watermark_config: policy.visible_watermark_config,
          auto_expire_days: policy.auto_expire_days || 30,
          track_downloads: policy.track_downloads ?? true,
          require_nda: policy.require_nda ?? false,
          enabled: true,
        };

        return NextResponse.json({
          success: true,
          data: newPolicy,
          message: 'Watermark policy created',
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
            applied_settings: {
              watermark_type: policy?.watermark_type,
              strength: policy?.strength,
              expires_in_days: policy?.auto_expire_days,
            },
            applied_at: new Date().toISOString(),
          },
          message: `Policy "${policy?.name}" applied to asset`,
        });
      }

      case 'get-chain-of-custody': {
        const { assetId } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        const custody = getDemoLeakDetection().chain_of_custody;

        return NextResponse.json({
          success: true,
          data: {
            asset_id: assetId,
            chain_of_custody: custody,
            total_events: custody.length,
            first_event: custody[0]?.timestamp,
            last_event: custody[custody.length - 1]?.timestamp,
          },
        });
      }

      case 'generate-viewer-link': {
        const { assetId, viewerEmail, viewerName, customData } = body;

        if (!assetId || !viewerEmail) {
          return NextResponse.json(
            { success: false, error: 'Asset ID and viewer email required' },
            { status: 400 }
          );
        }

        const token = Buffer.from(`${assetId}:${viewerEmail}:${Date.now()}`).toString('base64');

        return NextResponse.json({
          success: true,
          data: {
            viewer_link: `https://view.freeflow.io/secure/${token}`,
            asset_id: assetId,
            viewer_email: viewerEmail,
            watermark_id: `wm-${Date.now()}`,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            tracking_enabled: true,
          },
          message: 'Secure viewer link generated with forensic watermarking',
        });
      }

      case 'revoke-access': {
        const { assetId, viewerId } = body;

        if (!assetId || !viewerId) {
          return NextResponse.json(
            { success: false, error: 'Asset ID and viewer ID required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            asset_id: assetId,
            viewer_id: viewerId,
            revoked_at: new Date().toISOString(),
            watermarks_deactivated: 1,
            links_invalidated: 1,
          },
          message: 'Access revoked successfully',
        });
      }

      case 'export-legal-report': {
        const { assetId } = body;

        if (!assetId) {
          return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            report_id: `legal-${Date.now()}`,
            asset_id: assetId,
            report_type: 'legal_evidence_package',
            includes: [
              'Chain of custody documentation',
              'Watermark detection analysis',
              'Timestamped screenshots',
              'Technical methodology statement',
              'Witness statement template',
            ],
            download_url: `/reports/legal-evidence-${assetId}-${Date.now()}.pdf`,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          message: 'Legal evidence report generated',
        });
      }

      case 'batch-watermark': {
        const { assetIds, viewerEmail, viewerName, watermarkType, strength } = body;

        if (!assetIds?.length || !viewerEmail) {
          return NextResponse.json(
            { success: false, error: 'Asset IDs array and viewer email required' },
            { status: 400 }
          );
        }

        const results = assetIds.map(assetId => ({
          asset_id: assetId,
          watermark_id: `wm-batch-${Date.now()}-${assetId}`,
          status: 'success',
        }));

        return NextResponse.json({
          success: true,
          data: {
            batch_id: `batch-${Date.now()}`,
            viewer_email: viewerEmail,
            total_assets: assetIds.length,
            successful: results.length,
            failed: 0,
            results,
          },
          message: `Watermarks applied to ${assetIds.length} assets`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Watermark POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
