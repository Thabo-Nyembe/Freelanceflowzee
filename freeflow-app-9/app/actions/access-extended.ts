'use server'

/**
 * Extended Access Server Actions - Covers all Access-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAccessLogs(userId?: string, resourceType?: string, action?: string, startDate?: string, endDate?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (resourceType) query = query.eq('resource_type', resourceType); if (action) query = query.eq('action', action); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logAccess(input: { user_id: string; action: string; resource_type: string; resource_id?: string; ip_address?: string; user_agent?: string; metadata?: any; success?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('access_logs').insert({ ...input, success: input.success ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccessLogsByResource(resourceType: string, resourceId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('access_logs').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAccessLogSummary(userId: string, days = 30) {
  try { const supabase = await createClient(); const startDate = new Date(); startDate.setDate(startDate.getDate() - days); const { data, error } = await supabase.from('access_logs').select('action, success').eq('user_id', userId).gte('created_at', startDate.toISOString()); if (error) throw error; const summary = { total: data?.length || 0, successful: data?.filter(l => l.success).length || 0, failed: data?.filter(l => !l.success).length || 0, actions: {} as Record<string, number> }; data?.forEach(l => { summary.actions[l.action] = (summary.actions[l.action] || 0) + 1; }); return { success: true, data: summary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupOldAccessLogs(daysToKeep = 90) {
  try { const supabase = await createClient(); const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - daysToKeep); const { error } = await supabase.from('access_logs').delete().lt('created_at', cutoffDate.toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAccessTokens(userId?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('access_tokens').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAccessToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('access_tokens').select('*').eq('id', tokenId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAccessToken(input: { user_id: string; name: string; scopes?: string[]; expires_at?: string }) {
  try { const supabase = await createClient(); const token = generateAccessToken(); const { data, error } = await supabase.from('access_tokens').insert({ ...input, token, is_active: true }).select().single(); if (error) throw error; return { success: true, data: { ...data, token } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateAccessToken(): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let token = 'at_'; for (let i = 0; i < 48; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)); } return token; }

export async function revokeAccessToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('access_tokens').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAccessToken(tokenId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('access_tokens').delete().eq('id', tokenId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateAccessToken(token: string) {
  try { const supabase = await createClient(); const { data: tokenData, error } = await supabase.from('access_tokens').select('*').eq('token', token).single(); if (error) throw new Error('Invalid token'); if (!tokenData.is_active) throw new Error('Token is revoked'); if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) throw new Error('Token expired'); await supabase.from('access_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenData.id); return { success: true, data: { valid: true, token: tokenData } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeAllUserAccessTokens(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('access_tokens').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
