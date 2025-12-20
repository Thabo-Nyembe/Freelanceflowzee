'use server'

/**
 * Extended Render Server Actions
 * Tables: render_jobs, render_templates, render_outputs, render_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getRenderJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_jobs').select('*').eq('id', jobId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRenderJob(jobData: { user_id: string; template_id?: string; input_data: Record<string, any>; output_format?: string; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_jobs').insert({ ...jobData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRenderJob(jobId: string, updates: Partial<{ status: string; progress: number; output_url: string; error_message: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRenderJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_jobs').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRenderJobs(options?: { user_id?: string; status?: string; template_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('render_jobs').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.template_id) query = query.eq('template_id', options.template_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRenderTemplates(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('render_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRenderOutputs(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_outputs').select('*').eq('job_id', jobId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRenderSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('render_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
