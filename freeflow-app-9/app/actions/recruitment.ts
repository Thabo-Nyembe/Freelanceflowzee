'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import type { Database } from '@/types/supabase'

const logger = createFeatureLogger('recruitment')

// Type definitions
type JobPosting = Database['public']['Tables']['job_postings']['Row']
type JobApplication = Database['public']['Tables']['job_applications']['Row']

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

interface JobPostingFilters {
  status?: string
  department?: string
  jobType?: string
}

interface ApplicationFilters {
  jobId?: string
  status?: string
  stage?: string
}

// ============================================
// CREATE JOB POSTING
// ============================================

export async function createJobPosting(
  input: CreateJobPostingInput
): Promise<ActionResult<JobPosting>> {
  try {
    // Validate required fields
    if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
      logger.warn('Invalid job title', { input })
      return actionError('Job title is required', 'VALIDATION_ERROR')
    }

    // Validate salary range if provided
    if (input.salary_min !== undefined && input.salary_max !== undefined) {
      if (input.salary_min > input.salary_max) {
        logger.warn('Invalid salary range', { salary_min: input.salary_min, salary_max: input.salary_max })
        return actionError('Minimum salary cannot be greater than maximum salary', 'VALIDATION_ERROR')
      }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job posting creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to create job posting', { error, userId: user.id })
      return actionError('Failed to create job posting', 'DATABASE_ERROR')
    }

    logger.info('Job posting created successfully', {
      userId: user.id,
      jobId: data.id,
      jobCode
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Job posting created successfully')
  } catch (error) {
    logger.error('Unexpected error creating job posting', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE JOB POSTING
// ============================================

export async function updateJobPosting(
  id: string,
  input: UpdateJobPostingInput
): Promise<ActionResult<JobPosting>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid job posting ID format', { id })
      return actionError('Invalid job posting ID format', 'VALIDATION_ERROR')
    }

    // Validate salary range if both provided
    if (input.salary_min !== undefined && input.salary_max !== undefined) {
      if (input.salary_min > input.salary_max) {
        logger.warn('Invalid salary range', { salary_min: input.salary_min, salary_max: input.salary_max })
        return actionError('Minimum salary cannot be greater than maximum salary', 'VALIDATION_ERROR')
      }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job posting update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('job_postings')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update job posting', { error, jobId: id, userId: user.id })
      return actionError('Failed to update job posting', 'DATABASE_ERROR')
    }

    logger.info('Job posting updated successfully', {
      userId: user.id,
      jobId: id
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Job posting updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating job posting', { error, jobId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// PUBLISH JOB POSTING
// ============================================

export async function publishJobPosting(
  id: string
): Promise<ActionResult<JobPosting>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid job posting ID format', { id })
      return actionError('Invalid job posting ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job posting publish attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to publish job posting', { error, jobId: id, userId: user.id })
      return actionError('Failed to publish job posting', 'DATABASE_ERROR')
    }

    logger.info('Job posting published successfully', {
      userId: user.id,
      jobId: id
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Job posting published successfully')
  } catch (error) {
    logger.error('Unexpected error publishing job posting', { error, jobId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// CLOSE JOB POSTING
// ============================================

export async function closeJobPosting(
  id: string,
  filled: boolean = false
): Promise<ActionResult<JobPosting>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid job posting ID format', { id })
      return actionError('Invalid job posting ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job posting close attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to close job posting', { error, jobId: id, userId: user.id })
      return actionError('Failed to close job posting', 'DATABASE_ERROR')
    }

    logger.info('Job posting closed successfully', {
      userId: user.id,
      jobId: id,
      filled
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Job posting closed successfully')
  } catch (error) {
    logger.error('Unexpected error closing job posting', { error, jobId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// DELETE JOB POSTING
// ============================================

export async function deleteJobPosting(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid job posting ID format', { id })
      return actionError('Invalid job posting ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job posting delete attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('job_postings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete job posting', { error, jobId: id, userId: user.id })
      return actionError('Failed to delete job posting', 'DATABASE_ERROR')
    }

    logger.info('Job posting deleted successfully', {
      userId: user.id,
      jobId: id
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess({ success: true }, 'Job posting deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting job posting', { error, jobId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// CREATE APPLICATION
// ============================================

export async function createApplication(
  input: CreateApplicationInput
): Promise<ActionResult<JobApplication>> {
  try {
    // Validate job_id
    const jobIdValidation = uuidSchema.safeParse(input.job_id)
    if (!jobIdValidation.success) {
      logger.warn('Invalid job ID format', { job_id: input.job_id })
      return actionError('Invalid job ID format', 'VALIDATION_ERROR')
    }

    // Validate required fields
    if (!input.candidate_name || typeof input.candidate_name !== 'string' || input.candidate_name.trim().length === 0) {
      logger.warn('Invalid candidate name', { input })
      return actionError('Candidate name is required', 'VALIDATION_ERROR')
    }

    // Validate experience years if provided
    if (input.experience_years !== undefined && (typeof input.experience_years !== 'number' || input.experience_years < 0)) {
      logger.warn('Invalid experience years', { experience_years: input.experience_years })
      return actionError('Experience years must be a non-negative number', 'VALIDATION_ERROR')
    }

    // Validate match score if provided
    if (input.match_score !== undefined && (typeof input.match_score !== 'number' || input.match_score < 0 || input.match_score > 100)) {
      logger.warn('Invalid match score', { match_score: input.match_score })
      return actionError('Match score must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized application creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to create application', { error, userId: user.id })
      return actionError('Failed to create application', 'DATABASE_ERROR')
    }

    // Increment application count on job posting (non-blocking)
    await supabase.rpc('increment_job_count', { job_id: input.job_id, count_field: 'applications_count' })
      .catch(() => {}) // Ignore if RPC doesn't exist

    logger.info('Application created successfully', {
      userId: user.id,
      applicationId: data.id,
      jobId: input.job_id,
      appCode
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Application created successfully')
  } catch (error) {
    logger.error('Unexpected error creating application', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE APPLICATION
// ============================================

export async function updateApplication(
  id: string,
  input: UpdateApplicationInput
): Promise<ActionResult<JobApplication>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid application ID format', { id })
      return actionError('Invalid application ID format', 'VALIDATION_ERROR')
    }

    // Validate experience years if provided
    if (input.experience_years !== undefined && (typeof input.experience_years !== 'number' || input.experience_years < 0)) {
      logger.warn('Invalid experience years', { experience_years: input.experience_years })
      return actionError('Experience years must be a non-negative number', 'VALIDATION_ERROR')
    }

    // Validate match score if provided
    if (input.match_score !== undefined && (typeof input.match_score !== 'number' || input.match_score < 0 || input.match_score > 100)) {
      logger.warn('Invalid match score', { match_score: input.match_score })
      return actionError('Match score must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized application update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update application', { error, applicationId: id, userId: user.id })
      return actionError('Failed to update application', 'DATABASE_ERROR')
    }

    logger.info('Application updated successfully', {
      userId: user.id,
      applicationId: id
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Application updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating application', { error, applicationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// ADVANCE APPLICATION STAGE
// ============================================

export async function advanceApplicationStage(
  id: string,
  newStage: string
): Promise<ActionResult<JobApplication>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid application ID format', { id })
      return actionError('Invalid application ID format', 'VALIDATION_ERROR')
    }

    // Validate stage
    if (!newStage || typeof newStage !== 'string' || newStage.trim().length === 0) {
      logger.warn('Invalid stage', { newStage })
      return actionError('Stage is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized application stage update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to advance application stage', { error, applicationId: id, userId: user.id })
      return actionError('Failed to advance application stage', 'DATABASE_ERROR')
    }

    logger.info('Application stage advanced successfully', {
      userId: user.id,
      applicationId: id,
      newStage
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Application stage advanced successfully')
  } catch (error) {
    logger.error('Unexpected error advancing application stage', { error, applicationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// REJECT APPLICATION
// ============================================

export async function rejectApplication(
  id: string,
  reason?: string
): Promise<ActionResult<JobApplication>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid application ID format', { id })
      return actionError('Invalid application ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized application rejection attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to reject application', { error, applicationId: id, userId: user.id })
      return actionError('Failed to reject application', 'DATABASE_ERROR')
    }

    logger.info('Application rejected successfully', {
      userId: user.id,
      applicationId: id,
      reason
    })

    revalidatePath('/dashboard/recruitment-v2')
    return actionSuccess(data, 'Application rejected successfully')
  } catch (error) {
    logger.error('Unexpected error rejecting application', { error, applicationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// GET JOB POSTINGS
// ============================================

export async function getJobPostings(
  filters?: JobPostingFilters
): Promise<ActionResult<JobPosting[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized job postings fetch attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to fetch job postings', { error, userId: user.id })
      return actionError('Failed to fetch job postings', 'DATABASE_ERROR')
    }

    logger.info('Job postings fetched successfully', {
      userId: user.id,
      count: data.length,
      filters
    })

    return actionSuccess(data, 'Job postings fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching job postings', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// GET APPLICATIONS
// ============================================

export async function getApplications(
  filters?: ApplicationFilters
): Promise<ActionResult<JobApplication[]>> {
  try {
    // Validate jobId if provided
    if (filters?.jobId) {
      const jobIdValidation = uuidSchema.safeParse(filters.jobId)
      if (!jobIdValidation.success) {
        logger.warn('Invalid job ID format in filters', { jobId: filters.jobId })
        return actionError('Invalid job ID format', 'VALIDATION_ERROR')
      }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized applications fetch attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
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
      logger.error('Failed to fetch applications', { error, userId: user.id })
      return actionError('Failed to fetch applications', 'DATABASE_ERROR')
    }

    logger.info('Applications fetched successfully', {
      userId: user.id,
      count: data.length,
      filters
    })

    return actionSuccess(data, 'Applications fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching applications', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
