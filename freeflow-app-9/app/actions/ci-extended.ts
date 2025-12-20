'use server'

/**
 * Extended CI/CD Server Actions
 * Tables: ci_pipelines, ci_stages, ci_jobs, ci_artifacts
 */

import { createClient } from '@/lib/supabase/server'

export async function getPipeline(pipelineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ci_pipelines').select('*, ci_stages(*, ci_jobs(*))').eq('id', pipelineId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPipeline(pipelineData: { project_id: string; name: string; branch?: string; commit_sha?: string; triggered_by: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ci_pipelines').insert({ ...pipelineData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePipelineStatus(pipelineId: string, status: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'running') updates.started_at = new Date().toISOString(); if (status === 'success' || status === 'failed' || status === 'cancelled') updates.finished_at = new Date().toISOString(); const { data, error } = await supabase.from('ci_pipelines').update(updates).eq('id', pipelineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelPipeline(pipelineId: string) {
  try { const supabase = await createClient(); await supabase.from('ci_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString() }).eq('pipeline_id', pipelineId).in('status', ['pending', 'running']); const { data, error } = await supabase.from('ci_pipelines').update({ status: 'cancelled', finished_at: new Date().toISOString() }).eq('id', pipelineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPipelines(options?: { project_id?: string; status?: string; branch?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ci_pipelines').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); if (options?.branch) query = query.eq('branch', options.branch); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStage(stageData: { pipeline_id: string; name: string; position: number; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ci_stages').insert({ ...stageData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createJob(jobData: { pipeline_id: string; stage_id: string; name: string; script?: string[]; image?: string; variables?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ci_jobs').insert({ ...jobData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJobStatus(jobId: string, status: string, logs?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'running') updates.started_at = new Date().toISOString(); if (status === 'success' || status === 'failed') updates.finished_at = new Date().toISOString(); if (logs) updates.logs = logs; const { data, error } = await supabase.from('ci_jobs').update(updates).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uploadArtifact(artifactData: { job_id: string; name: string; file_path: string; file_url?: string; size_bytes?: number; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ci_artifacts').insert({ ...artifactData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryPipeline(pipelineId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('ci_pipelines').select('project_id, name, branch, commit_sha, triggered_by, config').eq('id', pipelineId).single(); if (!original) throw new Error('Pipeline not found'); const { data, error } = await supabase.from('ci_pipelines').insert({ ...original, status: 'pending', retry_of: pipelineId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
