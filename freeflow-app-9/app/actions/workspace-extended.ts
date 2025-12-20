'use server'

/**
 * Extended Workspace Server Actions - Covers all Workspace-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getWorkspace(workspaceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspaces').select('*').eq('id', workspaceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWorkspace(workspaceData: { name: string; slug?: string; description?: string; logo_url?: string; settings?: Record<string, any>; plan_id?: string; owner_id: string }) {
  try { const supabase = await createClient(); const slug = workspaceData.slug || workspaceData.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('workspaces').insert({ ...workspaceData, slug, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('workspace_members').insert({ workspace_id: data.id, user_id: workspaceData.owner_id, role: 'owner', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWorkspace(workspaceId: string, updates: Partial<{ name: string; description: string; logo_url: string; settings: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspaces').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', workspaceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWorkspace(workspaceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkspaces(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_members').select('workspace_id, role, workspaces(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data?.map(wm => ({ ...wm.workspaces, role: wm.role })) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addWorkspaceMember(workspaceId: string, userId: string, role: string = 'member') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_members').insert({ workspace_id: workspaceId, user_id: userId, role, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeWorkspaceMember(workspaceId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('workspace_members').delete().eq('workspace_id', workspaceId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMemberRole(workspaceId: string, userId: string, role: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_members').update({ role, updated_at: new Date().toISOString() }).eq('workspace_id', workspaceId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkspaceMembers(workspaceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_members').select('*, users(id, email, full_name, avatar_url)').eq('workspace_id', workspaceId).order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function inviteToWorkspace(workspaceId: string, email: string, role: string, invitedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_invitations').insert({ workspace_id: workspaceId, email, role, invited_by: invitedBy, status: 'pending', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptWorkspaceInvitation(invitationId: string, userId: string) {
  try { const supabase = await createClient(); const { data: invitation, error: fetchError } = await supabase.from('workspace_invitations').select('*').eq('id', invitationId).single(); if (fetchError) throw fetchError; if (invitation.status !== 'pending') throw new Error('Invitation is no longer valid'); await supabase.from('workspace_members').insert({ workspace_id: invitation.workspace_id, user_id: userId, role: invitation.role, joined_at: new Date().toISOString() }); const { data, error } = await supabase.from('workspace_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWorkspaceSettings(workspaceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_settings').select('*').eq('workspace_id', workspaceId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateWorkspaceSettings(workspaceId: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('workspace_settings').upsert({ workspace_id: workspaceId, key, value, updated_at: new Date().toISOString() }, { onConflict: 'workspace_id,key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
