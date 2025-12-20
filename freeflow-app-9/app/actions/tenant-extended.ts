'use server'

/**
 * Extended Tenant Server Actions - Covers all Tenant-related tables (Multi-tenancy)
 */

import { createClient } from '@/lib/supabase/server'

export async function getTenant(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTenant(tenantData: { name: string; slug: string; domain?: string; settings?: Record<string, any>; plan_id?: string; owner_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').insert({ ...tenantData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTenant(tenantId: string, updates: Partial<{ name: string; domain: string; settings: Record<string, any>; status: string; plan_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tenantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTenant(tenantId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tenants').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', tenantId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenants(options?: { status?: string; planId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('tenants').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.planId) query = query.eq('plan_id', options.planId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTenantBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').select('*').eq('slug', slug).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenantByDomain(domain: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').select('*').eq('domain', domain).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenantUsers(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_users').select('*, users(id, email, full_name, avatar_url)').eq('tenant_id', tenantId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTenantUser(tenantId: string, userId: string, role: string = 'user') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_users').insert({ tenant_id: tenantId, user_id: userId, role, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTenantUser(tenantId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tenant_users').delete().eq('tenant_id', tenantId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenantSettings(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateTenantSetting(tenantId: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_settings').upsert({ tenant_id: tenantId, key, value, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id,key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenantUsage(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_usage').select('*').eq('tenant_id', tenantId).order('period_start', { ascending: false }).limit(12); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
