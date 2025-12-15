'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateJobPostingInput {
  title: string
  description?: string
  department?: string
  location?: string
  job_type?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  closing_date?: string
  requirements?: unknown[]
  benefits?: unknown[]
  hiring_manager?: string
  recruiter?: string
}

export interface UpdateJobPostingInput {
  title?: string
  description?: string
  department?: string
  location?: string
  job_type?: string
  status?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  posted_date?: string
  closing_date?: string
  requirements?: unknown[]
  benefits?: unknown[]
  hiring_manager?: string
  recruiter?: string
}

export interface CreateApplicationInput {
  job_id: string
  candidate_name: string
  candidate_email?: string
  candidate_phone?: string
  experience_years?: number
  match_score?: number
  resume_url?: string
  cover_letter?: string
  linkedin_url?: string
  portfolio_url?: string
  notes?: string
}

export interface UpdateApplicationInput {
  candidate_name?: string
  candidate_email?: string
  candidate_phone?: string
  status?: string
  stage?: string
  experience_years?: number
  match_score?: number
  resume_url?: string
  cover_letter?: string
  linkedin_url?: string
  portfolio_url?: string
  notes?: string
  interviewer_notes?: unknown[]
}

export async function createJobPosting(input: CreateJobPostingInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const jobCode = `JOB-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      user_id: user.id,
      job_code: jobCode,
      title: input.title,
      description: input.description,
      department: input.department,
      location: input.location,
      job_type: input.job_type || 'full-time',
      status: 'draft',
      salary_min: input.salary_min,
      salary_max: input.salary_max,
      salary_currency: input.salary_currency || 'USD',
      closing_date: input.closing_date,
      requirements: input.requirements || [],
      benefits: input.benefits || [],
      hiring_manager: input.hiring_manager,
      recruiter: input.recruiter
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function updateJobPosting(id: string, input: UpdateJobPostingInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_postings')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function publishJobPosting(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_postings')
    .update({
      status: 'active',
      posted_date: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function closeJobPosting(id: string, filled: boolean = false) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_postings')
    .update({
      status: filled ? 'filled' : 'closed'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function deleteJobPosting(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('job_postings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { success: true }
}

export async function createApplication(input: CreateApplicationInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const appCode = `APP-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      user_id: user.id,
      job_id: input.job_id,
      application_code: appCode,
      candidate_name: input.candidate_name,
      candidate_email: input.candidate_email,
      candidate_phone: input.candidate_phone,
      status: 'new',
      stage: 'Application Received',
      experience_years: input.experience_years || 0,
      match_score: input.match_score || 0,
      resume_url: input.resume_url,
      cover_letter: input.cover_letter,
      linkedin_url: input.linkedin_url,
      portfolio_url: input.portfolio_url,
      notes: input.notes
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Increment application count on job posting
  await supabase.rpc('increment_job_count', { job_id: input.job_id, count_field: 'applications_count' })
    .catch(() => {}) // Ignore if RPC doesn't exist

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function updateApplication(id: string, input: UpdateApplicationInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function advanceApplicationStage(id: string, newStage: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const stageUpdates: Record<string, Record<string, unknown>> = {
    'Screening': { screening_date: new Date().toISOString(), status: 'screening' },
    'Interview': { interview_date: new Date().toISOString(), status: 'interview' },
    'Offer': { offer_date: new Date().toISOString(), status: 'offer' },
    'Hired': { hired_date: new Date().toISOString(), status: 'hired' }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update({
      stage: newStage,
      ...stageUpdates[newStage]
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function rejectApplication(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .update({
      status: 'rejected',
      stage: 'Rejected',
      notes: reason ? `Rejection reason: ${reason}` : undefined
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/recruitment-v2')
  return { data }
}

export async function getJobPostings(filters?: {
  status?: string
  department?: string
  jobType?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('job_postings')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.department) {
    query = query.eq('department', filters.department)
  }
  if (filters?.jobType) {
    query = query.eq('job_type', filters.jobType)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getApplications(filters?: {
  jobId?: string
  status?: string
  stage?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('applied_date', { ascending: false })

  if (filters?.jobId) {
    query = query.eq('job_id', filters.jobId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
