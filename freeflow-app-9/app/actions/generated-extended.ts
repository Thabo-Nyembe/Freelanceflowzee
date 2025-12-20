'use server'

/**
 * Extended Generated Content Server Actions
 * Tables: generated_content, generated_images, generated_code, generated_reports
 */

import { createClient } from '@/lib/supabase/server'

export async function getGeneratedContent(contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generated_content').select('*').eq('id', contentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGeneratedContent(contentData: { user_id: string; type: string; prompt: string; output?: string; model?: string; parameters?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generated_content').insert({ ...contentData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGeneratedContent(contentId: string, updates: Partial<{ output: string; status: string; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generated_content').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', contentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGeneratedContent(contentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('generated_content').delete().eq('id', contentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGeneratedContentList(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generated_content').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGeneratedImages(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('generated_images').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGeneratedCode(userId: string, options?: { language?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generated_code').select('*').eq('user_id', userId); if (options?.language) query = query.eq('language', options.language); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGeneratedReports(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('generated_reports').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
