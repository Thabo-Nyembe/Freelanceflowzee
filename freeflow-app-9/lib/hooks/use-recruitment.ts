'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface JobPosting {
  id: string
  user_id: string
  job_code: string
  title: string
  description: string | null
  department: string | null
  location: string | null
  job_type: string
  status: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  posted_date: string | null
  closing_date: string | null
  applications_count: number
  shortlisted_count: number
  interviews_count: number
  offers_count: number
  hired_count: number
  requirements: unknown[]
  benefits: unknown[]
  hiring_manager: string | null
  recruiter: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface JobApplication {
  id: string
  user_id: string
  job_id: string
  application_code: string
  candidate_name: string
  candidate_email: string | null
  candidate_phone: string | null
  status: string
  stage: string
  experience_years: number
  match_score: number
  resume_url: string | null
  cover_letter: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  applied_date: string
  screening_date: string | null
  interview_date: string | null
  offer_date: string | null
  hired_date: string | null
  notes: string | null
  interviewer_notes: unknown[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface JobPostingFilters {
  status?: string
  department?: string
  jobType?: string
  location?: string
}

export interface ApplicationFilters {
  jobId?: string
  status?: string
  stage?: string
  minMatchScore?: number
}

export interface RecruitmentStats {
  totalJobs: number
  activeJobs: number
  draftJobs: number
  closedJobs: number
  totalApplications: number
  shortlisted: number
  interviews: number
  offers: number
  hired: number
  avgTimeToHire: number
}

export function useJobPostings(initialJobs: JobPosting[] = [], filters: JobPostingFilters = {}) {
  const queryKey = ['job-postings', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('job_postings')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.jobType) {
      query = query.eq('job_type', filters.jobType)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as JobPosting[]
  }, [filters])

  const { data: jobs, isLoading, error, refetch } = useSupabaseQuery<JobPosting[]>(
    queryKey,
    queryFn,
    { initialData: initialJobs }
  )

  const stats: RecruitmentStats = useMemo(() => {
    const jobList = jobs || []

    return {
      totalJobs: jobList.length,
      activeJobs: jobList.filter(j => j.status === 'active').length,
      draftJobs: jobList.filter(j => j.status === 'draft').length,
      closedJobs: jobList.filter(j => j.status === 'closed').length,
      totalApplications: jobList.reduce((sum, j) => sum + j.applications_count, 0),
      shortlisted: jobList.reduce((sum, j) => sum + j.shortlisted_count, 0),
      interviews: jobList.reduce((sum, j) => sum + j.interviews_count, 0),
      offers: jobList.reduce((sum, j) => sum + j.offers_count, 0),
      hired: jobList.reduce((sum, j) => sum + j.hired_count, 0),
      avgTimeToHire: 0 // Would need application data to calculate
    }
  }, [jobs])

  return { jobs: jobs || [], stats, isLoading, error, refetch }
}

export function useJobApplications(initialApplications: JobApplication[] = [], filters: ApplicationFilters = {}) {
  const queryKey = ['job-applications', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('job_applications')
      .select('*')
      .order('applied_date', { ascending: false })

    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.stage) {
      query = query.eq('stage', filters.stage)
    }
    if (filters.minMatchScore) {
      query = query.gte('match_score', filters.minMatchScore)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as JobApplication[]
  }, [filters])

  const { data: applications, isLoading, error, refetch } = useSupabaseQuery<JobApplication[]>(
    queryKey,
    queryFn,
    { initialData: initialApplications }
  )

  return { applications: applications || [], isLoading, error, refetch }
}

export function useRecruitmentMutations() {
  const createJobMutation = useSupabaseMutation<Partial<JobPosting>, JobPosting>(
    async (supabase, jobData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const jobCode = `JOB-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          ...jobData,
          user_id: user.id,
          job_code: jobCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-postings']] }
  )

  const updateJobMutation = useSupabaseMutation<{ id: string; updates: Partial<JobPosting> }, JobPosting>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('job_postings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-postings']] }
  )

  const deleteJobMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('job_postings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['job-postings']] }
  )

  const createApplicationMutation = useSupabaseMutation<Partial<JobApplication>, JobApplication>(
    async (supabase, appData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const appCode = `APP-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          ...appData,
          user_id: user.id,
          application_code: appCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-applications'], ['job-postings']] }
  )

  const updateApplicationMutation = useSupabaseMutation<{ id: string; updates: Partial<JobApplication> }, JobApplication>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-applications']] }
  )

  const advanceStageMutation = useSupabaseMutation<{ id: string; newStage: string }, JobApplication>(
    async (supabase, { id, newStage }) => {
      const stageUpdates: Record<string, Partial<JobApplication>> = {
        'Screening': { screening_date: new Date().toISOString() },
        'Interview': { interview_date: new Date().toISOString() },
        'Offer': { offer_date: new Date().toISOString() },
        'Hired': { hired_date: new Date().toISOString() }
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update({
          stage: newStage,
          ...stageUpdates[newStage]
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-applications'], ['job-postings']] }
  )

  return {
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
    createApplication: createApplicationMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    advanceStage: advanceStageMutation.mutate,
    isCreatingJob: createJobMutation.isPending,
    isUpdatingJob: updateJobMutation.isPending,
    isDeletingJob: deleteJobMutation.isPending,
    isCreatingApplication: createApplicationMutation.isPending,
    isUpdatingApplication: updateApplicationMutation.isPending,
    isAdvancingStage: advanceStageMutation.isPending
  }
}

export function getJobStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'closed': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'filled': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getApplicationStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'screening': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'offer': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'hired': return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
    case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function formatSalaryRange(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return 'Not specified'
  if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  if (min) return `From ${currency} ${min.toLocaleString()}`
  if (max) return `Up to ${currency} ${max.toLocaleString()}`
  return 'Not specified'
}

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

// ============================================================================
// INTERVIEW TYPES AND HOOKS
// ============================================================================

export interface Interview {
  id: string
  user_id: string
  candidate_id: string
  candidate_name: string
  candidate_avatar?: string
  job_id: string
  job_title: string
  interview_type: string
  status: string
  scheduled_date: string
  scheduled_time: string
  duration: number
  location: string
  interviewers: { name: string; role: string; avatar?: string }[]
  meeting_link?: string
  feedback?: {
    rating: number
    strengths: string[]
    concerns: string[]
    recommendation: string
    notes: string
  }
  created_at: string
  updated_at: string
}

export interface InterviewFilters {
  status?: string
  jobId?: string
  candidateId?: string
  interviewType?: string
}

export function useInterviews(initialInterviews: Interview[] = [], filters: InterviewFilters = {}) {
  const queryKey = ['interviews', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('interviews')
      .select('*')
      .order('scheduled_date', { ascending: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId)
    }
    if (filters.candidateId) {
      query = query.eq('candidate_id', filters.candidateId)
    }
    if (filters.interviewType) {
      query = query.eq('interview_type', filters.interviewType)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as Interview[]
  }, [filters])

  const { data: interviews, isLoading, error, refetch } = useSupabaseQuery<Interview[]>(
    queryKey,
    queryFn,
    { initialData: initialInterviews }
  )

  return { interviews: interviews || [], isLoading, error, refetch }
}

// ============================================================================
// OFFER TYPES AND HOOKS
// ============================================================================

export interface JobOffer {
  id: string
  user_id: string
  candidate_id: string
  candidate_name: string
  candidate_avatar?: string
  job_id: string
  job_title: string
  status: string
  base_salary: number
  bonus?: number
  equity?: string
  currency: string
  start_date: string
  expiry_date: string
  benefits: string[]
  approvers: { name: string; status: string; date?: string }[]
  sent_date?: string
  response_date?: string
  negotiation_notes?: string
  created_at: string
  updated_at: string
}

export interface OfferFilters {
  status?: string
  jobId?: string
  candidateId?: string
}

export function useJobOffers(initialOffers: JobOffer[] = [], filters: OfferFilters = {}) {
  const queryKey = ['job-offers', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.jobId) {
      query = query.eq('job_id', filters.jobId)
    }
    if (filters.candidateId) {
      query = query.eq('candidate_id', filters.candidateId)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as JobOffer[]
  }, [filters])

  const { data: offers, isLoading, error, refetch } = useSupabaseQuery<JobOffer[]>(
    queryKey,
    queryFn,
    { initialData: initialOffers }
  )

  return { offers: offers || [], isLoading, error, refetch }
}

// ============================================================================
// TALENT POOL TYPES AND HOOKS
// ============================================================================

export interface TalentPoolCandidate {
  id: string
  user_id: string
  name: string
  email: string
  avatar?: string
  skills: string[]
  experience_years: number
  current_title: string
  current_company: string
  location: string
  source: string
  added_date: string
  last_contacted_date?: string
  notes: string
  interested_roles: string[]
  availability: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TalentPoolFilters {
  skills?: string[]
  availability?: string
  minExperience?: number
  source?: string
  search?: string
}

export function useTalentPool(initialCandidates: TalentPoolCandidate[] = [], filters: TalentPoolFilters = {}) {
  const queryKey = ['talent-pool', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('talent_pool')
      .select('*')
      .order('added_date', { ascending: false })

    if (filters.availability) {
      query = query.eq('availability', filters.availability)
    }
    if (filters.source) {
      query = query.eq('source', filters.source)
    }
    if (filters.minExperience) {
      query = query.gte('experience_years', filters.minExperience)
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,current_title.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as TalentPoolCandidate[]
  }, [filters])

  const { data: candidates, isLoading, error, refetch } = useSupabaseQuery<TalentPoolCandidate[]>(
    queryKey,
    queryFn,
    { initialData: initialCandidates }
  )

  return { candidates: candidates || [], isLoading, error, refetch }
}

// ============================================================================
// EXTENDED MUTATIONS
// ============================================================================

export function useInterviewMutations() {
  const createInterviewMutation = useSupabaseMutation<Partial<Interview>, Interview>(
    async (supabase, interviewData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          ...interviewData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['interviews'], ['job-applications']] }
  )

  const updateInterviewMutation = useSupabaseMutation<{ id: string; updates: Partial<Interview> }, Interview>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['interviews']] }
  )

  const submitFeedbackMutation = useSupabaseMutation<{ id: string; feedback: Interview['feedback'] }, Interview>(
    async (supabase, { id, feedback }) => {
      const { data, error } = await supabase
        .from('interviews')
        .update({ feedback, status: 'completed' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['interviews']] }
  )

  return {
    createInterview: createInterviewMutation.mutate,
    updateInterview: updateInterviewMutation.mutate,
    submitFeedback: submitFeedbackMutation.mutate,
    isCreatingInterview: createInterviewMutation.isPending,
    isUpdatingInterview: updateInterviewMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending
  }
}

export function useOfferMutations() {
  const createOfferMutation = useSupabaseMutation<Partial<JobOffer>, JobOffer>(
    async (supabase, offerData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('job_offers')
        .insert({
          ...offerData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-offers'], ['job-applications']] }
  )

  const updateOfferMutation = useSupabaseMutation<{ id: string; updates: Partial<JobOffer> }, JobOffer>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('job_offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-offers']] }
  )

  const sendOfferMutation = useSupabaseMutation<string, JobOffer>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('job_offers')
        .update({ status: 'sent', sent_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['job-offers']] }
  )

  return {
    createOffer: createOfferMutation.mutate,
    updateOffer: updateOfferMutation.mutate,
    sendOffer: sendOfferMutation.mutate,
    isCreatingOffer: createOfferMutation.isPending,
    isUpdatingOffer: updateOfferMutation.isPending,
    isSendingOffer: sendOfferMutation.isPending
  }
}

export function useTalentPoolMutations() {
  const addToPoolMutation = useSupabaseMutation<Partial<TalentPoolCandidate>, TalentPoolCandidate>(
    async (supabase, candidateData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('talent_pool')
        .insert({
          ...candidateData,
          user_id: user.id,
          added_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['talent-pool']] }
  )

  const updateCandidateMutation = useSupabaseMutation<{ id: string; updates: Partial<TalentPoolCandidate> }, TalentPoolCandidate>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('talent_pool')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['talent-pool']] }
  )

  const removeCandidateMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('talent_pool')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['talent-pool']] }
  )

  const recordContactMutation = useSupabaseMutation<{ id: string; notes?: string }, TalentPoolCandidate>(
    async (supabase, { id, notes }) => {
      const updates: Partial<TalentPoolCandidate> = {
        last_contacted_date: new Date().toISOString()
      }
      if (notes) {
        updates.notes = notes
      }

      const { data, error } = await supabase
        .from('talent_pool')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['talent-pool']] }
  )

  return {
    addToPool: addToPoolMutation.mutate,
    updateCandidate: updateCandidateMutation.mutate,
    removeCandidate: removeCandidateMutation.mutate,
    recordContact: recordContactMutation.mutate,
    isAddingToPool: addToPoolMutation.isPending,
    isUpdatingCandidate: updateCandidateMutation.isPending,
    isRemovingCandidate: removeCandidateMutation.isPending,
    isRecordingContact: recordContactMutation.isPending
  }
}
