/**
 * Job Detail API - FreeFlow A+++ Implementation
 * GET, PATCH, DELETE for individual jobs
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

const logger = createSimpleLogger('job-detail');

const updateJobSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(50).max(10000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  job_type: z.enum(['one_time', 'ongoing', 'full_time', 'part_time']).optional(),
  experience_level: z.enum(['entry', 'intermediate', 'expert']).optional(),
  budget_type: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
  budget_min: z.number().min(0).optional().nullable(),
  budget_max: z.number().min(0).optional().nullable(),
  estimated_hours: z.number().min(1).optional().nullable(),
  duration: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  location_type: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  location_country: z.string().optional().nullable(),
  timezone_preference: z.string().optional().nullable(),
  required_skills: z.array(z.string()).optional(),
  preferred_skills: z.array(z.string()).optional(),
  questions: z.array(z.object({
    question: z.string(),
    required: z.boolean().default(false),
  })).optional(),
  visibility: z.enum(['public', 'invite_only', 'private']).optional(),
  status: z.enum(['draft', 'open', 'in_review', 'filled', 'cancelled', 'closed']).optional(),
  posted_at: z.string().optional().nullable(),
});

// GET - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('freelancer_jobs')
      .select(`
        *,
        client:client_profiles!client_id (
          company_name, company_size, industry, jobs_posted, jobs_filled,
          total_spent, average_hourly_rate, rehire_rate, rating, reviews_count,
          payment_verified, country, city
        ),
        required_skills_details:job_required_skills (skill_name, importance)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      throw error;
    }

    // Increment view count (don't await)
    supabase
      .from('freelancer_jobs')
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return NextResponse.json({ job });
  } catch (error) {
    logger.error('Job GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existingJob, error: fetchError } = await supabase
      .from('freelancer_jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    const { data: job, error: updateError } = await supabase
      .from('freelancer_jobs')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update required skills if provided
    if (validatedData.required_skills) {
      await supabase
        .from('job_required_skills')
        .delete()
        .eq('job_id', id);

      if (validatedData.required_skills.length > 0) {
        const skillsToInsert = validatedData.required_skills.map((skill, index) => ({
          job_id: id,
          skill_name: skill,
          importance: 5 - Math.min(index, 4),
        }));

        await supabase
          .from('job_required_skills')
          .insert(skillsToInsert);
      }
    }

    return NextResponse.json({ job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Job PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existingJob, error: fetchError } = await supabase
      .from('freelancer_jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.client_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete related data first
    await supabase.from('job_required_skills').delete().eq('job_id', id);
    await supabase.from('saved_jobs').delete().eq('job_id', id);
    await supabase.from('job_invitations').delete().eq('job_id', id);
    // Note: job_proposals might need to be archived instead of deleted

    const { error: deleteError } = await supabase
      .from('freelancer_jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    logger.error('Job DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
