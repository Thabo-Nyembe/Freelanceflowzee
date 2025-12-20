'use server'

/**
 * Extended Deployments Server Actions
 * Tables: deployments, deployment_logs, deployment_environments, deployment_rollbacks
 */

import { createClient } from '@/lib/supabase/server'

export async function getDeployment(deploymentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployments').select('*, deployment_logs(*), deployment_environments(*)').eq('id', deploymentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDeployment(deploymentData: { project_id: string; environment_id: string; version: string; commit_sha?: string; deployed_by: string; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployments').insert({ ...deploymentData, status: 'pending', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDeploymentStatus(deploymentId: string, status: string, details?: { error_message?: string; duration_seconds?: number }) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString(); if (details?.error_message) updates.error_message = details.error_message; if (details?.duration_seconds) updates.duration_seconds = details.duration_seconds; const { data, error } = await supabase.from('deployments').update(updates).eq('id', deploymentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectDeployments(projectId: string, options?: { environment_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('deployments').select('*').eq('project_id', projectId); if (options?.environment_id) query = query.eq('environment_id', options.environment_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDeploymentLog(logData: { deployment_id: string; level: string; message: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployment_logs').insert({ ...logData, logged_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDeploymentLogs(deploymentId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('deployment_logs').select('*').eq('deployment_id', deploymentId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('logged_at', { ascending: true }).limit(options?.limit || 500); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEnvironments(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('deployment_environments').select('*'); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEnvironment(envData: { project_id: string; name: string; url?: string; variables?: any; is_production?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployment_environments').insert({ ...envData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rollbackDeployment(deploymentId: string, targetDeploymentId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployment_rollbacks').insert({ deployment_id: deploymentId, target_deployment_id: targetDeploymentId, rolled_back_by: userId, rolled_back_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestDeployment(projectId: string, environmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('deployments').select('*').eq('project_id', projectId).eq('environment_id', environmentId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
