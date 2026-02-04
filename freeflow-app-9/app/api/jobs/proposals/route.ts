/**
 * Proposals API - FreeFlow A+++ Implementation
 * Freelancer proposals for jobs
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

const logger = createSimpleLogger('job-proposals');

const createProposalSchema = z.object({
  job_id: z.string().uuid(),
  cover_letter: z.string().min(100).max(5000),
  proposed_rate: z.number().min(1),
  rate_type: z.enum(['fixed', 'hourly']),
  estimated_duration: z.string().optional(),
  milestones: z.array(z.object({
    description: z.string(),
    amount: z.number().min(0),
    days: z.number().min(1),
  })).optional(),
  question_answers: z.record(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  relevant_portfolio_items: z.array(z.string()).optional(),
});

// GET - Get user's proposals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('job_id');

    let query = supabase
      .from('job_proposals')
      .select(`
        *,
        job:freelancer_jobs (
          id, title, slug, budget_type, budget_min, budget_max,
          status, client_id, experience_level
        )
      `)
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: proposals, error } = await query;

    if (error && error.code !== '42P01') {
      throw error;
    }

    return NextResponse.json({ proposals: proposals || [] });
  } catch (error) {
    logger.error('Proposals GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create proposal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProposalSchema.parse(body);

    // Check if job exists and is open
    const { data: job, error: jobError } = await supabase
      .from('freelancer_jobs')
      .select('id, status, client_id, required_skills')
      .eq('id', validatedData.job_id)
      .single();

    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'This job is not accepting proposals' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const { data: existingProposal } = await supabase
      .from('job_proposals')
      .select('id')
      .eq('freelancer_id', user.id)
      .eq('job_id', validatedData.job_id)
      .single();

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    // Get freelancer's profile for match scoring
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id, skills')
      .eq('user_id', user.id)
      .single();

    // Calculate skill match
    const freelancerSkills = sellerProfile?.skills || [];
    const requiredSkills = job.required_skills || [];
    const skillsMatched = freelancerSkills.filter((s: string) =>
      requiredSkills.some((rs: string) => rs.toLowerCase() === s.toLowerCase())
    );
    const skillsMissing = requiredSkills.filter((rs: string) =>
      !freelancerSkills.some((s: string) => s.toLowerCase() === rs.toLowerCase())
    );

    // Simple match score calculation
    const matchScore = requiredSkills.length > 0
      ? (skillsMatched.length / requiredSkills.length) * 100
      : 50;

    const { data: proposal, error: createError } = await supabase
      .from('job_proposals')
      .insert({
        job_id: validatedData.job_id,
        freelancer_id: user.id,
        seller_profile_id: sellerProfile?.id,
        cover_letter: validatedData.cover_letter,
        proposed_rate: validatedData.proposed_rate,
        rate_type: validatedData.rate_type,
        estimated_duration: validatedData.estimated_duration,
        milestones: validatedData.milestones || [],
        question_answers: validatedData.question_answers || {},
        attachments: validatedData.attachments || [],
        relevant_portfolio_items: validatedData.relevant_portfolio_items || [],
        match_score: matchScore,
        skills_matched: skillsMatched,
        skills_missing: skillsMissing,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Update job proposals count
    await supabase
      .rpc('increment_proposals_count', { job_id: validatedData.job_id })
      .catch(() => {
        // Fallback if RPC doesn't exist
        supabase
          .from('freelancer_jobs')
          .update({ proposals_count: job.proposals_count + 1 })
          .eq('id', validatedData.job_id)
          .then(() => {});
      });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Proposals POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
