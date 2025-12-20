'use server'

/**
 * Extended Mobile Server Actions - Covers all Mobile-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMobileDevices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_devices').select('*').eq('user_id', userId).order('last_active_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMobileDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_devices').select('*').eq('id', deviceId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function registerMobileDevice(userId: string, input: { device_id: string; device_type: string; device_name?: string; os_version?: string; app_version?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_devices').upsert({ user_id: userId, ...input, is_active: true, last_active_at: new Date().toISOString() }, { onConflict: 'device_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMobileDeviceActivity(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_devices').update({ last_active_at: new Date().toISOString() }).eq('device_id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateMobileDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_devices').update({ is_active: false, deactivated_at: new Date().toISOString() }).eq('id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMobileDevice(deviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mobile_devices').delete().eq('id', deviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMobilePushTokens(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_push_tokens').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerPushToken(userId: string, deviceId: string, input: { token: string; platform: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_push_tokens').upsert({ user_id: userId, device_id: deviceId, ...input, is_active: true, registered_at: new Date().toISOString() }, { onConflict: 'device_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivatePushToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_push_tokens').update({ is_active: false }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateAllPushTokens(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mobile_push_tokens').update({ is_active: false }).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePushToken(tokenId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mobile_push_tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivePushTokensForUser(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mobile_push_tokens').select('token, platform').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
