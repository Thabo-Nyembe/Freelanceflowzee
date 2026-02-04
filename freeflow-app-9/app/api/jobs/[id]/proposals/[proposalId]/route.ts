/**
 * Proposal Detail API - FreeFlow A+++ Implementation
 * Update proposal status (client actions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('job-proposals-detail');

const updateProposalSchema = z.object({
  action: z.enum(['shortlist', 'reject', 'schedule_interview', 'send_offer']).optional(),
  interview_scheduled_at: z.string().optional(),
  interview_notes: z.string().optional(),
  offer_amount: z.number().optional(),
  offer_message: z.string().optional(),
});

// PATCH - Update proposal (client actions)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const { id, proposalId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is the job owner
    const { data: job, error: jobError } = await supabase
      .from('freelancer_jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProposalSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Handle different actions
    switch (validatedData.action) {
      case 'shortlist':
        updateData.status = 'shortlisted';
        updateData.shortlisted_at = new Date().toISOString();
        break;

      case 'reject':
        updateData.status = 'rejected';
        break;

      case 'schedule_interview':
        updateData.status = 'interviewing';
        updateData.interview_scheduled_at = validatedData.interview_scheduled_at;
        updateData.interview_notes = validatedData.interview_notes;
        break;

      case 'send_offer':
        updateData.status = 'offer_sent';
        updateData.offer_amount = validatedData.offer_amount;
        updateData.offer_message = validatedData.offer_message;
        updateData.offer_sent_at = new Date().toISOString();
        updateData.offer_expires_at = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ).toISOString();
        break;

      default:
        // Allow direct field updates if no action
        if (validatedData.interview_scheduled_at) {
          updateData.interview_scheduled_at = validatedData.interview_scheduled_at;
        }
        if (validatedData.interview_notes) {
          updateData.interview_notes = validatedData.interview_notes;
        }
    }

    const { data: proposal, error: updateError } = await supabase
      .from('job_proposals')
      .update(updateData)
      .eq('id', proposalId)
      .eq('job_id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Proposal PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
