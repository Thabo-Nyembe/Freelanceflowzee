'use server'

/**
 * Extended Build Server Actions - Covers all Build-related tables
 * Tables: builds, build_logs, build_artifacts, build_configs
 */

import { createClient } from '@/lib/supabase/server'

export async function getBuild(buildId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('builds').select('*, build_logs(*), build_artifacts(*)').eq('id', buildId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBuild(buildData: { project_id: string; branch?: string; commit_sha?: string; commit_message?: string; triggered_by: string; build_type?: string; environment?: string }) {
  try { const supabase = await createClient(); const buildNumber = Date.now(); const { data, error } = await supabase.from('builds').insert({ ...buildData, build_number: buildNumber, status: 'pending', build_type: buildData.build_type || 'standard', environment: buildData.environment || 'development', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBuildStatus(buildId: string, status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled', metadata?: { started_at?: string; completed_at?: string; duration_ms?: number; error_message?: string }) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (metadata?.started_at) updates.started_at = metadata.started_at; if (metadata?.completed_at) updates.completed_at = metadata.completed_at; if (metadata?.duration_ms) updates.duration_ms = metadata.duration_ms; if (metadata?.error_message) updates.error_message = metadata.error_message; const { data, error } = await supabase.from('builds').update(updates).eq('id', buildId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBuild(buildId: string) {
  try { const supabase = await createClient(); await supabase.from('build_logs').delete().eq('build_id', buildId); await supabase.from('build_artifacts').delete().eq('build_id', buildId); const { error } = await supabase.from('builds').delete().eq('id', buildId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuilds(projectId: string, options?: { status?: string; branch?: string; environment?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('builds').select('*').eq('project_id', projectId); if (options?.status) query = query.eq('status', options.status); if (options?.branch) query = query.eq('branch', options.branch); if (options?.environment) query = query.eq('environment', options.environment); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBuildLog(logData: { build_id: string; level: 'info' | 'warning' | 'error' | 'debug'; message: string; step?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_logs').insert({ ...logData, timestamp: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuildLogs(buildId: string, options?: { level?: string; step?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('build_logs').select('*').eq('build_id', buildId); if (options?.level) query = query.eq('level', options.level); if (options?.step) query = query.eq('step', options.step); const { data, error } = await query.order('timestamp', { ascending: true }).limit(options?.limit || 1000); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBuildArtifact(artifactData: { build_id: string; name: string; type: string; file_path: string; file_size: number; checksum?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_artifacts').insert({ ...artifactData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuildArtifacts(buildId: string, options?: { type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('build_artifacts').select('*').eq('build_id', buildId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteBuildArtifact(artifactId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('build_artifacts').delete().eq('id', artifactId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuildConfig(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_configs').select('*').eq('project_id', projectId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBuildConfig(configData: { project_id: string; build_command: string; output_directory?: string; environment_variables?: Record<string, string>; node_version?: string; install_command?: string; pre_build_command?: string; post_build_command?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_configs').insert({ ...configData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBuildConfig(configId: string, updates: Partial<{ build_command: string; output_directory: string; environment_variables: Record<string, string>; node_version: string; install_command: string; pre_build_command: string; post_build_command: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('build_configs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', configId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBuildStats(projectId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('builds').select('status, duration_ms, created_at').eq('project_id', projectId); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data: builds } = await query; if (!builds) return { success: true, data: { total: 0, success: 0, failed: 0, cancelled: 0, avgDuration: 0, successRate: 0 } }; const total = builds.length; const success = builds.filter(b => b.status === 'success').length; const failed = builds.filter(b => b.status === 'failed').length; const cancelled = builds.filter(b => b.status === 'cancelled').length; const durations = builds.filter(b => b.duration_ms).map(b => b.duration_ms); const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0; const successRate = total > 0 ? (success / total) * 100 : 0; return { success: true, data: { total, success, failed, cancelled, avgDuration, successRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestBuild(projectId: string, options?: { branch?: string; environment?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('builds').select('*').eq('project_id', projectId); if (options?.branch) query = query.eq('branch', options.branch); if (options?.environment) query = query.eq('environment', options.environment); const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryBuild(buildId: string, triggeredBy: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('builds').select('*').eq('id', buildId).single(); if (!original) return { success: false, error: 'Build not found' }; const { id, build_number, status, started_at, completed_at, duration_ms, error_message, created_at, updated_at, ...rest } = original; const newBuildNumber = Date.now(); const { data, error } = await supabase.from('builds').insert({ ...rest, build_number: newBuildNumber, status: 'pending', triggered_by: triggeredBy, retry_of: buildId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
