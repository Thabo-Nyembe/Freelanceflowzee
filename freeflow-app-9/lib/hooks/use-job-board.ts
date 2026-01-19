'use client';

/**
 * Job Board Hooks - FreeFlow A+++ Implementation
 * Complete hooks for Upwork-style job board
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface FreelancerJob {
  id: string;
  client_id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  tags: string[];
  job_type: 'one_time' | 'ongoing' | 'full_time' | 'part_time';
  experience_level: 'entry' | 'intermediate' | 'expert';
  budget_type: 'fixed' | 'hourly' | 'negotiable';
  budget_min: number;
  budget_max: number;
  currency: string;
  estimated_hours?: number;
  duration?: string;
  deadline?: string;
  start_date?: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location_country?: string;
  location_city?: string;
  timezone_preference?: string;
  required_skills: string[];
  preferred_skills: string[];
  attachments: string[];
  questions: { question: string; required: boolean }[];
  views_count: number;
  proposals_count: number;
  status: 'draft' | 'open' | 'in_review' | 'filled' | 'cancelled' | 'closed';
  is_featured: boolean;
  posted_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: ClientProfile;
  required_skills_details?: { skill_name: string; importance: number }[];
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  jobs_posted: number;
  jobs_filled: number;
  total_spent: number;
  average_hourly_rate: number;
  rehire_rate: number;
  rating: number;
  reviews_count: number;
  payment_verified: boolean;
  country?: string;
  city?: string;
}

export interface JobProposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  seller_profile_id: string;
  cover_letter: string;
  proposed_rate: number;
  rate_type: 'fixed' | 'hourly';
  estimated_duration?: string;
  milestones: { description: string; amount: number; days: number }[];
  question_answers: Record<string, string>;
  attachments: string[];
  relevant_portfolio_items: string[];
  match_score: number;
  match_reasons: string[];
  skills_matched: string[];
  skills_missing: string[];
  status: ProposalStatus;
  interview_scheduled_at?: string;
  interview_notes?: string;
  offer_amount?: number;
  offer_message?: string;
  offer_sent_at?: string;
  offer_expires_at?: string;
  submitted_at?: string;
  viewed_at?: string;
  shortlisted_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  job?: FreelancerJob;
  freelancer?: FreelancerProfile;
}

export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'viewed'
  | 'shortlisted'
  | 'interviewing'
  | 'offer_sent'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface FreelancerProfile {
  user_id: string;
  display_name: string;
  tagline?: string;
  profile_image?: string;
  level: string;
  rating: number;
  reviews_count: number;
  orders_completed: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  skills: string[];
}

export interface JobMatch {
  job_id: string;
  freelancer_id: string;
  match_score: number;
  similarity_score: number;
  skill_match_score: number;
  experience_match_score: number;
  availability_match_score: number;
  match_reasons: string[];
  skills_matched: string[];
  skills_missing: string[];
  recommended_rate_min: number;
  recommended_rate_max: number;
  recommended_rate_optimal: number;
  competition_level: 'low' | 'medium' | 'high';
  win_probability: number;
  career_growth_score: number;
  job?: FreelancerJob;
}

export interface JobFilters {
  search?: string;
  category?: string;
  experience_level?: string;
  job_type?: string;
  budget_min?: number;
  budget_max?: number;
  location_type?: string;
  skills?: string[];
  posted_within?: number; // hours
}

// ============================================================================
// JOB SEARCH & BROWSE
// ============================================================================

export function useJobs(filters?: JobFilters) {
  const [jobs, setJobs] = useState<FreelancerJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchJobs = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (filters?.search) params.set('search', filters.search);
        if (filters?.category) params.set('category', filters.category);
        if (filters?.experience_level) params.set('experience_level', filters.experience_level);
        if (filters?.job_type) params.set('job_type', filters.job_type);
        if (filters?.budget_min) params.set('budget_min', filters.budget_min.toString());
        if (filters?.budget_max) params.set('budget_max', filters.budget_max.toString());
        if (filters?.location_type) params.set('location_type', filters.location_type);
        if (filters?.skills?.length) params.set('skills', filters.skills.join(','));
        if (filters?.posted_within) params.set('posted_within', filters.posted_within.toString());

        const response = await fetch(`/api/jobs?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setJobs(data.jobs || []);
        setPagination(data.pagination || pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    pagination,
    refresh: fetchJobs,
    loadMore: () => fetchJobs(pagination.page + 1),
  };
}

export function useJob(jobId?: string) {
  const [job, setJob] = useState<FreelancerJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return { job, isLoading, error, refresh: fetchJob };
}

// ============================================================================
// JOB MATCHES (AI-powered)
// ============================================================================

export function useJobMatches(options?: { limit?: number; minScore?: number }) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.minScore) params.set('minScore', options.minScore.toString());

      const response = await fetch(`/api/ai/job-matching?${params}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setMatches(data.data?.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  }, [options?.limit, options?.minScore]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const refreshMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-matches' }),
      });
      const data = await response.json();
      if (data.success) {
        setMatches(data.data?.matches || []);
      }
    } catch (err) {
      console.error('Failed to refresh matches:', err);
    }
  }, []);

  return { matches, isLoading, error, refresh: fetchMatches, refreshMatches };
}

export function useJobMatchDetails(jobId?: string) {
  const [matchDetails, setMatchDetails] = useState<{
    job: FreelancerJob;
    match: JobMatch;
    client_history: Record<string, unknown>;
    similar_jobs_completed: { title: string; amount: number; date: string }[];
    proposal_tips: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-match-details', jobId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMatchDetails(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match details');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { matchDetails, isLoading, error, refresh: fetchDetails };
}

// ============================================================================
// PROPOSALS (Freelancer)
// ============================================================================

export function useMyProposals(options?: { status?: ProposalStatus }) {
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.status) params.set('status', options.status);

      const response = await fetch(`/api/jobs/proposals?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProposals(data.proposals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  }, [options?.status]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, isLoading, error, refresh: fetchProposals };
}

export function useProposalMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitProposal = useCallback(
    async (data: {
      job_id: string;
      cover_letter: string;
      proposed_rate: number;
      rate_type: 'fixed' | 'hourly';
      estimated_duration?: string;
      milestones?: { description: string; amount: number; days: number }[];
      question_answers?: Record<string, string>;
      attachments?: string[];
      relevant_portfolio_items?: string[];
    }) => {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/jobs/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result.proposal;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const updateProposal = useCallback(
    async (id: string, data: Partial<JobProposal>) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/jobs/proposals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result.proposal;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const withdrawProposal = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/proposals/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitProposal, updateProposal, withdrawProposal, isSubmitting };
}

// ============================================================================
// JOB MANAGEMENT (Client)
// ============================================================================

export function useMyJobs(options?: { status?: string }) {
  const [jobs, setJobs] = useState<FreelancerJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ role: 'client' });
      if (options?.status) params.set('status', options.status);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [options?.status]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, isLoading, error, refresh: fetchJobs };
}

export function useJobMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createJob = useCallback(
    async (data: Omit<FreelancerJob, 'id' | 'client_id' | 'created_at' | 'updated_at' | 'views_count' | 'proposals_count'>) => {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result.job;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const updateJob = useCallback(
    async (id: string, data: Partial<FreelancerJob>) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result.job;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const publishJob = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'open', posted_at: new Date().toISOString() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.job;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const closeJob = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.job;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createJob, updateJob, publishJob, closeJob, deleteJob, isSubmitting };
}

export function useJobProposals(jobId?: string) {
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/proposals`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProposals(data.proposals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const updateProposalStatus = useCallback(
    async (
      proposalId: string,
      action: 'shortlist' | 'reject' | 'schedule_interview' | 'send_offer'
    ) => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/proposals/${proposalId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        await fetchProposals();
        return result.proposal;
      } catch (err) {
        throw err;
      }
    },
    [jobId, fetchProposals]
  );

  return { proposals, isLoading, error, refresh: fetchProposals, updateProposalStatus };
}

// ============================================================================
// SAVED JOBS
// ============================================================================

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<{ id: string; job: FreelancerJob; created_at: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-saved' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSavedJobs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved jobs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const saveJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-job', jobId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await fetchSavedJobs();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchSavedJobs]);

  const unsaveJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await fetchSavedJobs();
      return true;
    } catch (err) {
      throw err;
    }
  }, [fetchSavedJobs]);

  return { savedJobs, isLoading, error, refresh: fetchSavedJobs, saveJob, unsaveJob };
}

// ============================================================================
// MARKET INSIGHTS
// ============================================================================

export function useMarketInsights() {
  const [insights, setInsights] = useState<{
    market_trends: {
      hot_skills: string[];
      declining_skills: string[];
      average_rates: Record<string, { min: number; max: number; trend: string }>;
    };
    your_performance: {
      profile_strength: number;
      proposals_sent: number;
      jobs_won: number;
      win_rate: number;
      rating: number;
      level: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-insights' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInsights(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, isLoading, error, refresh: fetchInsights };
}

// ============================================================================
// PROFILE OPTIMIZATION
// ============================================================================

export function useProfileOptimization() {
  const [optimization, setOptimization] = useState<{
    current_score: number;
    potential_score: number;
    improvements: {
      category: string;
      current: string;
      suggestion: string;
      impact: string;
      effort: 'low' | 'medium' | 'high';
    }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/job-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimize-profile' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOptimization(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load optimization');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptimization();
  }, [fetchOptimization]);

  return { optimization, isLoading, error, refresh: fetchOptimization };
}

// ============================================================================
// JOB INVITATIONS
// ============================================================================

export function useJobInvitations() {
  const [invitations, setInvitations] = useState<{
    id: string;
    job: FreelancerJob;
    client_id: string;
    message?: string;
    status: 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired';
    created_at: string;
    expires_at?: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs/invitations');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInvitations(data.invitations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const respondToInvitation = useCallback(
    async (id: string, accept: boolean) => {
      try {
        const response = await fetch(`/api/jobs/invitations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accept }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await fetchInvitations();
        return data;
      } catch (err) {
        throw err;
      }
    },
    [fetchInvitations]
  );

  return { invitations, isLoading, error, refresh: fetchInvitations, respondToInvitation };
}

// ============================================================================
// FREELANCER SKILLS
// ============================================================================

export function useFreelancerSkills() {
  const [skills, setSkills] = useState<{
    id: string;
    skill_name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_experience: number;
    is_primary: boolean;
    is_verified: boolean;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/freelancer/skills');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSkills(data.skills || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const addSkill = useCallback(
    async (skill: {
      skill_name: string;
      proficiency?: string;
      years_experience?: number;
      is_primary?: boolean;
    }) => {
      try {
        const response = await fetch('/api/freelancer/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skill),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await fetchSkills();
        return data.skill;
      } catch (err) {
        throw err;
      }
    },
    [fetchSkills]
  );

  const updateSkill = useCallback(
    async (id: string, updates: Partial<typeof skills[0]>) => {
      try {
        const response = await fetch(`/api/freelancer/skills/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await fetchSkills();
        return data.skill;
      } catch (err) {
        throw err;
      }
    },
    [fetchSkills]
  );

  const removeSkill = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/freelancer/skills/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        await fetchSkills();
        return true;
      } catch (err) {
        throw err;
      }
    },
    [fetchSkills]
  );

  return { skills, isLoading, error, refresh: fetchSkills, addSkill, updateSkill, removeSkill };
}
