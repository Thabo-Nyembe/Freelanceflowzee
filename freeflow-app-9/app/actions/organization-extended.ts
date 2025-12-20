'use server'

/**
 * Extended Organization Server Actions - Covers all Organization-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getOrganization(orgId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organizations').select('*').eq('id', orgId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOrganization(orgData: { name: string; slug?: string; description?: string; logo_url?: string; website?: string; industry?: string; size?: string; settings?: Record<string, any>; owner_id: string }) {
  try { const supabase = await createClient(); const slug = orgData.slug || orgData.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('organizations').insert({ ...orgData, slug, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('organization_members').insert({ organization_id: data.id, user_id: orgData.owner_id, role: 'owner', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrganization(orgId: string, updates: Partial<{ name: string; description: string; logo_url: string; website: string; industry: string; size: string; settings: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organizations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', orgId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOrganization(orgId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('organizations').delete().eq('id', orgId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrganizations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_members').select('organization_id, role, organizations(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data?.map(om => ({ ...om.organizations, role: om.role })) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addOrganizationMember(orgId: string, userId: string, role: string = 'member', department?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_members').insert({ organization_id: orgId, user_id: userId, role, department, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeOrganizationMember(orgId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('organization_members').delete().eq('organization_id', orgId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrganizationMembers(orgId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_members').select('*, users(id, email, full_name, avatar_url)').eq('organization_id', orgId).order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrganizationDepartments(orgId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_departments').select('*').eq('organization_id', orgId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDepartment(orgId: string, departmentData: { name: string; description?: string; parent_id?: string; head_user_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_departments').insert({ organization_id: orgId, ...departmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrganizationRoles(orgId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_roles').select('*').eq('organization_id', orgId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOrganizationBilling(orgId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_billing').select('*').eq('organization_id', orgId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
