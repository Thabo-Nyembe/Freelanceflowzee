/**
 * AI Job Matching Library - FreeFlow A+++ Implementation
 * Beats Upwork's matching with:
 * - OpenAI embeddings for semantic similarity
 * - Weighted skill matching with importance
 * - Experience level scoring
 * - Availability consideration
 * - Career growth recommendations
 * - Rate optimization suggestions
 */

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
};

// ============================================================================
// TYPES
// ============================================================================

export interface MatchScore {
  job_id: string;
  freelancer_id: string;
  total_score: number;
  similarity_score: number;
  skill_score: number;
  experience_score: number;
  availability_score: number;
  match_reasons: string[];
  skills_matched: string[];
  skills_missing: string[];
  rate_recommendation: RateRecommendation;
  competition_level: 'low' | 'medium' | 'high';
  win_probability: number;
  career_growth_score: number;
}

export interface RateRecommendation {
  min: number;
  max: number;
  optimal: number;
  market_rate: { min: number; max: number };
  reasoning: string;
}

export interface FreelancerProfile {
  user_id: string;
  display_name: string;
  bio: string;
  skills: string[];
  experience_years: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  available_hours_per_week: number;
  rating: number;
  orders_completed: number;
  level: string;
  embedding?: number[];
}

export interface JobPosting {
  id: string;
  client_id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  budget_type: string;
  budget_min: number;
  budget_max: number;
  estimated_hours: number;
  duration: string;
  embedding?: number[];
}

export interface SkillMatch {
  score: number;
  matched: string[];
  missing: string[];
  partial: string[];
}

// ============================================================================
// EMBEDDING FUNCTIONS
// ============================================================================

/**
 * Create embedding for text using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit to avoid token issues
  });

  return response.data[0].embedding;
}

/**
 * Create profile embedding from freelancer data
 */
export async function createProfileEmbedding(profile: FreelancerProfile): Promise<number[]> {
  const text = `
    Freelancer Profile:
    Name: ${profile.display_name}
    Skills: ${profile.skills.join(', ')}
    Bio: ${profile.bio || 'No bio provided'}
    Experience: ${profile.experience_years} years
    Level: ${profile.level}
    Completed orders: ${profile.orders_completed}
    Rating: ${profile.rating}/5
    Hourly rate: $${profile.hourly_rate_min}-${profile.hourly_rate_max}
    Available hours per week: ${profile.available_hours_per_week}
  `;

  return createEmbedding(text);
}

/**
 * Create job embedding from job posting data
 */
export async function createJobEmbedding(job: JobPosting): Promise<number[]> {
  const text = `
    Job Posting:
    Title: ${job.title}
    Description: ${job.description}
    Required skills: ${job.required_skills.join(', ')}
    Preferred skills: ${job.preferred_skills.join(', ')}
    Experience level: ${job.experience_level}
    Budget: $${job.budget_min}-${job.budget_max} (${job.budget_type})
    Duration: ${job.duration}
    Estimated hours: ${job.estimated_hours || 'Not specified'}
  `;

  return createEmbedding(text);
}

// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// SKILL MATCHING
// ============================================================================

/**
 * Calculate weighted skill match between freelancer and job
 */
export function calculateSkillMatch(
  freelancerSkills: string[],
  requiredSkills: { skill_name: string; importance: number }[],
  preferredSkills: string[] = []
): SkillMatch {
  const normalizedFreelancerSkills = new Set(
    freelancerSkills.map(s => s.toLowerCase().trim())
  );

  const matched: string[] = [];
  const missing: string[] = [];
  const partial: string[] = [];

  let weightedScore = 0;
  let totalWeight = 0;

  // Check required skills with importance weighting
  for (const required of requiredSkills) {
    const skillLower = required.skill_name.toLowerCase().trim();
    const importance = required.importance || 3;
    totalWeight += importance;

    if (normalizedFreelancerSkills.has(skillLower)) {
      matched.push(required.skill_name);
      weightedScore += importance;
    } else {
      // Check for partial matches (e.g., "React" matches "React.js")
      const partialMatch = Array.from(normalizedFreelancerSkills).find(
        skill =>
          skill.includes(skillLower) ||
          skillLower.includes(skill) ||
          levenshteinDistance(skill, skillLower) <= 2
      );

      if (partialMatch) {
        partial.push(required.skill_name);
        weightedScore += importance * 0.5; // 50% credit for partial match
      } else {
        missing.push(required.skill_name);
      }
    }
  }

  // Bonus for preferred skills
  const preferredMatched = preferredSkills.filter(skill =>
    normalizedFreelancerSkills.has(skill.toLowerCase().trim())
  );

  // Add small bonus for each preferred skill (max 10% boost)
  const preferredBonus = Math.min(0.1, preferredMatched.length * 0.02);

  const baseScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
  const finalScore = Math.min(1, baseScore + preferredBonus);

  return {
    score: finalScore,
    matched: [...matched, ...preferredMatched.filter(s => !matched.includes(s))],
    missing,
    partial,
  };
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// ============================================================================
// EXPERIENCE MATCHING
// ============================================================================

/**
 * Calculate experience level match score
 */
export function calculateExperienceMatch(
  freelancerYears: number,
  requiredLevel: string
): number {
  const levelRequirements: Record<string, number> = {
    entry: 0,
    intermediate: 2,
    expert: 5,
  };

  const required = levelRequirements[requiredLevel] || 0;

  if (freelancerYears >= required) {
    // Bonus for overqualification (max 10% bonus)
    const bonus = Math.min(0.1, (freelancerYears - required) * 0.02);
    return 1 + bonus;
  }

  return freelancerYears / Math.max(required, 1);
}

// ============================================================================
// MAIN MATCHING FUNCTIONS
// ============================================================================

/**
 * Match a freelancer to multiple jobs
 */
export async function matchFreelancerToJobs(
  userId: string,
  options: {
    limit?: number;
    minScore?: number;
    categories?: string[];
    budgetMin?: number;
    budgetMax?: number;
  } = {}
): Promise<MatchScore[]> {
  const supabase = await createClient();

  const { limit = 20, minScore = 50 } = options;

  // Get freelancer profile
  const { data: profile, error: profileError } = await supabase
    .from('seller_profiles')
    .select(`
      *,
      user:users!user_id (id, name, email)
    `)
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('Freelancer profile not found');
  }

  // Get freelancer skills
  const { data: skills } = await supabase
    .from('freelancer_skills')
    .select('skill_name, proficiency, years_experience')
    .eq('user_id', userId);

  const freelancerSkills = skills?.map(s => s.skill_name) || profile.skills || [];

  // Get or create profile embedding
  let profileEmbedding = profile.embedding;
  if (!profileEmbedding) {
    try {
      profileEmbedding = await createProfileEmbedding({
        user_id: userId,
        display_name: profile.display_name,
        bio: profile.bio || '',
        skills: freelancerSkills,
        experience_years: profile.experience_years || 0,
        hourly_rate_min: profile.hourly_rate_min || 0,
        hourly_rate_max: profile.hourly_rate_max || 0,
        available_hours_per_week: profile.available_hours_per_week || 40,
        rating: profile.rating || 0,
        orders_completed: profile.orders_completed || 0,
        level: profile.level || 'new',
      });

      // Store embedding
      await supabase
        .from('seller_profiles')
        .update({ embedding: profileEmbedding })
        .eq('user_id', userId);
    } catch (error) {
      console.warn('Could not create profile embedding:', error);
    }
  }

  // Build job query
  let query = supabase
    .from('freelancer_jobs')
    .select(`
      *,
      client:client_profiles!client_id (
        company_name, rating, total_spent, payment_verified
      ),
      required_skills_details:job_required_skills (skill_name, importance)
    `)
    .eq('status', 'open')
    .gte('deadline', new Date().toISOString())
    .order('posted_at', { ascending: false });

  if (options.categories?.length) {
    query = query.in('category_id', options.categories);
  }

  if (options.budgetMin) {
    query = query.gte('budget_max', options.budgetMin);
  }

  if (options.budgetMax) {
    query = query.lte('budget_min', options.budgetMax);
  }

  const { data: jobs, error: jobsError } = await query.limit(100);

  if (jobsError || !jobs?.length) {
    return [];
  }

  // Score each job
  const scoredJobs = await Promise.all(
    jobs.map(async (job) => {
      // Get or create job embedding
      let jobEmbedding = job.embedding;
      if (!jobEmbedding) {
        try {
          jobEmbedding = await createJobEmbedding({
            id: job.id,
            client_id: job.client_id,
            title: job.title,
            description: job.description,
            required_skills: job.required_skills || [],
            preferred_skills: job.preferred_skills || [],
            experience_level: job.experience_level,
            budget_type: job.budget_type,
            budget_min: job.budget_min || 0,
            budget_max: job.budget_max || 0,
            estimated_hours: job.estimated_hours || 0,
            duration: job.duration || '',
          });

          // Store embedding (fire and forget)
          supabase
            .from('freelancer_jobs')
            .update({ embedding: jobEmbedding })
            .eq('id', job.id)
            .then(() => {});
        } catch (error) {
          console.warn('Could not create job embedding:', error);
        }
      }

      // Calculate similarity score
      let similarityScore = 0;
      if (profileEmbedding && jobEmbedding) {
        similarityScore = cosineSimilarity(profileEmbedding as number[], jobEmbedding as number[]);
      }

      // Calculate skill match
      const requiredSkillsWithImportance = job.required_skills_details?.map((s: { skill_name: string; importance?: number }) => ({
        skill_name: s.skill_name,
        importance: s.importance || 3,
      })) || job.required_skills?.map((s: string) => ({ skill_name: s, importance: 3 })) || [];

      const skillMatch = calculateSkillMatch(
        freelancerSkills,
        requiredSkillsWithImportance,
        job.preferred_skills || []
      );

      // Calculate experience match
      const experienceScore = calculateExperienceMatch(
        profile.experience_years || 0,
        job.experience_level
      );

      // Calculate availability match
      const estimatedWeeklyHours = job.estimated_hours
        ? job.estimated_hours / 4 // Assume 4-week project
        : 20;
      const availabilityScore = Math.min(
        1,
        (profile.available_hours_per_week || 40) / estimatedWeeklyHours
      );

      // Calculate weighted final score
      const totalScore = Math.round(
        (similarityScore * 0.30 +
          skillMatch.score * 0.35 +
          Math.min(1, experienceScore) * 0.20 +
          availabilityScore * 0.15) *
          100
      );

      // Generate match reasons
      const matchReasons = generateMatchReasons(
        similarityScore,
        skillMatch,
        experienceScore,
        availabilityScore,
        job
      );

      // Calculate rate recommendation
      const rateRecommendation = calculateRateRecommendation(
        profile,
        job,
        skillMatch.score
      );

      // Calculate competition level
      const competitionLevel = calculateCompetitionLevel(job.proposals_count || 0);

      // Calculate win probability
      const winProbability = calculateWinProbability(
        totalScore,
        competitionLevel,
        profile.rating || 0,
        profile.orders_completed || 0
      );

      // Calculate career growth score
      const careerGrowthScore = calculateCareerGrowth(profile, job, skillMatch.missing);

      return {
        job_id: job.id,
        freelancer_id: userId,
        total_score: totalScore,
        similarity_score: Math.round(similarityScore * 100),
        skill_score: Math.round(skillMatch.score * 100),
        experience_score: Math.round(Math.min(1, experienceScore) * 100),
        availability_score: Math.round(availabilityScore * 100),
        match_reasons: matchReasons,
        skills_matched: skillMatch.matched,
        skills_missing: skillMatch.missing,
        rate_recommendation: rateRecommendation,
        competition_level: competitionLevel,
        win_probability: winProbability,
        career_growth_score: careerGrowthScore,
        // Include job data for display
        job: {
          id: job.id,
          title: job.title,
          description: job.description?.slice(0, 200) + '...',
          budget: { type: job.budget_type, min: job.budget_min, max: job.budget_max },
          duration: job.duration,
          posted_at: job.posted_at,
          proposals_count: job.proposals_count,
          client: job.client,
        },
      };
    })
  );

  // Filter by minimum score and sort
  return scoredJobs
    .filter(job => job.total_score >= minScore)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, limit);
}

/**
 * Match jobs to a specific freelancer (for client view)
 */
export async function matchJobToFreelancers(
  jobId: string,
  options: {
    limit?: number;
    minScore?: number;
    levels?: string[];
  } = {}
): Promise<MatchScore[]> {
  const supabase = await createClient();

  const { limit = 50, minScore = 50, levels } = options;

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('freelancer_jobs')
    .select(`
      *,
      required_skills_details:job_required_skills (skill_name, importance)
    `)
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error('Job not found');
  }

  // Get or create job embedding
  let jobEmbedding = job.embedding;
  if (!jobEmbedding) {
    try {
      jobEmbedding = await createJobEmbedding({
        id: job.id,
        client_id: job.client_id,
        title: job.title,
        description: job.description,
        required_skills: job.required_skills || [],
        preferred_skills: job.preferred_skills || [],
        experience_level: job.experience_level,
        budget_type: job.budget_type,
        budget_min: job.budget_min || 0,
        budget_max: job.budget_max || 0,
        estimated_hours: job.estimated_hours || 0,
        duration: job.duration || '',
      });

      await supabase
        .from('freelancer_jobs')
        .update({ embedding: jobEmbedding })
        .eq('id', jobId);
    } catch (error) {
      console.warn('Could not create job embedding:', error);
    }
  }

  // Build freelancer query
  let query = supabase
    .from('seller_profiles')
    .select(`
      *,
      user:users!user_id (id, name, email, avatar_url),
      skills_details:freelancer_skills (skill_name, proficiency, years_experience)
    `)
    .eq('status', 'active')
    .eq('vacation_mode', false);

  if (levels?.length) {
    query = query.in('level', levels);
  }

  const { data: freelancers, error: freelancersError } = await query.limit(200);

  if (freelancersError || !freelancers?.length) {
    return [];
  }

  // Score each freelancer
  const scoredFreelancers = await Promise.all(
    freelancers.map(async (profile) => {
      const freelancerSkills =
        profile.skills_details?.map((s: { skill_name: string }) => s.skill_name) || profile.skills || [];

      // Get or create profile embedding
      let profileEmbedding = profile.embedding;
      if (!profileEmbedding) {
        try {
          profileEmbedding = await createProfileEmbedding({
            user_id: profile.user_id,
            display_name: profile.display_name,
            bio: profile.bio || '',
            skills: freelancerSkills,
            experience_years: profile.experience_years || 0,
            hourly_rate_min: profile.hourly_rate_min || 0,
            hourly_rate_max: profile.hourly_rate_max || 0,
            available_hours_per_week: profile.available_hours_per_week || 40,
            rating: profile.rating || 0,
            orders_completed: profile.orders_completed || 0,
            level: profile.level || 'new',
          });

          // Store (fire and forget)
          supabase
            .from('seller_profiles')
            .update({ embedding: profileEmbedding })
            .eq('user_id', profile.user_id)
            .then(() => {});
        } catch (error) {
          console.warn('Could not create profile embedding:', error);
        }
      }

      // Calculate scores
      let similarityScore = 0;
      if (profileEmbedding && jobEmbedding) {
        similarityScore = cosineSimilarity(profileEmbedding as number[], jobEmbedding as number[]);
      }

      const requiredSkillsWithImportance = job.required_skills_details?.map((s: { skill_name: string; importance?: number }) => ({
        skill_name: s.skill_name,
        importance: s.importance || 3,
      })) || job.required_skills?.map((s: string) => ({ skill_name: s, importance: 3 })) || [];

      const skillMatch = calculateSkillMatch(
        freelancerSkills,
        requiredSkillsWithImportance,
        job.preferred_skills || []
      );

      const experienceScore = calculateExperienceMatch(
        profile.experience_years || 0,
        job.experience_level
      );

      const estimatedWeeklyHours = job.estimated_hours
        ? job.estimated_hours / 4
        : 20;
      const availabilityScore = Math.min(
        1,
        (profile.available_hours_per_week || 40) / estimatedWeeklyHours
      );

      const totalScore = Math.round(
        (similarityScore * 0.30 +
          skillMatch.score * 0.35 +
          Math.min(1, experienceScore) * 0.20 +
          availabilityScore * 0.15) *
          100
      );

      return {
        job_id: jobId,
        freelancer_id: profile.user_id,
        total_score: totalScore,
        similarity_score: Math.round(similarityScore * 100),
        skill_score: Math.round(skillMatch.score * 100),
        experience_score: Math.round(Math.min(1, experienceScore) * 100),
        availability_score: Math.round(availabilityScore * 100),
        match_reasons: generateMatchReasonsForClient(similarityScore, skillMatch, profile),
        skills_matched: skillMatch.matched,
        skills_missing: skillMatch.missing,
        rate_recommendation: {
          min: profile.hourly_rate_min || 0,
          max: profile.hourly_rate_max || 0,
          optimal: (profile.hourly_rate_min + profile.hourly_rate_max) / 2 || 0,
          market_rate: { min: 0, max: 0 },
          reasoning: '',
        },
        competition_level: 'medium' as const,
        win_probability: 0,
        career_growth_score: 0,
        // Include freelancer data
        freelancer: {
          id: profile.user_id,
          display_name: profile.display_name,
          tagline: profile.tagline,
          profile_image: profile.profile_image,
          level: profile.level,
          rating: profile.rating,
          reviews_count: profile.reviews_count,
          orders_completed: profile.orders_completed,
          hourly_rate: { min: profile.hourly_rate_min, max: profile.hourly_rate_max },
        },
      };
    })
  );

  return scoredFreelancers
    .filter(f => f.total_score >= minScore)
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateMatchReasons(
  similarity: number,
  skillMatch: SkillMatch,
  experience: number,
  availability: number,
  job: { title?: string; duration?: string; budget_max?: number }
): string[] {
  const reasons: string[] = [];

  if (similarity > 0.85) {
    reasons.push('Your profile is an excellent match for this job');
  } else if (similarity > 0.7) {
    reasons.push('Strong profile relevance to job requirements');
  } else if (similarity > 0.5) {
    reasons.push('Good profile match for this type of work');
  }

  if (skillMatch.score >= 0.95) {
    reasons.push(`Perfect skill match - you have all ${skillMatch.matched.length} required skills`);
  } else if (skillMatch.score >= 0.8) {
    reasons.push(`Strong skill coverage (${Math.round(skillMatch.score * 100)}% match)`);
  } else if (skillMatch.score >= 0.6) {
    reasons.push(`Good skill overlap with ${skillMatch.matched.length} matching skills`);
  }

  if (experience >= 1) {
    reasons.push('Your experience level meets or exceeds requirements');
  }

  if (availability >= 1) {
    reasons.push('Your availability matches the project timeline');
  }

  if (skillMatch.partial.length > 0) {
    reasons.push(`Related skills: ${skillMatch.partial.join(', ')}`);
  }

  return reasons;
}

function generateMatchReasonsForClient(
  similarity: number,
  skillMatch: SkillMatch,
  profile: { level?: string; rating?: number; orders_completed?: number }
): string[] {
  const reasons: string[] = [];

  if (similarity > 0.8) {
    reasons.push('Highly relevant experience and expertise');
  }

  if (skillMatch.score >= 0.9) {
    reasons.push(`Has all required skills`);
  } else if (skillMatch.matched.length > 0) {
    reasons.push(`Strong in: ${skillMatch.matched.slice(0, 3).join(', ')}`);
  }

  if (profile.level === 'top_rated' || profile.level === 'pro') {
    reasons.push('Top performer on the platform');
  }

  if ((profile.rating || 0) >= 4.8) {
    reasons.push(`Excellent rating (${profile.rating}/5)`);
  }

  if ((profile.orders_completed || 0) >= 50) {
    reasons.push(`${profile.orders_completed}+ successful projects`);
  }

  return reasons;
}

function calculateRateRecommendation(
  profile: { hourly_rate_min?: number; hourly_rate_max?: number; rating?: number; level?: string },
  job: { budget_min?: number; budget_max?: number; budget_type?: string },
  skillMatchScore: number
): RateRecommendation {
  const marketMin = job.budget_min || 0;
  const marketMax = job.budget_max || marketMin * 1.5;

  let multiplier = 1;

  // Adjust based on skill match
  if (skillMatchScore >= 0.95) multiplier += 0.1;
  else if (skillMatchScore < 0.7) multiplier -= 0.1;

  // Adjust based on level
  if (profile.level === 'top_rated') multiplier += 0.15;
  else if (profile.level === 'pro') multiplier += 0.2;

  // Adjust based on rating
  if ((profile.rating || 0) >= 4.9) multiplier += 0.1;

  const optimalRate = Math.round(((marketMin + marketMax) / 2) * multiplier);

  return {
    min: Math.round(marketMin * 0.9),
    max: Math.round(marketMax * multiplier),
    optimal: Math.max(optimalRate, profile.hourly_rate_min || 0),
    market_rate: { min: marketMin, max: marketMax },
    reasoning:
      skillMatchScore >= 0.9
        ? 'Your strong skill match justifies premium pricing'
        : skillMatchScore >= 0.7
        ? 'Competitive rate within market range'
        : 'Consider competitive pricing to strengthen your proposal',
  };
}

function calculateCompetitionLevel(
  proposalsCount: number
): 'low' | 'medium' | 'high' {
  if (proposalsCount < 5) return 'low';
  if (proposalsCount < 15) return 'medium';
  return 'high';
}

function calculateWinProbability(
  matchScore: number,
  competition: 'low' | 'medium' | 'high',
  rating: number,
  ordersCompleted: number
): number {
  let baseProb = matchScore * 0.6;

  // Competition adjustment
  const compMultiplier = {
    low: 1.3,
    medium: 1.0,
    high: 0.7,
  };
  baseProb *= compMultiplier[competition];

  // Rating boost
  if (rating >= 4.9) baseProb *= 1.15;
  else if (rating >= 4.5) baseProb *= 1.08;

  // Experience boost
  if (ordersCompleted >= 100) baseProb *= 1.1;
  else if (ordersCompleted >= 50) baseProb *= 1.05;

  return Math.round(Math.min(95, Math.max(5, baseProb)));
}

function calculateCareerGrowth(
  profile: { skills?: string[]; level?: string },
  job: { required_skills?: string[]; preferred_skills?: string[] },
  missingSkills: string[]
): number {
  let score = 50; // Base score

  // Learning opportunity from missing skills
  if (missingSkills.length > 0 && missingSkills.length <= 2) {
    score += 20; // Good learning opportunity
  }

  // Portfolio building potential
  if (job.preferred_skills?.some(s => !profile.skills?.includes(s))) {
    score += 15;
  }

  // Level progression potential
  if (profile.level === 'new' || profile.level === 'level_1') {
    score += 15; // More room to grow
  }

  return Math.min(100, score);
}

// ============================================================================
// MARKET INSIGHTS
// ============================================================================

export interface MarketInsights {
  hot_skills: string[];
  declining_skills: string[];
  average_rates: Record<string, { min: number; max: number; trend: string }>;
  demand_by_category: Record<string, number>;
  supply_by_category: Record<string, number>;
}

export async function getMarketInsights(): Promise<MarketInsights> {
  const supabase = await createClient();

  // Get recent jobs for skill analysis
  const { data: recentJobs } = await supabase
    .from('freelancer_jobs')
    .select('required_skills, budget_min, budget_max, category_id')
    .eq('status', 'open')
    .gte('posted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(500);

  // Analyze skills demand
  const skillCounts: Record<string, number> = {};
  recentJobs?.forEach(job => {
    job.required_skills?.forEach((skill: string) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  const sortedSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a);

  const hotSkills = sortedSkills.slice(0, 10).map(([skill]) => skill);

  // Category analysis
  const demandByCategory: Record<string, number> = {};
  recentJobs?.forEach(job => {
    if (job.category_id) {
      demandByCategory[job.category_id] = (demandByCategory[job.category_id] || 0) + 1;
    }
  });

  return {
    hot_skills: hotSkills,
    declining_skills: ['Flash', 'jQuery (legacy)', 'Objective-C'],
    average_rates: {
      development: { min: 50, max: 150, trend: 'up' },
      design: { min: 40, max: 120, trend: 'stable' },
      writing: { min: 30, max: 80, trend: 'up' },
      marketing: { min: 35, max: 100, trend: 'stable' },
    },
    demand_by_category: demandByCategory,
    supply_by_category: {}, // Would need to aggregate freelancer categories
  };
}

// ============================================================================
// PROFILE OPTIMIZATION
// ============================================================================

export interface ProfileOptimization {
  current_score: number;
  potential_score: number;
  improvements: {
    category: string;
    current: string;
    suggestion: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
}

export async function getProfileOptimization(
  userId: string
): Promise<ProfileOptimization> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select(`
      *,
      skills_details:freelancer_skills (skill_name, proficiency),
      portfolio:freelancer_portfolio (id, title, metrics)
    `)
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  let currentScore = 50; // Base score
  const improvements: ProfileOptimization['improvements'] = [];

  // Check bio
  if (!profile.bio || profile.bio.length < 100) {
    improvements.push({
      category: 'Bio',
      current: profile.bio ? 'Short bio' : 'No bio',
      suggestion: 'Write a detailed bio highlighting your unique value proposition',
      impact: '+10 points',
      effort: 'low',
    });
  } else {
    currentScore += 10;
  }

  // Check skills
  const skillCount = profile.skills_details?.length || profile.skills?.length || 0;
  if (skillCount < 5) {
    improvements.push({
      category: 'Skills',
      current: `${skillCount} skills listed`,
      suggestion: 'Add more skills with proficiency levels',
      impact: '+5 points',
      effort: 'low',
    });
  } else {
    currentScore += 5;
  }

  // Check portfolio
  const portfolioCount = profile.portfolio?.length || 0;
  if (portfolioCount < 5) {
    improvements.push({
      category: 'Portfolio',
      current: `${portfolioCount} projects`,
      suggestion: 'Add case studies with measurable results',
      impact: '+15 points',
      effort: 'medium',
    });
  } else {
    currentScore += 15;
  }

  // Check profile image
  if (!profile.profile_image) {
    improvements.push({
      category: 'Profile Image',
      current: 'No profile image',
      suggestion: 'Add a professional profile photo',
      impact: '+5 points',
      effort: 'low',
    });
  } else {
    currentScore += 5;
  }

  // Check rating
  if ((profile.rating || 0) >= 4.5) {
    currentScore += 10;
  }

  // Check orders completed
  if ((profile.orders_completed || 0) >= 10) {
    currentScore += 5;
  }

  return {
    current_score: currentScore,
    potential_score: Math.min(100, currentScore + improvements.length * 10),
    improvements,
  };
}
