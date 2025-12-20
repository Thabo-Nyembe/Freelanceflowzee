'use server'

/**
 * Extended Jobs Server Actions
 * Tables: jobs, job_applications, job_postings, job_categories, job_requirements, job_benefits
 */

import { createClient } from '@/lib/supabase/server'

export async function getJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').select('*, job_requirements(*), job_benefits(*)').eq('id', jobId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createJob(jobData: { title: string; description: string; company_id: string; department?: string; location?: string; type: string; salary_min?: number; salary_max?: number; experience_level?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').insert({ ...jobData, status: 'draft', application_count: 0, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJob(jobId: string, updates: Partial<{ title: string; description: string; location: string; type: string; salary_min: number; salary_max: number; status: string; experience_level: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJobs(options?: { company_id?: string; status?: string; type?: string; location?: string; experience_level?: string; category_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('jobs').select('*'); if (options?.company_id) query = query.eq('company_id', options.company_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.location) query = query.ilike('location', `%${options.location}%`); if (options?.experience_level) query = query.eq('experience_level', options.experience_level); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.search) query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createJobApplication(applicationData: { job_id: string; applicant_id: string; resume_url?: string; cover_letter?: string; portfolio_url?: string; answers?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').insert({ ...applicationData, status: 'submitted', applied_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: job } = await supabase.from('jobs').select('application_count').eq('id', applicationData.job_id).single(); await supabase.from('jobs').update({ application_count: (job?.application_count || 0) + 1 }).eq('id', applicationData.job_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJobApplication(applicationId: string, updates: Partial<{ status: string; notes: string; rating: number; interview_date: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJobApplications(jobId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('job_applications').select('*').eq('job_id', jobId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('applied_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserApplications(userId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('job_applications').select('*, jobs(*)').eq('applicant_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('applied_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addJobRequirement(requirementData: { job_id: string; description: string; is_required?: boolean; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_requirements').insert({ ...requirementData, is_required: requirementData.is_required ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addJobBenefit(benefitData: { job_id: string; title: string; description?: string; icon?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_benefits').insert(benefitData).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJobCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function incrementJobViews(jobId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('jobs').select('view_count').eq('id', jobId).single(); const { error } = await supabase.from('jobs').update({ view_count: (data?.view_count || 0) + 1 }).eq('id', jobId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
