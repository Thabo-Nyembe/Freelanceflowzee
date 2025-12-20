'use server'

/**
 * Extended Team Server Actions - Covers all 19 Team-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTeamActivity(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_activity').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logTeamActivity(teamId: string, userId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_activity').insert({ team_id: teamId, user_id: userId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamAnalytics(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_analytics').select('*').eq('team_id', teamId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTeamAnnouncements(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_announcements').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamAnnouncement(teamId: string, userId: string, input: { title: string; content: string; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_announcements').insert({ team_id: teamId, created_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamComments(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamComment(taskId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_comments').insert({ task_id: taskId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamCommunicationRecipients(communicationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_communication_recipients').select('*').eq('communication_id', communicationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTeamCommunications(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_communications').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamCommunication(teamId: string, userId: string, input: { type: string; subject: string; content: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_communications').insert({ team_id: teamId, created_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamInvitations(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_invitations').select('*').eq('team_id', teamId).eq('status', 'pending'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamInvitation(teamId: string, email: string, role: string = 'member') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_invitations').insert({ team_id: teamId, email, role, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTeamInvitationStatus(invitationId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_invitations').update({ status }).eq('id', invitationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamMeetingAttendees(meetingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_meeting_attendees').select('*').eq('meeting_id', meetingId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTeamMeetingAttendee(meetingId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_meeting_attendees').insert({ meeting_id: meetingId, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamMeetings(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_meetings').select('*').eq('team_id', teamId).order('scheduled_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamMeeting(teamId: string, userId: string, input: { title: string; scheduled_at: string; duration?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_meetings').insert({ team_id: teamId, created_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamPerformance(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_performance').select('*').eq('team_id', teamId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTeamPerformanceMetrics(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_performance_metrics').select('*').eq('team_id', teamId).order('date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTeamPermissions(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_permissions').select('*').eq('team_id', teamId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setTeamPermission(teamId: string, userId: string, permission: string, allowed: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_permissions').upsert({ team_id: teamId, user_id: userId, permission, allowed }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamProjectMembers(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_project_members').select('*').eq('project_id', projectId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTeamProjectMember(projectId: string, userId: string, role: string = 'member') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_project_members').insert({ project_id: projectId, user_id: userId, role }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamProjects(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_projects').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamProject(teamId: string, input: { name: string; description?: string; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_projects').insert({ team_id: teamId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamShares(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_shares').select('*').eq('team_id', teamId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamShare(teamId: string, resourceType: string, resourceId: string, permissions: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_shares').insert({ team_id: teamId, resource_type: resourceType, resource_id: resourceId, permissions }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamSkills(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_skills').select('*').eq('team_id', teamId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTeamSkill(teamId: string, userId: string, skill: string, level?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_skills').insert({ team_id: teamId, user_id: userId, skill, level }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamStats(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_stats').select('*').eq('team_id', teamId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamTasks(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_tasks').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeamTask(teamId: string, input: { title: string; description?: string; assignee_id?: string; priority?: string; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_tasks').insert({ team_id: teamId, status: 'pending', ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTeamTaskStatus(taskId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_tasks').update({ status }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeamTimeTracking(teamId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_time_tracking').select('*').eq('team_id', teamId).order('started_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startTeamTimeTracking(teamId: string, userId: string, taskId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_time_tracking').insert({ team_id: teamId, user_id: userId, task_id: taskId, started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopTeamTimeTracking(entryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('team_time_tracking').update({ ended_at: new Date().toISOString() }).eq('id', entryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTeams(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('teams').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTeam(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('teams').insert({ owner_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTeam(teamId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('teams').update(updates).eq('id', teamId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTeam(teamId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('teams').delete().eq('id', teamId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
