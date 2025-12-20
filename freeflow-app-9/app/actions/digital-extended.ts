'use server'

/**
 * Extended Digital Server Actions
 * Tables: digital_assets, digital_downloads, digital_licenses, digital_products
 */

import { createClient } from '@/lib/supabase/server'

export async function getDigitalAsset(assetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_assets').select('*, digital_licenses(*)').eq('id', assetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDigitalAsset(assetData: { user_id: string; name: string; type: string; file_url: string; file_size?: number; format?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_assets').insert({ ...assetData, status: 'active', download_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDigitalAsset(assetId: string, updates: Partial<{ name: string; description: string; file_url: string; status: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_assets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDigitalAssets(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('digital_assets').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordDownload(downloadData: { asset_id: string; user_id?: string; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_downloads').insert({ ...downloadData, downloaded_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_download_count', { asset_id: downloadData.asset_id }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDownloadHistory(assetId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_downloads').select('*').eq('asset_id', assetId).order('downloaded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDigitalLicense(licenseData: { asset_id: string; user_id: string; type: string; expires_at?: string; max_downloads?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('digital_licenses').insert({ ...licenseData, status: 'active', downloads_used: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLicenses(userId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('digital_licenses').select('*, digital_assets(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDigitalProducts(options?: { category?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('digital_products').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
