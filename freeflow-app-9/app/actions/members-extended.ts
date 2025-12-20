'use server'

/**
 * Extended Members Server Actions
 * Tables: members, member_roles, member_permissions, member_invitations, member_activities, member_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getMember(memberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('members').select('*, member_roles(*), member_permissions(*), member_preferences(*)').eq('id', memberId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMember(memberData: { user_id: string; organization_id: string; role_id?: string; title?: string; department?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('members').insert({ ...memberData, status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMember(memberId: string, updates: Partial<{ role_id: string; title: string; department: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('members').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', memberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMember(memberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('members').update({ status: 'removed', removed_at: new Date().toISOString() }).eq('id', memberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMembers(organizationId: string, options?: { status?: string; role_id?: string; department?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('members').select('*, member_roles(*)').eq('organization_id', organizationId); if (options?.status) query = query.eq('status', options.status); if (options?.role_id) query = query.eq('role_id', options.role_id); if (options?.department) query = query.eq('department', options.department); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRole(roleData: { name: string; description?: string; organization_id: string; permissions?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_roles').insert({ ...roleData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRole(roleId: string, updates: Partial<{ name: string; description: string; permissions: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_roles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRole(roleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('member_roles').delete().eq('id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoles(organizationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_roles').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInvitation(invitationData: { email: string; organization_id: string; role_id?: string; invited_by: string; message?: string }) {
  try { const supabase = await createClient(); const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2); const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7); const { data, error } = await supabase.from('member_invitations').insert({ ...invitationData, token, status: 'pending', expires_at: expiresAt.toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptInvitation(token: string, userId: string) {
  try { const supabase = await createClient(); const { data: invitation, error: invError } = await supabase.from('member_invitations').select('*').eq('token', token).eq('status', 'pending').single(); if (invError) throw new Error('Invalid or expired invitation'); if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitation expired'); await supabase.from('member_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id); const { data, error } = await supabase.from('members').insert({ user_id: userId, organization_id: invitation.organization_id, role_id: invitation.role_id, status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInvitations(organizationId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('member_invitations').select('*').eq('organization_id', organizationId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function cancelInvitation(invitationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_invitations').update({ status: 'cancelled' }).eq('id', invitationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logActivity(memberId: string, activity: { action: string; resource_type?: string; resource_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_activities').insert({ member_id: memberId, ...activity, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivities(memberId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('member_activities').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updatePreferences(memberId: string, preferences: Record<string, any>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('member_preferences').select('id').eq('member_id', memberId).single(); if (existing) { const { data, error } = await supabase.from('member_preferences').update({ ...preferences, updated_at: new Date().toISOString() }).eq('member_id', memberId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('member_preferences').insert({ member_id: memberId, ...preferences, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
