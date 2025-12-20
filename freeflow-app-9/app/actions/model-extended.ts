'use server'

/**
 * Extended Model Server Actions
 * Tables: models, model_versions, model_deployments, model_predictions
 */

import { createClient } from '@/lib/supabase/server'

export async function getModel(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('models').select('*').eq('id', modelId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createModel(modelData: { user_id: string; name: string; description?: string; type: string; framework?: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('models').insert({ ...modelData, status: 'draft', version: '1.0.0', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModel(modelId: string, updates: Partial<{ name: string; description: string; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('models').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', modelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModel(modelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('models').delete().eq('id', modelId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModels(options?: { user_id?: string; type?: string; framework?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('models').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.framework) query = query.eq('framework', options.framework); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getModelVersions(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('model_versions').select('*').eq('model_id', modelId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createModelVersion(modelId: string, versionData: { version: string; changelog?: string; metrics?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('model_versions').insert({ model_id: modelId, ...versionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelDeployments(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('model_deployments').select('*').eq('model_id', modelId).order('deployed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deployModel(modelId: string, deploymentData: { environment: string; version?: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('model_deployments').insert({ model_id: modelId, ...deploymentData, status: 'deploying', deployed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModelPredictions(modelId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('model_predictions').select('*').eq('model_id', modelId).order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
