'use server'

/**
 * Extended Policies Server Actions
 * Tables: policies, policy_versions, policy_acknowledgments, policy_categories, policy_attachments, policy_exceptions
 */

import { createClient } from '@/lib/supabase/server'

export async function getPolicy(policyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').select('*, policy_versions(*), policy_categories(*), policy_attachments(*)').eq('id', policyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPolicy(policyData: { title: string; content: string; category_id?: string; organization_id?: string; author_id: string; effective_date?: string; review_date?: string; requires_acknowledgment?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').insert({ ...policyData, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePolicy(policyId: string, updates: Partial<{ title: string; content: string; category_id: string; effective_date: string; review_date: string; requires_acknowledgment: boolean }>, createVersion: boolean = true) {
  try { const supabase = await createClient(); if (createVersion) { const { data: current } = await supabase.from('policies').select('*').eq('id', policyId).single(); if (current) { await supabase.from('policy_versions').insert({ policy_id: policyId, version: current.version, title: current.title, content: current.content, created_at: new Date().toISOString() }) } } const { data, error } = await supabase.from('policies').update({ ...updates, version: supabase.sql`version + 1`, updated_at: new Date().toISOString() }).eq('id', policyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishPolicy(policyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', policyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archivePolicy(policyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').update({ status: 'archived', archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', policyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePolicy(policyId: string) {
  try { const supabase = await createClient(); await supabase.from('policy_versions').delete().eq('policy_id', policyId); await supabase.from('policy_acknowledgments').delete().eq('policy_id', policyId); await supabase.from('policy_attachments').delete().eq('policy_id', policyId); await supabase.from('policy_exceptions').delete().eq('policy_id', policyId); const { error } = await supabase.from('policies').delete().eq('id', policyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPolicies(options?: { organization_id?: string; category_id?: string; status?: string; requires_acknowledgment?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('policies').select('*, policy_categories(*)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.requires_acknowledgment !== undefined) query = query.eq('requires_acknowledgment', options.requires_acknowledgment); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('title', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function acknowledgePolicy(policyId: string, userId: string, signature?: string) {
  try { const supabase = await createClient(); const { data: policy } = await supabase.from('policies').select('version').eq('id', policyId).single(); const { data, error } = await supabase.from('policy_acknowledgments').insert({ policy_id: policyId, user_id: userId, policy_version: policy?.version, signature, acknowledged_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAcknowledgments(policyId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_acknowledgments').select('*, users(*)').eq('policy_id', policyId).order('acknowledged_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserAcknowledgments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_acknowledgments').select('*, policies(*)').eq('user_id', userId).order('acknowledged_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVersions(policyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_versions').select('*').eq('policy_id', policyId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCategory(categoryData: { name: string; description?: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_categories').insert({ ...categoryData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('policy_categories').select('*, policies(count)'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAttachment(policyId: string, attachmentData: { name: string; file_url: string; file_type?: string; file_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_attachments').insert({ policy_id: policyId, ...attachmentData, uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createException(exceptionData: { policy_id: string; user_id?: string; department_id?: string; reason: string; approved_by: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policy_exceptions').insert({ ...exceptionData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
