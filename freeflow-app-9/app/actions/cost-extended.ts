'use server'

/**
 * Extended Cost Server Actions
 * Tables: costs, cost_centers, cost_categories, cost_allocations
 */

import { createClient } from '@/lib/supabase/server'

export async function getCost(costId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('costs').select('*, cost_allocations(*)').eq('id', costId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCost(costData: { user_id: string; description: string; amount: number; currency?: string; category_id?: string; cost_center_id?: string; date: string; vendor?: string; invoice_number?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('costs').insert({ ...costData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCost(costId: string, updates: Partial<{ description: string; amount: number; category_id: string; cost_center_id: string; date: string; status: string; vendor: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('costs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', costId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCost(costId: string) {
  try { const supabase = await createClient(); await supabase.from('cost_allocations').delete().eq('cost_id', costId); const { error } = await supabase.from('costs').delete().eq('id', costId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCosts(options?: { user_id?: string; category_id?: string; cost_center_id?: string; status?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('costs').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.cost_center_id) query = query.eq('cost_center_id', options.cost_center_id); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function approveCost(costId: string, approverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('costs').update({ status: 'approved', approved_by: approverId, approved_at: new Date().toISOString() }).eq('id', costId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectCost(costId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('costs').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString() }).eq('id', costId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCostCenters(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('cost_centers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCostCategories(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('cost_categories').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function allocateCost(allocationData: { cost_id: string; department_id?: string; project_id?: string; percentage: number; amount: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cost_allocations').insert({ ...allocationData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
