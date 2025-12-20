'use server'

/**
 * Extended Organizations Server Actions
 * Tables: organizations, organization_members, organization_roles, organization_invitations, organization_settings, organization_departments
 */

import { createClient } from '@/lib/supabase/server'

export async function getOrganization(organizationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organizations').select('*, organization_members(*, users(*)), organization_roles(*), organization_departments(*)').eq('id', organizationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOrganization(orgData: { name: string; slug: string; description?: string; owner_id: string; type?: string; industry?: string; logo_url?: string; website?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organizations').insert({ ...orgData, status: 'active', plan: 'free', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('organization_members').insert({ organization_id: data.id, user_id: orgData.owner_id, role: 'owner', status: 'active', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOrganization(organizationId: string, updates: Partial<{ name: string; description: string; logo_url: string; website: string; industry: string; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organizations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', organizationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOrganization(organizationId: string) {
  try { const supabase = await createClient(); await supabase.from('organization_members').delete().eq('organization_id', organizationId); await supabase.from('organization_roles').delete().eq('organization_id', organizationId); await supabase.from('organization_invitations').delete().eq('organization_id', organizationId); await supabase.from('organization_departments').delete().eq('organization_id', organizationId); await supabase.from('organization_settings').delete().eq('organization_id', organizationId); const { error } = await supabase.from('organizations').delete().eq('id', organizationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOrganizations(options?: { owner_id?: string; status?: string; type?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('organizations').select('*, organization_members(count)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMember(organizationId: string, memberData: { user_id: string; role?: string; department_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_members').insert({ organization_id: organizationId, ...memberData, role: memberData.role || 'member', status: 'active', joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMember(memberId: string, updates: Partial<{ role: string; department_id: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_members').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', memberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMember(memberId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('organization_members').delete().eq('id', memberId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMembers(organizationId: string, options?: { role?: string; department_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('organization_members').select('*, users(*)').eq('organization_id', organizationId); if (options?.role) query = query.eq('role', options.role); if (options?.department_id) query = query.eq('department_id', options.department_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('joined_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRole(organizationId: string, roleData: { name: string; permissions: string[]; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_roles').insert({ organization_id: organizationId, ...roleData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRole(roleId: string, updates: Partial<{ name: string; permissions: string[]; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_roles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInvitation(organizationId: string, invitationData: { email: string; role?: string; invited_by: string; expires_at?: string }) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('organization_invitations').insert({ organization_id: organizationId, ...invitationData, token, role: invitationData.role || 'member', status: 'pending', expires_at: invitationData.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptInvitation(token: string, userId: string) {
  try { const supabase = await createClient(); const { data: invitation, error: findError } = await supabase.from('organization_invitations').select('*').eq('token', token).eq('status', 'pending').single(); if (findError || !invitation) return { success: false, error: 'Invalid or expired invitation' }; if (new Date(invitation.expires_at) < new Date()) return { success: false, error: 'Invitation has expired' }; await supabase.from('organization_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id); await supabase.from('organization_members').insert({ organization_id: invitation.organization_id, user_id: userId, role: invitation.role, status: 'active', joined_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDepartment(organizationId: string, deptData: { name: string; description?: string; parent_id?: string; manager_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('organization_departments').insert({ organization_id: organizationId, ...deptData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSettings(organizationId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('organization_settings').select('id').eq('organization_id', organizationId).single(); if (existing) { const { data, error } = await supabase.from('organization_settings').update({ settings, updated_at: new Date().toISOString() }).eq('organization_id', organizationId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('organization_settings').insert({ organization_id: organizationId, settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function transferOwnership(organizationId: string, newOwnerId: string) {
  try { const supabase = await createClient(); const { data: org } = await supabase.from('organizations').select('owner_id').eq('id', organizationId).single(); if (org) { await supabase.from('organization_members').update({ role: 'admin' }).eq('organization_id', organizationId).eq('user_id', org.owner_id) } await supabase.from('organization_members').update({ role: 'owner' }).eq('organization_id', organizationId).eq('user_id', newOwnerId); const { data, error } = await supabase.from('organizations').update({ owner_id: newOwnerId, updated_at: new Date().toISOString() }).eq('id', organizationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
