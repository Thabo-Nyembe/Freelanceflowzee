'use server'

/**
 * Extended User Server Actions - Covers all 11 User-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUserActivityLogs(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logUserActivity(userId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_activity_logs').insert({ user_id: userId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserAnalytics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_analytics').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserAnalytics(userId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_analytics').upsert({ user_id: userId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserCohorts() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_cohorts').select('*').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createUserCohort(name: string, criteria: any, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_cohorts').insert({ name, criteria, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserDataExports(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_data_exports').select('*').eq('user_id', userId).order('requested_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function requestUserDataExport(userId: string, exportType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_data_exports').insert({ user_id: userId, export_type: exportType, status: 'pending', requested_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserDataExportStatus(exportId: string, status: string, downloadUrl?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_data_exports').update({ status, download_url: downloadUrl, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserKnownDevices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_known_devices').select('*').eq('user_id', userId).order('last_used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerUserDevice(userId: string, deviceInfo: { device_name: string; device_type: string; browser?: string; os?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_known_devices').insert({ user_id: userId, ...deviceInfo, last_used_at: new Date().toISOString(), is_trusted: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trustUserDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_known_devices').update({ is_trusted: true }).eq('id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeUserDevice(deviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_known_devices').delete().eq('id', deviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserMetrics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_metrics').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserMetrics(userId: string, metrics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_metrics').upsert({ user_id: userId, ...metrics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserMetricsAggregate(startDate?: string, endDate?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('user_metrics_aggregate').select('*').order('date', { ascending: false })
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    const { data, error } = await query.limit(90)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserPermissions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_permissions').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function grantUserPermission(userId: string, permission: string, grantedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_permissions').insert({ user_id: userId, permission, granted_by: grantedBy }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeUserPermission(userId: string, permission: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_permissions').delete().eq('user_id', userId).eq('permission', permission); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserPreferences(userId: string, preferences: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_preferences').upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSecurityPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_security_preferences').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserSecurityPreferences(userId: string, preferences: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_security_preferences').upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTypeProfiles(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_type_profiles').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createUserTypeProfile(userId: string, userType: string, profileData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_type_profiles').insert({ user_id: userId, user_type: userType, profile_data: profileData }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserTypeProfile(profileId: string, profileData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_type_profiles').update({ profile_data: profileData, updated_at: new Date().toISOString() }).eq('id', profileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
