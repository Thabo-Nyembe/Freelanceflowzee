'use server'

/**
 * Extended Analytics Server Actions - Covers all 21 Analytics-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsAIUsage(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_ai_usage').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsAlerts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_alerts').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsAlert(userId: string, input: { name: string; condition: any; threshold: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_alerts').insert({ ...input, user_id: userId, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsCohorts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_cohorts').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsConversionFunnels(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_conversion_funnels').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsConversionFunnel(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_conversion_funnels').insert({ ...input, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsDailyMetrics(userId: string, days = 30) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_daily_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(days); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsDashboardFilters(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_dashboard_filters').select('*').eq('dashboard_id', dashboardId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsDashboardWidgets(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_dashboard_widgets').select('*').eq('dashboard_id', dashboardId).order('position', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsDashboards(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_dashboards').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsDashboard(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_dashboards').insert({ ...input, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsEvents(userId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackAnalyticsEvent(userId: string, eventType: string, metadata?: any) {
  try { const supabase = await createClient(); const { error } = await supabase.from('analytics_events').insert({ user_id: userId, event_type: eventType, metadata }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsFeatureUsage(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_feature_usage').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsFunnelStages(funnelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_funnel_stages').select('*').eq('funnel_id', funnelId).order('stage_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsGoals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_goals').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsGoal(userId: string, input: { name: string; target: number; metric: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_goals').insert({ ...input, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsInsights(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_insights').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsMetrics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_metrics').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsMonthlyMetrics(userId: string, months = 12) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_monthly_metrics').select('*').eq('user_id', userId).order('month', { ascending: false }).limit(months); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsPlatformMetrics() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_platform_metrics').select('*').order('created_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsRealtimeMetrics() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_realtime_metrics').select('*').order('timestamp', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsReports(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsReport(userId: string, input: { name: string; type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_reports').insert({ ...input, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsRevenue(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_revenue').select('*').eq('user_id', userId).order('date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnalyticsSegments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_segments').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAnalyticsSegment(userId: string, input: { name: string; conditions: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_segments').insert({ ...input, user_id: userId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalyticsUserActivity(userId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('analytics_user_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
