/**
 * Job Invitations API - FreeFlow A+++ Implementation
 * Manage job invitations to freelancers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
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

const logger = createFeatureLogger('job-invitations');

const createInvitationSchema = z.object({
  job_id: z.string().uuid(),
  freelancer_id: z.string().uuid(),
  message: z.string().max(1000).optional(),
});

// GET - Get invitations for current user (freelancer)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: invitations, error } = await supabase
      .from('job_invitations')
      .select(`
        *,
        job:freelancer_jobs (
          id, title, slug, description, budget_type, budget_min, budget_max,
          required_skills, experience_level, location_type, status
        )
      `)
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false });

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    logger.error('Invitations GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send invitation (client)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    // Verify user owns the job
    const { data: job, error: jobError } = await supabase
      .from('freelancer_jobs')
      .select('client_id, status')
      .eq('id', validatedData.job_id)
      .single();

    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'Job is not open for invitations' },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('job_invitations')
      .select('id')
      .eq('job_id', validatedData.job_id)
      .eq('freelancer_id', validatedData.freelancer_id)
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent' },
        { status: 409 }
      );
    }

    const { data: invitation, error: createError } = await supabase
      .from('job_invitations')
      .insert({
        job_id: validatedData.job_id,
        client_id: user.id,
        freelancer_id: validatedData.freelancer_id,
        message: validatedData.message,
        status: 'pending',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Invitations POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
