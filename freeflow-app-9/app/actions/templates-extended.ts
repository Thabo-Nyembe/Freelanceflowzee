'use server'

/**
 * Extended Templates Server Actions
 * Tables: templates, template_categories, template_versions, template_variables, template_usages, template_shares
 */

import { createClient } from '@/lib/supabase/server'

export async function getTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('templates').select('*, template_categories(*), template_versions(*), template_variables(*)').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTemplate(templateData: { name: string; description?: string; category_id?: string; template_type: string; content: any; variables?: any; is_public?: boolean; created_by: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: template, error: templateError } = await supabase.from('templates').insert({ ...templateData, is_public: templateData.is_public ?? false, version: 1, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (templateError) throw templateError; await supabase.from('template_versions').insert({ template_id: template.id, version: 1, content: templateData.content, variables: templateData.variables, created_by: templateData.created_by, created_at: new Date().toISOString() }); return { success: true, data: template } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTemplate(templateId: string, updates: Partial<{ name: string; description: string; category_id: string; content: any; variables: any; is_public: boolean; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('templates').select('version, content, variables').eq('id', templateId).single(); const newVersion = (current?.version || 0) + 1; const { data, error } = await supabase.from('templates').update({ ...updates, version: newVersion, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; if (updates.content || updates.variables) { await supabase.from('template_versions').insert({ template_id: templateId, version: newVersion, content: updates.content || current?.content, variables: updates.variables || current?.variables, created_by: userId, created_at: new Date().toISOString() }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTemplate(templateId: string) {
  try { const supabase = await createClient(); await supabase.from('template_versions').delete().eq('template_id', templateId); await supabase.from('template_variables').delete().eq('template_id', templateId); await supabase.from('template_shares').delete().eq('template_id', templateId); const { error } = await supabase.from('templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTemplates(options?: { template_type?: string; category_id?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('templates').select('*, template_categories(*)'); if (options?.template_type) query = query.eq('template_type', options.template_type); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVersions(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_versions').select('*, users(*)').eq('template_id', templateId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function useTemplate(templateId: string, userId: string, variables?: Record<string, any>) {
  try { const supabase = await createClient(); const { data: template, error } = await supabase.from('templates').select('content, variables').eq('id', templateId).single(); if (error) throw error; await supabase.from('templates').update({ usage_count: supabase.rpc('increment_count', { row_id: templateId, count_column: 'usage_count' }), last_used_at: new Date().toISOString() }).eq('id', templateId); await supabase.from('template_usages').insert({ template_id: templateId, user_id: userId, variables_used: variables, used_at: new Date().toISOString(), created_at: new Date().toISOString() }); let content = JSON.stringify(template.content); if (variables) { Object.entries(variables).forEach(([key, value]) => { content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value)) }) } return { success: true, data: { content: JSON.parse(content), original: template.content } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function shareTemplate(templateId: string, shareWith: string, shareType: 'user' | 'team' | 'organization', permission: string = 'view', sharedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('template_shares').insert({ template_id: templateId, shared_with: shareWith, share_type: shareType, permission, shared_by: sharedBy, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories(options?: { parent_id?: string | null }) {
  try { const supabase = await createClient(); let query = supabase.from('template_categories').select('*'); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function cloneTemplate(templateId: string, userId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original } = await supabase.from('templates').select('*').eq('id', templateId).single(); if (!original) return { success: false, error: 'Template not found' }; const { id, created_at, updated_at, usage_count, ...templateData } = original; const { data, error } = await supabase.from('templates').insert({ ...templateData, name: newName || `${original.name} (Copy)`, created_by: userId, is_public: false, version: 1, usage_count: 0, cloned_from: templateId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
