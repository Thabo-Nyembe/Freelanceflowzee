'use server'

/**
 * Extended Job Server Actions - Covers all Job-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getJobs(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createJob(userId: string, input: { title: string; description: string; department?: string; location?: string; type?: string; salary_range?: any; requirements?: string[]; benefits?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').insert({ user_id: userId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJob(jobId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('jobs').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteJob(jobId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('jobs').delete().eq('id', jobId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJobApplications(jobId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('job_applications').select('*').eq('job_id', jobId).order('applied_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createJobApplication(jobId: string, applicantId: string, input: { resume_url?: string; cover_letter?: string; answers?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').insert({ job_id: jobId, applicant_id: applicantId, ...input, status: 'pending', applied_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateApplicationStatus(applicationId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').update({ status, reviewer_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleInterview(applicationId: string, interviewDate: string, interviewType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').update({ status: 'interview_scheduled', interview_date: interviewDate, interview_type: interviewType }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getApplicantApplications(applicantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('job_applications').select('*, jobs(*)').eq('applicant_id', applicantId).order('applied_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
