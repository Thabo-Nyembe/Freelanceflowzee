'use server'

/**
 * Extended Sales Server Actions
 * Tables: sales, sales_orders, sales_targets, sales_pipeline
 */

import { createClient } from '@/lib/supabase/server'

export async function getSale(saleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sales').select('*').eq('id', saleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSale(saleData: { user_id: string; client_id?: string; amount: number; currency?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sales').insert({ ...saleData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSale(saleId: string, updates: Partial<{ amount: number; status: string; description: string; closed_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sales').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', saleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSales(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sales').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalesOrders(options?: { user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sales_orders').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalesTargets(options?: { user_id?: string; period?: string; year?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sales_targets').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.period) query = query.eq('period', options.period); if (options?.year) query = query.eq('year', options.year); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalesPipeline(options?: { user_id?: string; stage?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('sales_pipeline').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.stage) query = query.eq('stage', options.stage); const { data, error } = await query.order('value', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSalesMetrics(userId: string, options?: { period?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sales').select('amount, status').eq('user_id', userId); if (error) throw error; const total = data?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0; const closed = data?.filter(s => s.status === 'closed').reduce((sum, s) => sum + (s.amount || 0), 0) || 0; return { success: true, data: { total, closed, count: data?.length || 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
