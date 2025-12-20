'use server'

/**
 * Extended Machine Server Actions
 * Tables: machine_learning_models, machine_predictions, machine_training_jobs, machine_datasets, machine_features, machine_deployments
 */

import { createClient } from '@/lib/supabase/server'

export async function getModel(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_learning_models').select('*, machine_features(*), machine_deployments(*)').eq('id', modelId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createModel(modelData: { name: string; description?: string; model_type: string; algorithm?: string; framework?: string; organization_id?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_learning_models').insert({ ...modelData, version: '1.0.0', status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModel(modelId: string, updates: Partial<{ name: string; description: string; algorithm: string; hyperparameters: any; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_learning_models').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', modelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModels(options?: { model_type?: string; status?: string; organization_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('machine_learning_models').select('*'); if (options?.model_type) query = query.eq('model_type', options.model_type); if (options?.status) query = query.eq('status', options.status); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTrainingJob(jobData: { model_id: string; dataset_id: string; hyperparameters?: any; split_ratio?: number; epochs?: number; batch_size?: number; created_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_training_jobs').insert({ ...jobData, status: 'queued', progress: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrainingJob(jobId: string, updates: Partial<{ status: string; progress: number; metrics: any; error_message: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.status === 'completed') updateData.completed_at = new Date().toISOString(); if (updates.status === 'running' && !updates.progress) updateData.started_at = new Date().toISOString(); const { data, error } = await supabase.from('machine_training_jobs').update(updateData).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrainingJobs(modelId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('machine_training_jobs').select('*, machine_datasets(*)').eq('model_id', modelId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDataset(datasetData: { name: string; description?: string; source_type: string; source_path?: string; row_count?: number; column_count?: number; organization_id?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_datasets').insert({ ...datasetData, status: 'uploading', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDataset(datasetId: string, updates: Partial<{ name: string; description: string; status: string; row_count: number; column_count: number; schema: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_datasets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', datasetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDatasets(options?: { organization_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('machine_datasets').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFeature(featureData: { model_id: string; name: string; data_type: string; importance?: number; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_features').insert({ ...featureData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatures(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_features').select('*').eq('model_id', modelId).order('importance', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deployModel(deploymentData: { model_id: string; version: string; environment: string; endpoint_url?: string; deployed_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_deployments').insert({ ...deploymentData, status: 'deploying', deployed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('machine_learning_models').update({ status: 'deployed', updated_at: new Date().toISOString() }).eq('id', deploymentData.model_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordPrediction(predictionData: { model_id: string; deployment_id?: string; input_data: any; prediction: any; confidence?: number; latency_ms?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('machine_predictions').insert({ ...predictionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPredictions(modelId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('machine_predictions').select('*').eq('model_id', modelId); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
