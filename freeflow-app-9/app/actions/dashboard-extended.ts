'use server'

/**
 * Extended Dashboard Server Actions - Covers all 11 Dashboard-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDashboardActivities(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logDashboardActivity(userId: string, activityType: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_activities').insert({ user_id: userId, activity_type: activityType, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardGoalMilestones(goalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goal_milestones').select('*').eq('goal_id', goalId).order('target_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboardGoalMilestone(goalId: string, input: { name: string; target_value: number; target_date: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goal_milestones').insert({ goal_id: goalId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardGoalMilestone(milestoneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goal_milestones').update(updates).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardGoals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboardGoal(userId: string, input: { name: string; target_value: number; current_value?: number; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goals').insert({ user_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardGoal(goalId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDashboardGoal(goalId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_goals').delete().eq('id', goalId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardInsights(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_insights').select('*').eq('user_id', userId).eq('is_active', true).order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboardInsight(userId: string, input: { title: string; description: string; type: string; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_insights').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissDashboardInsight(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_insights').update({ is_active: false, dismissed_at: new Date().toISOString() }).eq('id', insightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardMetrics(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_metrics').select('*').eq('dashboard_id', dashboardId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDashboardMetric(dashboardId: string, input: { name: string; type: string; config: any; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_metrics').insert({ dashboard_id: dashboardId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardMetric(metricId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_metrics').update(updates).eq('id', metricId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDashboardMetric(metricId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_metrics').delete().eq('id', metricId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardNotifications(userId: string, unreadOnly?: boolean) {
  try {
    const supabase = await createClient()
    let query = supabase.from('dashboard_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (unreadOnly) query = query.eq('is_read', false)
    const { data, error } = await query.limit(50)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markDashboardNotificationRead(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllDashboardNotificationsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardProjects(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function pinDashboardProject(userId: string, projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_projects').upsert({ user_id: userId, project_id: projectId, is_pinned: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpinDashboardProject(userId: string, projectId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_projects').delete().eq('user_id', userId).eq('project_id', projectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardQuickActions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_quick_actions').select('*').eq('user_id', userId).eq('is_enabled', true).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDashboardQuickAction(userId: string, input: { name: string; action_type: string; config: any; icon?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_quick_actions').insert({ user_id: userId, ...input, is_enabled: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardQuickAction(actionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_quick_actions').update(updates).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_stats').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardStats(userId: string, stats: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_stats').upsert({ user_id: userId, ...stats, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardTimelineEvents(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_timeline_events').select('*').eq('user_id', userId).order('event_date', { ascending: false }).limit(limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboardTimelineEvent(userId: string, input: { title: string; description?: string; event_date: string; event_type: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_timeline_events').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboards(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboard(userId: string, input: { name: string; description?: string; layout?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboard(dashboardId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', dashboardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDashboard(dashboardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboards').delete().eq('id', dashboardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
