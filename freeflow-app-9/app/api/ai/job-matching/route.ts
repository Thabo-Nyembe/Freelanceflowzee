/**
 * AI Job Matching API - FreeFlow A+++ Implementation
 * Complete job matching with AI embeddings
 *
 * Beats Upwork/Contra with:
 * - ML-powered skill matching with OpenAI embeddings
 * - Portfolio analysis for relevance scoring
 * - Availability-aware matching
 * - Rate optimization suggestions
 * - Client compatibility scoring
 * - Career growth recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  matchFreelancerToJobs,
  matchJobToFreelancers,
  getMarketInsights,
  getProfileOptimization,
  createJobEmbedding,
  createProfileEmbedding,
} from '@/lib/ai/job-matching';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const matchRequestSchema = z.object({
  action: z.enum([
    'get-matches',
    'get-match-details',
    'match-freelancers',
    'update-preferences',
    'analyze-job',
    'get-recommendations',
    'save-job',
    'hide-job',
    'get-saved',
    'get-insights',
    'optimize-profile',
    'refresh-embedding',
  ]),
  userId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  preferences: z.any().optional(),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    minBudget: z.number().optional(),
    maxBudget: z.number().optional(),
    minMatchScore: z.number().optional(),
    experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
    jobType: z.enum(['one_time', 'ongoing', 'full_time', 'part_time']).optional(),
    postedWithin: z.number().optional(), // hours
  }).optional(),
});

// ============================================================================
// GET - Quick match retrieval
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minScore = parseInt(searchParams.get('minScore') || '50');

    if (jobId) {
      // Get specific job match details
      const { data: match } = await supabase
        .from('job_matches')
        .select(`
          *,
          job:freelancer_jobs (
            id, title, description, budget_type, budget_min, budget_max,
            duration, posted_at, proposals_count, required_skills, status,
            client:client_profiles!client_id (company_name, rating, total_spent)
          )
        `)
        .eq('job_id', jobId)
        .eq('freelancer_id', user.id)
        .single();

      return NextResponse.json({
        success: true,
        data: match,
      });
    }

    // Get stored matches for freelancer
    const { data: storedMatches } = await supabase
      .from('job_matches')
      .select(`
        *,
        job:freelancer_jobs (
          id, title, description, budget_type, budget_min, budget_max,
          duration, posted_at, proposals_count, required_skills, status,
          client:client_profiles!client_id (company_name, rating, total_spent)
        )
      `)
      .eq('freelancer_id', user.id)
      .eq('is_dismissed', false)
      .gte('expires_at', new Date().toISOString())
      .gte('match_score', minScore)
      .order('match_score', { ascending: false })
      .limit(limit);

    // If no stored matches, calculate fresh ones
    if (!storedMatches || storedMatches.length < 5) {
      try {
        const freshMatches = await matchFreelancerToJobs(user.id, {
          limit,
          minScore,
        });

        // Store the matches for quick retrieval
        if (freshMatches.length > 0) {
          const matchRecords = freshMatches.map(match => ({
            job_id: match.job_id,
            freelancer_id: user.id,
            match_score: match.total_score,
            similarity_score: match.similarity_score / 100,
            skill_match_score: match.skill_score / 100,
            experience_match_score: match.experience_score / 100,
            availability_match_score: match.availability_score / 100,
            match_reasons: match.match_reasons,
            skills_matched: match.skills_matched,
            skills_missing: match.skills_missing,
            recommended_rate_min: match.rate_recommendation.min,
            recommended_rate_max: match.rate_recommendation.max,
            recommended_rate_optimal: match.rate_recommendation.optimal,
            competition_level: match.competition_level,
            win_probability: match.win_probability,
            career_growth_score: match.career_growth_score,
          }));

          // Upsert matches
          await supabase
            .from('job_matches')
            .upsert(matchRecords, { onConflict: 'job_id,freelancer_id' });
        }

        return NextResponse.json({
          success: true,
          data: {
            matches: freshMatches,
            total: freshMatches.length,
            source: 'calculated',
          },
        });
      } catch (error) {
        console.error('Error calculating matches:', error);
        // Return stored matches even if stale
        return NextResponse.json({
          success: true,
          data: {
            matches: storedMatches || [],
            total: storedMatches?.length || 0,
            source: 'stored',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        matches: storedMatches,
        total: storedMatches.length,
        source: 'stored',
      },
    });
  } catch (error) {
    console.error('Job Matching GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Advanced matching operations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, jobId, filters } = matchRequestSchema.parse(body);

    switch (action) {
      // ----------------------------------------------------------------
      // FREELANCER: Get job matches
      // ----------------------------------------------------------------
      case 'get-matches': {
        try {
          const matches = await matchFreelancerToJobs(user.id, {
            limit: 20,
            minScore: filters?.minMatchScore || 50,
            categories: filters?.categories,
            budgetMin: filters?.minBudget,
            budgetMax: filters?.maxBudget,
          });

          return NextResponse.json({
            success: true,
            data: {
              matches,
              total: matches.length,
              filters_applied: filters,
            },
          });
        } catch (error) {
          console.error('Match calculation error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to calculate matches',
          }, { status: 500 });
        }
      }

      // ----------------------------------------------------------------
      // FREELANCER: Get detailed match for specific job
      // ----------------------------------------------------------------
      case 'get-match-details': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        // Get full job details
        const { data: job, error: jobError } = await supabase
          .from('freelancer_jobs')
          .select(`
            *,
            client:client_profiles!client_id (
              id, company_name, company_size, industry,
              jobs_posted, jobs_filled, total_spent, average_hourly_rate,
              rehire_rate, rating, reviews_count, payment_verified
            ),
            required_skills_details:job_required_skills (skill_name, importance)
          `)
          .eq('id', jobId)
          .single();

        if (jobError || !job) {
          return NextResponse.json(
            { success: false, error: 'Job not found' },
            { status: 404 }
          );
        }

        // Get match score
        const { data: existingMatch } = await supabase
          .from('job_matches')
          .select('*')
          .eq('job_id', jobId)
          .eq('freelancer_id', user.id)
          .single();

        // Get similar jobs user has worked on
        const { data: similarWins } = await supabase
          .from('service_orders')
          .select(`
            id,
            listing:service_listings (title, category_id),
            total,
            completed_at
          `)
          .eq('seller_id', user.id)
          .eq('status', 'completed')
          .limit(5);

        // Enhanced match details
        const matchDetails = {
          job,
          match: existingMatch || {
            match_score: 0,
            match_reasons: [],
            skills_matched: [],
            skills_missing: job.required_skills || [],
          },
          client_history: {
            jobs_posted: job.client?.jobs_posted || 0,
            hires: job.client?.jobs_filled || 0,
            rehire_rate: job.client?.rehire_rate || 0,
            average_rating_given: job.client?.rating || 0,
            payment_verified: job.client?.payment_verified || false,
          },
          similar_jobs_completed: similarWins?.map(w => ({
            title: (w.listing as { title?: string })?.title || 'Untitled',
            amount: w.total,
            date: w.completed_at,
          })) || [],
          proposal_tips: generateProposalTips(job, existingMatch),
        };

        return NextResponse.json({
          success: true,
          data: matchDetails,
        });
      }

      // ----------------------------------------------------------------
      // CLIENT: Get matching freelancers for a job
      // ----------------------------------------------------------------
      case 'match-freelancers': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        // Verify user owns the job
        const { data: job } = await supabase
          .from('freelancer_jobs')
          .select('client_id')
          .eq('id', jobId)
          .single();

        if (!job || job.client_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Access denied' },
            { status: 403 }
          );
        }

        try {
          const matches = await matchJobToFreelancers(jobId, {
            limit: 50,
            minScore: filters?.minMatchScore || 50,
          });

          return NextResponse.json({
            success: true,
            data: {
              matches,
              total: matches.length,
            },
          });
        } catch (error) {
          console.error('Freelancer matching error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to find matching freelancers',
          }, { status: 500 });
        }
      }

      // ----------------------------------------------------------------
      // Update matching preferences
      // ----------------------------------------------------------------
      case 'update-preferences': {
        const { preferences } = body;

        // Update seller profile with preferences
        const { error: updateError } = await supabase
          .from('seller_profiles')
          .update({
            hourly_rate_min: preferences?.hourly_rate_min,
            hourly_rate_max: preferences?.hourly_rate_max,
            available_hours_per_week: preferences?.available_hours,
            timezone: preferences?.timezone,
          })
          .eq('user_id', user.id);

        if (updateError) {
          return NextResponse.json(
            { success: false, error: 'Failed to update preferences' },
            { status: 500 }
          );
        }

        // Clear old matches to force recalculation
        await supabase
          .from('job_matches')
          .delete()
          .eq('freelancer_id', user.id);

        // Calculate new matches
        const newMatches = await matchFreelancerToJobs(user.id, { limit: 10 });

        return NextResponse.json({
          success: true,
          data: {
            updated: true,
            new_matches_count: newMatches.length,
          },
          message: `Preferences updated. Found ${newMatches.length} new matches.`,
        });
      }

      // ----------------------------------------------------------------
      // Analyze a specific job
      // ----------------------------------------------------------------
      case 'analyze-job': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        const { data: job } = await supabase
          .from('freelancer_jobs')
          .select(`
            *,
            client:client_profiles!client_id (
              rating, total_spent, payment_verified, rehire_rate
            )
          `)
          .eq('id', jobId)
          .single();

        if (!job) {
          return NextResponse.json(
            { success: false, error: 'Job not found' },
            { status: 404 }
          );
        }

        // Analyze job quality
        const greenFlags: string[] = [];
        const redFlags: string[] = [];

        if (job.client?.payment_verified) {
          greenFlags.push('Verified payment method');
        } else {
          redFlags.push('Payment not verified');
        }

        if ((job.client?.rating || 0) >= 4.5) {
          greenFlags.push(`High client rating (${job.client.rating}/5)`);
        }

        if ((job.client?.total_spent || 0) >= 10000) {
          greenFlags.push('Experienced client with $10k+ spent');
        }

        if (job.description && job.description.length > 500) {
          greenFlags.push('Detailed job description');
        } else {
          redFlags.push('Limited job description');
        }

        if (job.deadline) {
          greenFlags.push('Clear deadline provided');
        }

        if ((job.budget_max || 0) < 50) {
          redFlags.push('Very low budget');
        }

        // Budget analysis
        const marketRate = {
          min: job.budget_min || 0,
          max: job.budget_max || (job.budget_min || 0) * 1.5,
        };

        const analysis = {
          job_id: jobId,
          green_flags: greenFlags,
          red_flags: redFlags,
          budget_analysis: {
            offered: { min: job.budget_min, max: job.budget_max },
            market_rate: marketRate,
            verdict: job.budget_min >= marketRate.min * 0.8
              ? 'Fair - at market rate'
              : 'Below market rate',
          },
          competition_analysis: {
            total_proposals: job.proposals_count || 0,
            estimated_quality: job.proposals_count < 10 ? 'medium' : 'high',
          },
          recommended_action: redFlags.length < greenFlags.length ? 'apply' : 'review_carefully',
          confidence: greenFlags.length >= 3 ? 'high' : 'medium',
        };

        return NextResponse.json({
          success: true,
          data: analysis,
        });
      }

      // ----------------------------------------------------------------
      // Get career recommendations
      // ----------------------------------------------------------------
      case 'get-recommendations': {
        const optimization = await getProfileOptimization(user.id);

        return NextResponse.json({
          success: true,
          data: optimization.improvements,
        });
      }

      // ----------------------------------------------------------------
      // Save/bookmark a job
      // ----------------------------------------------------------------
      case 'save-job': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        const { error: saveError } = await supabase
          .from('saved_jobs')
          .upsert({
            job_id: jobId,
            user_id: user.id,
          }, { onConflict: 'job_id,user_id' });

        if (saveError) {
          return NextResponse.json(
            { success: false, error: 'Failed to save job' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { job_id: jobId, saved: true },
          message: 'Job saved successfully',
        });
      }

      // ----------------------------------------------------------------
      // Hide/dismiss a job match
      // ----------------------------------------------------------------
      case 'hide-job': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'Job ID required' },
            { status: 400 }
          );
        }

        await supabase
          .from('job_matches')
          .update({
            is_dismissed: true,
            dismissed_at: new Date().toISOString(),
          })
          .eq('job_id', jobId)
          .eq('freelancer_id', user.id);

        return NextResponse.json({
          success: true,
          data: { job_id: jobId, hidden: true },
          message: 'Job hidden from matches',
        });
      }

      // ----------------------------------------------------------------
      // Get saved jobs
      // ----------------------------------------------------------------
      case 'get-saved': {
        const { data: savedJobs } = await supabase
          .from('saved_jobs')
          .select(`
            *,
            job:freelancer_jobs (
              id, title, description, budget_type, budget_min, budget_max,
              duration, posted_at, status, required_skills,
              client:client_profiles!client_id (company_name, rating)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        return NextResponse.json({
          success: true,
          data: savedJobs || [],
        });
      }

      // ----------------------------------------------------------------
      // Get market insights
      // ----------------------------------------------------------------
      case 'get-insights': {
        try {
          const insights = await getMarketInsights();

          // Get user's performance stats
          const { data: profile } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          const { count: proposalsSent } = await supabase
            .from('job_proposals')
            .select('*', { count: 'exact', head: true })
            .eq('freelancer_id', user.id);

          const { count: jobsWon } = await supabase
            .from('job_proposals')
            .select('*', { count: 'exact', head: true })
            .eq('freelancer_id', user.id)
            .eq('status', 'accepted');

          return NextResponse.json({
            success: true,
            data: {
              market_trends: insights,
              your_performance: {
                profile_strength: profile ? 70 : 0,
                proposals_sent: proposalsSent || 0,
                jobs_won: jobsWon || 0,
                win_rate: proposalsSent
                  ? Math.round(((jobsWon || 0) / proposalsSent) * 100)
                  : 0,
                rating: profile?.rating || 0,
                level: profile?.level || 'new',
              },
            },
          });
        } catch (error) {
          console.error('Insights error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to get insights',
          }, { status: 500 });
        }
      }

      // ----------------------------------------------------------------
      // Profile optimization suggestions
      // ----------------------------------------------------------------
      case 'optimize-profile': {
        try {
          const optimization = await getProfileOptimization(user.id);

          return NextResponse.json({
            success: true,
            data: optimization,
          });
        } catch (error) {
          console.error('Profile optimization error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to analyze profile',
          }, { status: 500 });
        }
      }

      // ----------------------------------------------------------------
      // Refresh embeddings
      // ----------------------------------------------------------------
      case 'refresh-embedding': {
        try {
          const { data: profile } = await supabase
            .from('seller_profiles')
            .select(`
              *,
              skills_details:freelancer_skills (skill_name)
            `)
            .eq('user_id', user.id)
            .single();

          if (!profile) {
            return NextResponse.json(
              { success: false, error: 'Profile not found' },
              { status: 404 }
            );
          }

          const skills = profile.skills_details?.map((s: { skill_name: string }) => s.skill_name) || profile.skills || [];

          const embedding = await createProfileEmbedding({
            user_id: user.id,
            display_name: profile.display_name,
            bio: profile.bio || '',
            skills,
            experience_years: profile.experience_years || 0,
            hourly_rate_min: profile.hourly_rate_min || 0,
            hourly_rate_max: profile.hourly_rate_max || 0,
            available_hours_per_week: profile.available_hours_per_week || 40,
            rating: profile.rating || 0,
            orders_completed: profile.orders_completed || 0,
            level: profile.level || 'new',
          });

          await supabase
            .from('seller_profiles')
            .update({ embedding })
            .eq('user_id', user.id);

          // Clear old matches
          await supabase
            .from('job_matches')
            .delete()
            .eq('freelancer_id', user.id);

          return NextResponse.json({
            success: true,
            message: 'Profile embedding updated. New matches will be calculated.',
          });
        } catch (error) {
          console.error('Embedding refresh error:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to refresh embedding',
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Job Matching POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateProposalTips(
  job: { title?: string; required_skills?: string[]; description?: string },
  match?: { skills_matched?: string[]; match_score?: number } | null
): string[] {
  const tips: string[] = [];

  if (match?.skills_matched?.length) {
    tips.push(
      `Highlight your experience with: ${match.skills_matched.slice(0, 3).join(', ')}`
    );
  }

  if (job.description && job.description.length > 200) {
    tips.push('Reference specific requirements from the job description');
  }

  tips.push('Include a relevant portfolio piece or case study');
  tips.push('Mention your availability and response time');

  if ((match?.match_score || 0) >= 80) {
    tips.push('Your strong match score gives you leverage - consider premium pricing');
  }

  return tips;
}
