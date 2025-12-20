'use server'

/**
 * Extended Builds Server Actions
 * Tables: builds, build_logs, build_artifacts, build_configs
 */

import { createClient } from '@/lib/supabase/server'

export async function getBuild(buildId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('builds').select('*, build_logs(*), build_artifacts(*)').eq('id', buildId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBuild(buildData: { project_id: string; triggered_by: string; branch?: string; commit_sha?: string; build_number?: number; config_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('builds').insert({ ...buildData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBuildStatus(buildId: string, status: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'running') updates.started_at = new Date().toISOString(); if (status === 'success' || status === 'failed') updates.finished_at = new Date().toISOString(); if (metadata) updates.metadata = metadata; const { data, error } = await supabase.from('builds').update(updates).eq('id', buildId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelBuild(buildId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('builds').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', buildId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryBuild(originalBuildId: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('builds').select('project_id, triggered_by, branch, commit_sha, config_id').eq('id', originalBuildId).single(); if (!original) throw new Error('Build not found'); const { data, error } = await supabase.from('builds').insert({ ...original, status: 'pending', retry_of: originalBuildId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuilds(options?: { project_id?: string; status?: string; branch?: string; triggered_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('builds').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); if (options?.branch) query = query.eq('branch', options.branch); if (options?.triggered_by) query = query.eq('triggered_by', options.triggered_by); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBuildLog(buildId: string, level: string, message: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_logs').insert({ build_id: buildId, level, message, metadata, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addBuildArtifact(artifactData: { build_id: string; name: string; type: string; file_path?: string; file_url?: string; size_bytes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_artifacts').insert({ ...artifactData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuildConfigs(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_configs').select('*').eq('project_id', projectId).eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
