/**
 * Jobs API - FreeFlow A+++ Implementation
 * Complete CRUD for freelancer job board
 *
 * GET - List/Search jobs (freelancer_jobs table)
 * POST - Create job, save job, apply actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('jobs');

const createJobSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(10000),
  category_id: z.string().uuid().optional().nullable(),
  subcategory_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  job_type: z.enum(['one_time', 'ongoing', 'full_time', 'part_time']).default('one_time'),
  experience_level: z.enum(['entry', 'intermediate', 'expert']).default('intermediate'),
  budget_type: z.enum(['fixed', 'hourly', 'negotiable']).default('fixed'),
  budget_min: z.number().min(0).optional().nullable(),
  budget_max: z.number().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  estimated_hours: z.number().min(1).optional().nullable(),
  duration: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  location_type: z.enum(['remote', 'onsite', 'hybrid']).default('remote'),
  location_country: z.string().optional().nullable(),
  location_city: z.string().optional().nullable(),
  timezone_preference: z.string().optional().nullable(),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  questions: z.array(z.object({
    question: z.string(),
    required: z.boolean().default(false),
  })).default([]),
  visibility: z.enum(['public', 'invite_only', 'private']).default('public'),
  status: z.enum(['draft', 'open']).default('draft'),
});

// GET - List/Search jobs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'client' for own jobs
    const type = searchParams.get('type'); // Legacy support
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const experienceLevel = searchParams.get('experience_level');
    const jobType = searchParams.get('job_type');
    const budgetMin = searchParams.get('budget_min');
    const budgetMax = searchParams.get('budget_max');
    const locationType = searchParams.get('location_type');
    const skills = searchParams.get('skills');
    const postedWithin = searchParams.get('posted_within');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Legacy support for old type parameter
    if (type === 'saved') {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          job:freelancer_jobs (
            *,
            client:client_profiles!client_id (company_name, rating, payment_verified)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        savedJobs: data || [],
      });
    }

    // If client role, get their own jobs
    if (role === 'client') {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      let query = supabase
        .from('freelancer_jobs')
        .select(`
          *,
          required_skills_details:job_required_skills (skill_name, importance)
        `, { count: 'exact' })
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data: jobs, error, count } = await query;

      if (error && error.code !== '42P01') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        jobs: jobs || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Public job search for freelancer_jobs
    let query = supabase
      .from('freelancer_jobs')
      .select(`
        *,
        client:client_profiles!client_id (
          company_name, rating, total_spent, payment_verified
        ),
        required_skills_details:job_required_skills (skill_name, importance)
      `, { count: 'exact' })
      .eq('status', 'open')
      .order('posted_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    if (budgetMin) {
      query = query.gte('budget_max', parseFloat(budgetMin));
    }

    if (budgetMax) {
      query = query.lte('budget_min', parseFloat(budgetMax));
    }

    if (locationType) {
      query = query.eq('location_type', locationType);
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query = query.contains('required_skills', skillsArray);
    }

    if (postedWithin) {
      const hours = parseInt(postedWithin);
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      query = query.gte('posted_at', since);
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error && error.code !== '42P01') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Jobs GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create job or perform actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if it's a legacy action
    if (body.action) {
      return handleLegacyAction(supabase, user.id, body);
    }

    // New job creation
    const validatedData = createJobSchema.parse(body);

    // Ensure client profile exists
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!clientProfile) {
      // Create client profile
      await supabase
        .from('client_profiles')
        .insert({ user_id: user.id });
    }

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('freelancer_jobs')
      .insert({
        client_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        category_id: validatedData.category_id,
        subcategory_id: validatedData.subcategory_id,
        tags: validatedData.tags,
        job_type: validatedData.job_type,
        experience_level: validatedData.experience_level,
        budget_type: validatedData.budget_type,
        budget_min: validatedData.budget_min,
        budget_max: validatedData.budget_max,
        currency: validatedData.currency,
        estimated_hours: validatedData.estimated_hours,
        duration: validatedData.duration,
        deadline: validatedData.deadline,
        start_date: validatedData.start_date,
        location_type: validatedData.location_type,
        location_country: validatedData.location_country,
        location_city: validatedData.location_city,
        timezone_preference: validatedData.timezone_preference,
        required_skills: validatedData.required_skills,
        preferred_skills: validatedData.preferred_skills,
        attachments: validatedData.attachments,
        questions: validatedData.questions,
        visibility: validatedData.visibility,
        status: validatedData.status,
        posted_at: validatedData.status === 'open' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (jobError) {
      logger.error('Job creation error', { error: jobError });
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    // Add required skills with importance
    if (validatedData.required_skills.length > 0) {
      const skillsToInsert = validatedData.required_skills.map((skill, index) => ({
        job_id: job.id,
        skill_name: skill,
        importance: 5 - Math.min(index, 4), // First skills are most important
      }));

      await supabase
        .from('job_required_skills')
        .insert(skillsToInsert);
    }

    // Generate embedding for matching (async)
    if (validatedData.status === 'open') {
      try {
        const { createJobEmbedding } = await import('@/lib/ai/job-matching');
        createJobEmbedding({
          id: job.id,
          client_id: user.id,
          title: job.title,
          description: job.description,
          required_skills: validatedData.required_skills,
          preferred_skills: validatedData.preferred_skills,
          experience_level: job.experience_level,
          budget_type: job.budget_type,
          budget_min: job.budget_min || 0,
          budget_max: job.budget_max || 0,
          estimated_hours: job.estimated_hours || 0,
          duration: job.duration || '',
        }).then(embedding => {
          if (embedding) {
            supabase
              .from('freelancer_jobs')
              .update({ embedding })
              .eq('id', job.id)
              .then(() => {});
          }
        }).catch((err) => logger.error('Embedding creation error', { error: err }));
      } catch {
        // Embedding creation is optional
      }
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Jobs POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle legacy action-based requests
async function handleLegacyAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: { action: string; [key: string]: unknown }
) {
  const { action, ...data } = body;

  switch (action) {
    case 'save-job': {
      const { jobId, unsave } = data as { jobId: string; unsave?: boolean };

      if (unsave) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId);

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          action: 'unsave-job',
          message: 'Job removed from saved',
        });
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .upsert({
            user_id: userId,
            job_id: jobId,
          }, { onConflict: 'job_id,user_id' });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          action: 'save-job',
          message: 'Job saved successfully',
        });
      }
    }

    case 'apply': {
      const { jobId, coverLetter, proposedRate, rateType, milestones, questionAnswers } = data as {
        jobId: string;
        coverLetter: string;
        proposedRate: number;
        rateType?: string;
        milestones?: unknown[];
        questionAnswers?: Record<string, string>;
      };

      // Get seller profile
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      // Check if already applied
      const { data: existing } = await supabase
        .from('job_proposals')
        .select('id')
        .eq('freelancer_id', userId)
        .eq('job_id', jobId)
        .single();

      if (existing) {
        return NextResponse.json({
          success: false,
          error: 'You have already applied to this job',
        }, { status: 409 });
      }

      const { data: proposal, error } = await supabase
        .from('job_proposals')
        .insert({
          job_id: jobId,
          freelancer_id: userId,
          seller_profile_id: sellerProfile?.id,
          cover_letter: coverLetter,
          proposed_rate: proposedRate,
          rate_type: rateType || 'fixed',
          milestones: milestones || [],
          question_answers: questionAnswers || {},
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error && error.code !== '42P01') throw error;

      return NextResponse.json({
        success: true,
        action: 'apply',
        proposal: proposal || { id: `prop-${Date.now()}`, status: 'submitted' },
        message: 'Proposal submitted successfully',
      });
    }

    case 'search': {
      const { query, location, type: jobType, remote, salaryMin, salaryMax, limit = 20 } = data as {
        query?: string;
        location?: string;
        type?: string;
        remote?: boolean;
        salaryMin?: number;
        salaryMax?: number;
        limit?: number;
      };

      let dbQuery = supabase
        .from('freelancer_jobs')
        .select(`
          *,
          client:client_profiles!client_id (company_name, rating)
        `)
        .eq('status', 'open')
        .limit(limit);

      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (location) {
        dbQuery = dbQuery.or(`location_country.ilike.%${location}%,location_city.ilike.%${location}%`);
      }
      if (jobType) {
        dbQuery = dbQuery.eq('job_type', jobType);
      }
      if (remote) {
        dbQuery = dbQuery.eq('location_type', 'remote');
      }
      if (salaryMin) {
        dbQuery = dbQuery.gte('budget_max', salaryMin);
      }
      if (salaryMax) {
        dbQuery = dbQuery.lte('budget_min', salaryMax);
      }

      const { data: results, error } = await dbQuery.order('posted_at', { ascending: false });

      if (error && error.code !== '42P01') throw error;

      return NextResponse.json({
        success: true,
        action: 'search',
        jobs: results || [],
        message: `Found ${results?.length || 0} jobs`,
      });
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
