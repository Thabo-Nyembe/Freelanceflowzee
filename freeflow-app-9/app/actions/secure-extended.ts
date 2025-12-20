'use server'

/**
 * Extended Secure Server Actions - Covers all Secure-related tables
 * Tables: secure_file_deliveries, secure_share_tokens
 */

import { createClient } from '@/lib/supabase/server'

export async function getSecureFileDelivery(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSecureFileDelivery(deliveryData: { owner_id: string; recipient_id?: string; recipient_email?: string; file_id?: string; file_url?: string; file_name: string; file_size?: number; file_type?: string; description?: string; password?: string; expires_at?: string; max_downloads?: number; require_login?: boolean; escrow_id?: string; gallery_id?: string }) {
  try { const supabase = await createClient(); const accessToken = crypto.randomUUID(); const { data, error } = await supabase.from('secure_file_deliveries').insert({ ...deliveryData, access_token: accessToken, status: 'pending', download_count: 0, require_login: deliveryData.require_login ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSecureFileDelivery(deliveryId: string, updates: Partial<{ description: string; password: string; expires_at: string; max_downloads: number; require_login: boolean; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSecureFileDelivery(deliveryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('secure_file_deliveries').delete().eq('id', deliveryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecureFileDeliveries(options?: { owner_id?: string; recipient_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('secure_file_deliveries').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.recipient_id) query = query.eq('recipient_id', options.recipient_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSecureFileDeliveryByToken(accessToken: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').select('*').eq('access_token', accessToken).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid or expired link' }; if (data.expires_at && new Date(data.expires_at) < new Date()) { await supabase.from('secure_file_deliveries').update({ status: 'expired' }).eq('id', data.id); return { success: false, error: 'This link has expired' } }; if (data.max_downloads && data.download_count >= data.max_downloads) { return { success: false, error: 'Download limit reached' } }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifySecureDeliveryPassword(deliveryId: string, password: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').select('password').eq('id', deliveryId).single(); if (error) throw error; if (!data.password) return { success: true, verified: true }; return { success: true, verified: data.password === password } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', verified: false } }
}

export async function recordSecureFileDownload(deliveryId: string, downloadData?: { ip_address?: string; user_agent?: string; downloaded_by?: string }) {
  try { const supabase = await createClient(); const { data: delivery } = await supabase.from('secure_file_deliveries').select('download_count').eq('id', deliveryId).single(); const { data, error } = await supabase.from('secure_file_deliveries').update({ download_count: (delivery?.download_count || 0) + 1, last_downloaded_at: new Date().toISOString(), last_download_ip: downloadData?.ip_address, last_download_user_agent: downloadData?.user_agent, status: 'downloaded', updated_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeSecureFileDelivery(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').update({ status: 'revoked', revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function extendSecureFileDelivery(deliveryId: string, newExpiresAt: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').update({ expires_at: newExpiresAt, status: 'pending', updated_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecureShareToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_share_tokens').select('*').eq('id', tokenId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSecureShareToken(tokenData: { video_id?: string; file_id?: string; created_by: string; expires_at?: string; max_views?: number; password?: string; allow_download?: boolean }) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const { data, error } = await supabase.from('secure_share_tokens').insert({ ...tokenData, token, view_count: 0, allow_download: tokenData.allow_download ?? false, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecureShareTokenByToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_share_tokens').select('*').eq('token', token).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid or inactive share link' }; if (data.expires_at && new Date(data.expires_at) < new Date()) { await supabase.from('secure_share_tokens').update({ is_active: false }).eq('id', data.id); return { success: false, error: 'This share link has expired' } }; if (data.max_views && data.view_count >= data.max_views) { return { success: false, error: 'View limit reached' } }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordSecureShareTokenView(tokenId: string) {
  try { const supabase = await createClient(); const { data: token } = await supabase.from('secure_share_tokens').select('view_count').eq('id', tokenId).single(); const { data, error } = await supabase.from('secure_share_tokens').update({ view_count: (token?.view_count || 0) + 1, last_viewed_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateSecureShareToken(tokenId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_share_tokens').update({ is_active: false, deactivated_at: new Date().toISOString() }).eq('id', tokenId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserSecureShareTokens(userId: string, options?: { video_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('secure_share_tokens').select('*').eq('created_by', userId); if (options?.video_id) query = query.eq('video_id', options.video_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSecureDeliveryStats(ownerId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('secure_file_deliveries').select('status, download_count').eq('owner_id', ownerId); if (!data) return { success: true, data: { total: 0, byStatus: {}, totalDownloads: 0 } }; const byStatus = data.reduce((acc: Record<string, number>, d) => { acc[d.status || 'unknown'] = (acc[d.status || 'unknown'] || 0) + 1; return acc }, {}); const totalDownloads = data.reduce((sum, d) => sum + (d.download_count || 0), 0); return { success: true, data: { total: data.length, byStatus, totalDownloads } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byStatus: {}, totalDownloads: 0 } } }
}

export async function cleanupExpiredDeliveries() {
  try { const supabase = await createClient(); const { error } = await supabase.from('secure_file_deliveries').update({ status: 'expired' }).lt('expires_at', new Date().toISOString()).eq('status', 'pending'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
