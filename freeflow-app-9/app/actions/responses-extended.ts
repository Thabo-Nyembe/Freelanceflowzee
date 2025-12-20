'use server'

/**
 * Extended Responses Server Actions
 * Tables: responses, response_templates, response_categories, response_analytics, response_shortcuts
 */

import { createClient } from '@/lib/supabase/server'

export async function getResponse(responseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('responses').select('*, response_templates(*), users(*), response_analytics(*)').eq('id', responseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createResponse(responseData: { entity_type: string; entity_id: string; user_id: string; content: string; template_id?: string; is_public?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('responses').insert({ ...responseData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateResponse(responseId: string, updates: Partial<{ content: string; status: string; is_public: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('responses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', responseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteResponse(responseId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('responses').delete().eq('id', responseId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResponses(options?: { entity_type?: string; entity_id?: string; user_id?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('responses').select('*, response_templates(*), users(*)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('content', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getResponseTemplates(options?: { category_id?: string; user_id?: string; is_shared?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('response_templates').select('*, response_categories(*), users(*)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_shared !== undefined) query = query.eq('is_shared', options.is_shared); if (options?.search) query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`); const { data, error } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResponseTemplate(templateData: { title: string; content: string; category_id?: string; user_id: string; is_shared?: boolean; shortcut?: string; variables?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_templates').insert({ ...templateData, usage_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateResponseTemplate(templateId: string, updates: Partial<{ title: string; content: string; category_id: string; is_shared: boolean; shortcut: string; variables: string[]; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function useResponseTemplate(templateId: string, variables?: { [key: string]: string }) {
  try { const supabase = await createClient(); const { data: template, error: fetchError } = await supabase.from('response_templates').select('*').eq('id', templateId).single(); if (fetchError) throw fetchError; let content = template.content; if (variables) { Object.entries(variables).forEach(([key, value]) => { content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value) }) } await supabase.from('response_templates').update({ usage_count: (template.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', templateId); return { success: true, content, template } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResponseCategories(options?: { parent_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('response_categories').select('*'); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); else if (options?.parent_id === null) query = query.is('parent_id', null); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResponseCategory(categoryData: { name: string; description?: string; parent_id?: string; icon?: string; color?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_categories').insert({ ...categoryData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResponseShortcuts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_shortcuts').select('*, response_templates(*)').eq('user_id', userId).order('shortcut', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createResponseShortcut(shortcutData: { user_id: string; shortcut: string; template_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_shortcuts').insert({ ...shortcutData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordResponseAnalytics(analyticsData: { response_id: string; action: 'viewed' | 'copied' | 'sent' | 'rated'; user_id?: string; rating?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('response_analytics').insert({ ...analyticsData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPopularTemplates(options?: { category_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('response_templates').select('*, response_categories(*)').eq('is_active', true).eq('is_shared', true); if (options?.category_id) query = query.eq('category_id', options.category_id); const { data, error } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
