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
