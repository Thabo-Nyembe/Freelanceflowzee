// =====================================================
// KAZI Sync Jobs API Route
// Data synchronization job management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService } from '@/lib/integrations/integration-service';
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

const logger = createFeatureLogger('integrations-sync');

// =====================================================
// GET - List sync jobs
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration_id') || undefined;
    const jobId = searchParams.get('job_id');

    // Get single job
    if (jobId) {
      const job = await integrationService.getSyncJob(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Sync job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, job });
    }

    // List jobs
    const jobs = await integrationService.getSyncJobs(user.id, integrationId);
    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    logger.error('Sync Jobs GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sync jobs' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create or manage sync jobs
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create': {
        if (!data.integration_id || !data.type || !data.entity_type) {
          return NextResponse.json(
            { success: false, error: 'integration_id, type, and entity_type are required' },
            { status: 400 }
          );
        }

        const validTypes = ['import', 'export', 'sync'];
        if (!validTypes.includes(data.type)) {
          return NextResponse.json(
            { success: false, error: `Invalid type. Valid types: ${validTypes.join(', ')}` },
            { status: 400 }
          );
        }

        const job = await integrationService.createSyncJob(user.id, {
          integration_id: data.integration_id,
          type: data.type,
          entity_type: data.entity_type,
          total_items: data.total_items,
        });

        return NextResponse.json({
          success: true,
          action: 'create',
          job,
          message: 'Sync job created successfully',
        }, { status: 201 });
      }

      case 'start': {
        if (!data.job_id) {
          return NextResponse.json(
            { success: false, error: 'job_id is required' },
            { status: 400 }
          );
        }

        const job = await integrationService.startSyncJob(data.job_id);
        return NextResponse.json({
          success: true,
          action: 'start',
          job,
          message: 'Sync job started',
        });
      }

      case 'update-progress': {
        if (!data.job_id) {
          return NextResponse.json(
            { success: false, error: 'job_id is required' },
            { status: 400 }
          );
        }

        const job = await integrationService.updateSyncJobProgress(data.job_id, {
          processed_items: data.processed_items,
          created_items: data.created_items,
          updated_items: data.updated_items,
          skipped_items: data.skipped_items,
          error_items: data.error_items,
          errors: data.errors,
        });

        return NextResponse.json({
          success: true,
          action: 'update-progress',
          job,
        });
      }

      case 'complete': {
        if (!data.job_id || !data.status) {
          return NextResponse.json(
            { success: false, error: 'job_id and status are required' },
            { status: 400 }
          );
        }

        const validStatuses = ['completed', 'failed'];
        if (!validStatuses.includes(data.status)) {
          return NextResponse.json(
            { success: false, error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` },
            { status: 400 }
          );
        }

        const job = await integrationService.completeSyncJob(
          data.job_id,
          data.status,
          data.error_message
        );

        return NextResponse.json({
          success: true,
          action: 'complete',
          job,
          message: `Sync job ${data.status}`,
        });
      }

      case 'sync-calendar': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const job = await integrationService.syncGoogleCalendar(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'sync-calendar',
          job,
          message: 'Calendar sync started',
        });
      }

      case 'sync-payments': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const job = await integrationService.syncStripePayments(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'sync-payments',
          job,
          message: 'Payment sync started',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Sync Jobs POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
