'use server'

/**
 * Extended Add-ons Server Actions
 * Tables: add_ons, add_on_installations, add_on_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getAddOn(addOnId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('add_ons').select('*').eq('id', addOnId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAddOn(addOnData: { name: string; description?: string; developer_id: string; category?: string; version?: string; price?: number; pricing_type?: string; icon_url?: string; features?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('add_ons').insert({ ...addOnData, status: 'draft', install_count: 0, rating: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAddOn(addOnId: string, updates: Partial<{ name: string; description: string; category: string; version: string; price: number; status: string; icon_url: string; features: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('add_ons').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', addOnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAddOn(addOnId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('add_ons').delete().eq('id', addOnId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAddOns(options?: { category?: string; status?: string; pricing_type?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('add_ons').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.pricing_type) query = query.eq('pricing_type', options.pricing_type); if (options?.search) query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`); const { data, error } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installAddOn(userId: string, addOnId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('add_on_installations').select('id').eq('user_id', userId).eq('add_on_id', addOnId).single(); if (existing) return { success: false, error: 'Already installed' }; const { data, error } = await supabase.from('add_on_installations').insert({ user_id: userId, add_on_id: addOnId, is_active: true, installed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallAddOn(userId: string, addOnId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('add_on_installations').delete().eq('user_id', userId).eq('add_on_id', addOnId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserAddOns(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('add_on_installations').select('*, add_ons(*)').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishAddOn(addOnId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('add_ons').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', addOnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
