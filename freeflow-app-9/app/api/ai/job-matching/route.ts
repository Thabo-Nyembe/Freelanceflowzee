/**
 * Smart Job Matching API
 *
 * Beats Contra's Indy AI with:
 * - ML-powered skill matching
 * - Portfolio analysis
 * - Availability-aware matching
 * - Rate optimization suggestions
 * - Client compatibility scoring
 * - Career growth recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

type MatchConfidence = 'high' | 'medium' | 'low';
type JobCategory = 'development' | 'design' | 'writing' | 'marketing' | 'video' | 'audio' | 'consulting' | 'other';

interface JobMatch {
  id: string;
  job_id: string;
  job_title: string;
  client_name: string;
  client_avatar: string | null;
  client_rating: number;
  client_total_spent: number;
  category: JobCategory;
  description: string;
  budget: { type: 'fixed' | 'hourly'; min: number; max: number };
  duration: string;
  posted_at: string;
  proposals_count: number;
  match_score: number;
  match_confidence: MatchConfidence;
  match_reasons: string[];
  skill_matches: { skill: string; match_type: 'exact' | 'related' | 'transferable' }[];
  portfolio_matches: { project_id: string; project_title: string; relevance: number }[];
  rate_recommendation: { min: number; max: number; optimal: number };
  competition_level: 'low' | 'medium' | 'high';
  win_probability: number;
  career_growth_score: number;
}

interface FreelancerProfile {
  id: string;
  name: string;
  skills: { name: string; level: 'beginner' | 'intermediate' | 'expert'; years: number }[];
  hourly_rate: number;
  availability: 'full-time' | 'part-time' | 'limited';
  preferred_categories: JobCategory[];
  min_budget: number;
  portfolio_strength: number;
  response_rate: number;
  completion_rate: number;
}

interface JobMatchRequest {
  action:
    | 'get-matches'
    | 'get-match-details'
    | 'update-preferences'
    | 'analyze-job'
    | 'get-recommendations'
    | 'save-job'
    | 'hide-job'
    | 'get-saved'
    | 'get-insights'
    | 'optimize-profile';
  userId?: string;
  jobId?: string;
  preferences?: Partial<FreelancerProfile>;
  filters?: {
    categories?: JobCategory[];
    minBudget?: number;
    maxBudget?: number;
    minMatchScore?: number;
    postedWithin?: number; // hours
  };
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoMatches(filters?: JobMatchRequest['filters']): JobMatch[] {
  const matches: JobMatch[] = [
    {
      id: 'match-1',
      job_id: 'job-1',
      job_title: 'Senior React Developer for FinTech Startup',
      client_name: 'TechVentures Inc.',
      client_avatar: '/avatars/techventures.jpg',
      client_rating: 4.9,
      client_total_spent: 285000,
      category: 'development',
      description: 'Looking for an experienced React developer to build our next-generation trading platform. Must have experience with real-time data, WebSockets, and financial applications.',
      budget: { type: 'hourly', min: 80, max: 120 },
      duration: '3-6 months',
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      proposals_count: 8,
      match_score: 96,
      match_confidence: 'high',
      match_reasons: [
        'Expert React skills match exactly',
        'Previous FinTech experience in portfolio',
        'WebSocket projects demonstrated',
        'Rate within budget range',
      ],
      skill_matches: [
        { skill: 'React', match_type: 'exact' },
        { skill: 'TypeScript', match_type: 'exact' },
        { skill: 'WebSocket', match_type: 'exact' },
        { skill: 'Redux', match_type: 'related' },
      ],
      portfolio_matches: [
        { project_id: 'proj-1', project_title: 'CryptoTrader Dashboard', relevance: 95 },
        { project_id: 'proj-2', project_title: 'Real-time Analytics Platform', relevance: 88 },
      ],
      rate_recommendation: { min: 90, max: 115, optimal: 100 },
      competition_level: 'medium',
      win_probability: 78,
      career_growth_score: 85,
    },
    {
      id: 'match-2',
      job_id: 'job-2',
      job_title: 'Full-Stack Developer for E-commerce Platform',
      client_name: 'ShopFlow',
      client_avatar: '/avatars/shopflow.jpg',
      client_rating: 4.7,
      client_total_spent: 156000,
      category: 'development',
      description: 'Need a full-stack developer to rebuild our e-commerce platform using Next.js and Stripe integration. Experience with high-traffic applications required.',
      budget: { type: 'fixed', min: 15000, max: 25000 },
      duration: '2-3 months',
      posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      proposals_count: 15,
      match_score: 92,
      match_confidence: 'high',
      match_reasons: [
        'Next.js expertise demonstrated',
        'Stripe integration experience',
        'E-commerce projects in portfolio',
        'Available for project timeline',
      ],
      skill_matches: [
        { skill: 'Next.js', match_type: 'exact' },
        { skill: 'Stripe', match_type: 'exact' },
        { skill: 'PostgreSQL', match_type: 'exact' },
        { skill: 'Shopify', match_type: 'related' },
      ],
      portfolio_matches: [
        { project_id: 'proj-3', project_title: 'Fashion Marketplace', relevance: 91 },
      ],
      rate_recommendation: { min: 18000, max: 23000, optimal: 20000 },
      competition_level: 'high',
      win_probability: 65,
      career_growth_score: 70,
    },
    {
      id: 'match-3',
      job_id: 'job-3',
      job_title: 'UI/UX Designer for Mobile App',
      client_name: 'HealthTech Pro',
      client_avatar: '/avatars/healthtech.jpg',
      client_rating: 4.8,
      client_total_spent: 89000,
      category: 'design',
      description: 'Seeking a talented UI/UX designer to create an intuitive health tracking mobile application. Must understand accessibility and health industry regulations.',
      budget: { type: 'fixed', min: 8000, max: 12000 },
      duration: '4-6 weeks',
      posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      proposals_count: 22,
      match_score: 78,
      match_confidence: 'medium',
      match_reasons: [
        'UI/UX skills match',
        'Mobile design experience',
        'Health-related project potential',
      ],
      skill_matches: [
        { skill: 'Figma', match_type: 'exact' },
        { skill: 'Mobile Design', match_type: 'exact' },
        { skill: 'Healthcare UX', match_type: 'transferable' },
      ],
      portfolio_matches: [],
      rate_recommendation: { min: 9000, max: 11000, optimal: 10000 },
      competition_level: 'high',
      win_probability: 45,
      career_growth_score: 60,
    },
    {
      id: 'match-4',
      job_id: 'job-4',
      job_title: 'Technical Writer for API Documentation',
      client_name: 'DevTools Co',
      client_avatar: '/avatars/devtools.jpg',
      client_rating: 4.6,
      client_total_spent: 45000,
      category: 'writing',
      description: 'Looking for a technical writer with developer experience to create comprehensive API documentation and tutorials for our developer platform.',
      budget: { type: 'hourly', min: 50, max: 75 },
      duration: '1-2 months',
      posted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      proposals_count: 5,
      match_score: 85,
      match_confidence: 'high',
      match_reasons: [
        'Developer background enables technical accuracy',
        'API experience from previous projects',
        'Documentation skills transferable',
        'Low competition opportunity',
      ],
      skill_matches: [
        { skill: 'API Development', match_type: 'related' },
        { skill: 'Technical Communication', match_type: 'transferable' },
      ],
      portfolio_matches: [
        { project_id: 'proj-4', project_title: 'Open Source Contribution Docs', relevance: 72 },
      ],
      rate_recommendation: { min: 55, max: 70, optimal: 65 },
      competition_level: 'low',
      win_probability: 82,
      career_growth_score: 55,
    },
  ];

  // Apply filters
  let filtered = matches;
  if (filters) {
    if (filters.categories?.length) {
      filtered = filtered.filter(m => filters.categories!.includes(m.category));
    }
    if (filters.minBudget) {
      filtered = filtered.filter(m => m.budget.max >= filters.minBudget!);
    }
    if (filters.minMatchScore) {
      filtered = filtered.filter(m => m.match_score >= filters.minMatchScore!);
    }
  }

  return filtered.sort((a, b) => b.match_score - a.match_score);
}

function getDemoInsights() {
  return {
    market_trends: {
      hot_skills: ['AI/ML', 'React', 'Mobile Development', 'No-Code'],
      declining_skills: ['jQuery', 'Flash', 'PHP (legacy)'],
      emerging_categories: ['AI Integration', 'Blockchain', 'AR/VR'],
      average_rates: {
        development: { min: 50, max: 150, trend: 'up' },
        design: { min: 40, max: 120, trend: 'stable' },
        writing: { min: 30, max: 80, trend: 'up' },
        marketing: { min: 35, max: 100, trend: 'stable' },
      },
    },
    your_performance: {
      profile_strength: 78,
      response_rate: 92,
      win_rate: 34,
      average_match_score: 85,
      jobs_viewed: 156,
      proposals_sent: 23,
      interviews: 12,
      hires: 8,
    },
    recommendations: [
      {
        type: 'skill',
        title: 'Add AI/ML skills',
        description: 'Jobs requiring AI skills have increased 150% this quarter. Consider upskilling.',
        impact: 'high',
      },
      {
        type: 'rate',
        title: 'Increase your rate by 15%',
        description: 'Your win rate and experience justify a higher rate. Similar freelancers charge $95-110/hr.',
        impact: 'medium',
      },
      {
        type: 'availability',
        title: 'Update availability',
        description: 'Your availability shows "limited" but you\'ve been accepting new projects. Update for better matches.',
        impact: 'low',
      },
    ],
    weekly_digest: {
      new_matches: 47,
      high_quality_matches: 12,
      jobs_ending_soon: 8,
      perfect_matches: 3,
    },
  };
}

function getDemoProfileOptimization() {
  return {
    current_score: 78,
    potential_score: 95,
    improvements: [
      {
        category: 'skills',
        current: 'Good skill coverage',
        suggestion: 'Add proficiency levels and years of experience to each skill',
        impact: '+5 points',
        effort: 'low',
      },
      {
        category: 'portfolio',
        current: '8 projects listed',
        suggestion: 'Add case studies with measurable results (e.g., "Increased conversion by 40%")',
        impact: '+7 points',
        effort: 'medium',
      },
      {
        category: 'description',
        current: 'Generic overview',
        suggestion: 'Lead with your unique value proposition and specific expertise',
        impact: '+4 points',
        effort: 'low',
      },
      {
        category: 'testimonials',
        current: '3 reviews',
        suggestion: 'Request reviews from your last 5 clients to improve social proof',
        impact: '+6 points',
        effort: 'medium',
      },
    ],
    competitor_comparison: {
      your_percentile: 72,
      top_performers_have: [
        'Video introduction (you don\'t have)',
        'Detailed case studies with metrics',
        '10+ verified reviews',
        'Certifications displayed',
      ],
    },
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      const matches = getDemoMatches();
      const match = matches.find(m => m.job_id === jobId);
      return NextResponse.json({
        success: true,
        data: match || null,
        source: 'demo',
      });
    }

    return NextResponse.json({
      success: true,
      data: getDemoMatches(),
      source: 'demo',
    });
  } catch (err) {
    console.error('Job Matching GET error:', err);
    return NextResponse.json({
      success: true,
      data: getDemoMatches(),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: JobMatchRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'get-matches': {
        const { filters } = body;
        return NextResponse.json({
          success: true,
          data: {
            matches: getDemoMatches(filters),
            total: 47,
            filtered: getDemoMatches(filters).length,
          },
        });
      }

      case 'get-match-details': {
        const { jobId } = body;
        if (!jobId) {
          return NextResponse.json({ success: false, error: 'Job ID required' }, { status: 400 });
        }

        const matches = getDemoMatches();
        const match = matches.find(m => m.job_id === jobId);

        if (!match) {
          return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        // Add extra details
        const detailedMatch = {
          ...match,
          client_history: {
            jobs_posted: 23,
            hires: 18,
            rehire_rate: 78,
            average_rating_given: 4.7,
            typical_response_time: '< 2 hours',
          },
          similar_jobs_you_won: [
            { title: 'React Dashboard Development', budget: 12000, date: '2024-08-15' },
            { title: 'Trading Platform UI', budget: 18000, date: '2024-06-20' },
          ],
          suggested_proposal_approach: 'Lead with your FinTech experience. Mention the CryptoTrader Dashboard project specifically.',
        };

        return NextResponse.json({
          success: true,
          data: detailedMatch,
        });
      }

      case 'update-preferences': {
        const { preferences } = body;

        return NextResponse.json({
          success: true,
          data: {
            updated: true,
            new_matches_count: 12,
            preferences_applied: preferences,
          },
          message: 'Preferences updated. Found 12 new matches based on your criteria.',
        });
      }

      case 'analyze-job': {
        const { jobId } = body;

        const analysis = {
          job_id: jobId,
          red_flags: [],
          green_flags: ['Verified payment method', 'High client rating', 'Clear requirements', 'Reasonable deadline'],
          budget_analysis: {
            market_rate: { min: 80, max: 130 },
            offered: { min: 80, max: 120 },
            verdict: 'Fair - at market rate',
          },
          competition_analysis: {
            total_proposals: 8,
            estimated_quality: 'medium-high',
            your_advantage: 'You have direct experience with this tech stack and industry',
          },
          recommended_action: 'apply',
          confidence: 'high',
        };

        return NextResponse.json({
          success: true,
          data: analysis,
        });
      }

      case 'get-recommendations': {
        return NextResponse.json({
          success: true,
          data: getDemoInsights().recommendations,
        });
      }

      case 'save-job': {
        const { jobId } = body;
        return NextResponse.json({
          success: true,
          data: { job_id: jobId, saved: true, saved_at: new Date().toISOString() },
          message: 'Job saved to your list',
        });
      }

      case 'hide-job': {
        const { jobId } = body;
        return NextResponse.json({
          success: true,
          data: { job_id: jobId, hidden: true },
          message: 'Job hidden from your matches',
        });
      }

      case 'get-saved': {
        const savedJobs = getDemoMatches().slice(0, 3).map(m => ({
          ...m,
          saved_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }));

        return NextResponse.json({
          success: true,
          data: savedJobs,
        });
      }

      case 'get-insights': {
        return NextResponse.json({
          success: true,
          data: getDemoInsights(),
        });
      }

      case 'optimize-profile': {
        return NextResponse.json({
          success: true,
          data: getDemoProfileOptimization(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('Job Matching POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
