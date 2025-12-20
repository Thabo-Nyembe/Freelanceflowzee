'use server'

/**
 * Extended Teams Server Actions
 * Tables: teams, team_members, team_roles, team_invitations, team_settings, team_activities
 */

import { createClient } from '@/lib/supabase/server'

export async function getTeam(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('teams').select('*, team_members(*, users(*)), team_roles(*), team_settings(*)').eq('id', teamId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTeam(teamData: { name: string; description?: string; team_type?: string; owner_id: string; avatar_url?: string; is_private?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data: team, error: teamError } = await supabase.from('teams').insert({ ...teamData, is_private: teamData.is_private ?? false, member_count: 1, created_at: new Date().toISOString() }).select().single(); if (teamError) throw teamError; await supabase.from('team_members').insert({ team_id: team.id, user_id: teamData.owner_id, role: 'owner', is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }); await logActivity(team.id, teamData.owner_id, 'team_created', { team_name: teamData.name }); return { success: true, data: team } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTeam(teamId: string, updates: Partial<{ name: string; description: string; team_type: string; avatar_url: string; is_private: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('teams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', teamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTeam(teamId: string) {
  try { const supabase = await createClient(); await supabase.from('team_members').delete().eq('team_id', teamId); await supabase.from('team_invitations').delete().eq('team_id', teamId); await supabase.from('team_roles').delete().eq('team_id', teamId); await supabase.from('team_settings').delete().eq('team_id', teamId); await supabase.from('team_activities').delete().eq('team_id', teamId); const { error } = await supabase.from('teams').delete().eq('id', teamId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeams(options?: { team_type?: string; owner_id?: string; is_private?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('teams').select('*, team_members(count)'); if (options?.team_type) query = query.eq('team_type', options.team_type); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMember(teamId: string, userId: string, role: string = 'member', addedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('team_members').select('id').eq('team_id', teamId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'User is already a member' }; const { data, error } = await supabase.from('team_members').insert({ team_id: teamId, user_id: userId, role, added_by: addedBy, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await updateMemberCount(teamId); await logActivity(teamId, addedBy || userId, 'member_added', { user_id: userId, role }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMember(teamId: string, userId: string, removedBy?: string) {
  try { const supabase = await createClient(); const { data: member } = await supabase.from('team_members').select('role').eq('team_id', teamId).eq('user_id', userId).single(); if (member?.role === 'owner') return { success: false, error: 'Cannot remove team owner' }; const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId); if (error) throw error; await updateMemberCount(teamId); await logActivity(teamId, removedBy || userId, 'member_removed', { user_id: userId }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMemberRole(teamId: string, userId: string, newRole: string, updatedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_members').update({ role: newRole, updated_at: new Date().toISOString() }).eq('team_id', teamId).eq('user_id', userId).select().single(); if (error) throw error; await logActivity(teamId, updatedBy || userId, 'role_changed', { user_id: userId, new_role: newRole }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateMemberCount(teamId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', teamId).eq('is_active', true)
  await supabase.from('teams').update({ member_count: count || 0, updated_at: new Date().toISOString() }).eq('id', teamId)
}

export async function getMembers(teamId: string, options?: { role?: string; is_active?: boolean; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('team_members').select('*, users(*)').eq('team_id', teamId); if (options?.role) query = query.eq('role', options.role); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function inviteMember(teamId: string, email: string, role: string = 'member', invitedBy: string) {
  try { const supabase = await createClient(); const token = generateInviteToken(); const { data, error } = await supabase.from('team_invitations').insert({ team_id: teamId, email, role, invited_by: invitedBy, token, status: 'pending', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await logActivity(teamId, invitedBy, 'invitation_sent', { email, role }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return token
}

export async function acceptInvitation(token: string, userId: string) {
  try { const supabase = await createClient(); const { data: invitation } = await supabase.from('team_invitations').select('*').eq('token', token).eq('status', 'pending').single(); if (!invitation) return { success: false, error: 'Invalid or expired invitation' }; if (new Date(invitation.expires_at) < new Date()) return { success: false, error: 'Invitation has expired' }; await supabase.from('team_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', invitation.id); const result = await addMember(invitation.team_id, userId, invitation.role, invitation.invited_by); return result } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingInvitations(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_invitations').select('*, users(*)').eq('team_id', teamId).eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

async function logActivity(teamId: string, userId: string, activityType: string, details?: any) {
  const supabase = await createClient()
  await supabase.from('team_activities').insert({ team_id: teamId, user_id: userId, activity_type: activityType, details, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getActivities(teamId: string, options?: { activity_type?: string; user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('team_activities').select('*, users(*)').eq('team_id', teamId); if (options?.activity_type) query = query.eq('activity_type', options.activity_type); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(teamId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const settingsArray = Object.entries(settings).map(([key, value]) => ({ team_id: teamId, setting_key: key, setting_value: value, updated_at: new Date().toISOString() })); for (const setting of settingsArray) { await supabase.from('team_settings').upsert(setting, { onConflict: 'team_id,setting_key' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettings(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_settings').select('*').eq('team_id', teamId); if (error) throw error; const settingsMap: Record<string, any> = {}; data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value }); return { success: true, data: settingsMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getUserTeams(userId: string, options?: { role?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('team_members').select('*, teams(*)').eq('user_id', userId); if (options?.role) query = query.eq('role', options.role); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('joined_at', { ascending: false }); if (error) throw error; return { success: true, data: (data || []).map(m => ({ ...m.teams, membership: m })) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

