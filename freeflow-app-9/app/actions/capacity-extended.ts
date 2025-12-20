'use server'

/**
 * Extended Capacity Server Actions
 * Tables: capacity_plans, capacity_resources, capacity_allocations, capacity_forecasts
 */

import { createClient } from '@/lib/supabase/server'

export async function getCapacityPlan(planId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_plans').select('*, capacity_resources(*), capacity_allocations(*)').eq('id', planId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCapacityPlan(planData: { user_id: string; name: string; description?: string; start_date: string; end_date: string; total_capacity?: number; unit?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_plans').insert({ ...planData, used_capacity: 0, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCapacityPlan(planId: string, updates: Partial<{ name: string; description: string; start_date: string; end_date: string; total_capacity: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_plans').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', planId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCapacityPlans(options?: { user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('capacity_plans').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCapacityResource(resourceData: { plan_id: string; name: string; type: string; capacity: number; cost_per_unit?: number; availability?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_resources').insert({ ...resourceData, allocated: 0, status: 'available', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function allocateCapacity(allocationData: { plan_id: string; resource_id: string; project_id?: string; amount: number; start_date: string; end_date: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_allocations').insert({ ...allocationData, status: 'allocated', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('capacity_resources').update({ allocated: supabase.rpc('increment_allocated', { resource_id: allocationData.resource_id, amount: allocationData.amount }) }).eq('id', allocationData.resource_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releaseCapacity(allocationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_allocations').update({ status: 'released', released_at: new Date().toISOString() }).eq('id', allocationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCapacityForecast(planId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('capacity_forecasts').select('*').eq('plan_id', planId); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCapacityForecast(forecastData: { plan_id: string; date: string; forecasted_demand: number; forecasted_capacity: number; confidence?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('capacity_forecasts').insert({ ...forecastData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
