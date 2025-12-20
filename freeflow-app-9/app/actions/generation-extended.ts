'use server'

/**
 * Extended Generation Server Actions
 * Tables: generations, generation_templates, generation_history, generation_models, generation_outputs
 */

import { createClient } from '@/lib/supabase/server'

export async function getGeneration(generationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generations').select('*, generation_outputs(*)').eq('id', generationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGeneration(generationData: { user_id: string; type: string; prompt: string; model_id?: string; template_id?: string; parameters?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generations').insert({ ...generationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGeneration(generationId: string, updates: Partial<{ status: string; output: any; error_message: string; processing_time: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', generationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGenerations(options?: { user_id?: string; type?: string; status?: string; model_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generations').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.model_id) query = query.eq('model_id', options.model_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGenerationTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generation_templates').select('*').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGenerationTemplate(templateData: { name: string; type: string; prompt_template: string; description?: string; parameters?: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generation_templates').insert({ ...templateData, usage_count: 0, is_public: templateData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGenerationTemplates(options?: { type?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generation_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGenerationModels(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('generation_models').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addGenerationOutput(outputData: { generation_id: string; output_type: string; content: any; file_url?: string; file_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generation_outputs').insert({ ...outputData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGenerationOutputs(generationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generation_outputs').select('*').eq('generation_id', generationId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGenerationHistory(userId: string, options?: { type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generation_history').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function incrementTemplateUsage(templateId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('generation_templates').select('usage_count').eq('id', templateId).single(); const { error } = await supabase.from('generation_templates').update({ usage_count: (data?.usage_count || 0) + 1 }).eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGeneration(generationId: string) {
  try { const supabase = await createClient(); await supabase.from('generation_outputs').delete().eq('generation_id', generationId); const { error } = await supabase.from('generations').delete().eq('id', generationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
