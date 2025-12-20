'use server'

/**
 * Extended Allocations Server Actions
 * Tables: allocations, allocation_rules, allocation_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getAllocation(allocationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').select('*').eq('id', allocationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAllocation(allocationData: { user_id: string; resource_type: string; resource_id: string; allocated_to?: string; quantity?: number; amount?: number; start_date?: string; end_date?: string; status?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').insert({ ...allocationData, status: allocationData.status || 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAllocation(allocationId: string, updates: Partial<{ quantity: number; amount: number; start_date: string; end_date: string; status: string; notes: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', allocationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAllocation(allocationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('allocations').delete().eq('id', allocationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAllocations(options?: { user_id?: string; resource_type?: string; resource_id?: string; allocated_to?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('allocations').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.resource_type) query = query.eq('resource_type', options.resource_type); if (options?.resource_id) query = query.eq('resource_id', options.resource_id); if (options?.allocated_to) query = query.eq('allocated_to', options.allocated_to); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getResourceAllocations(resourceType: string, resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).eq('status', 'active'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAllocationsByUser(allocatedTo: string, options?: { resource_type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('allocations').select('*').eq('allocated_to', allocatedTo); if (options?.resource_type) query = query.eq('resource_type', options.resource_type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function completeAllocation(allocationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', allocationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelAllocation(allocationId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').update({ status: 'cancelled', cancellation_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', allocationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAllocationStats(userId: string, options?: { resource_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('allocations').select('status, quantity, amount').eq('user_id', userId); if (options?.resource_type) query = query.eq('resource_type', options.resource_type); const { data } = await query; if (!data) return { success: true, data: { total: 0, active: 0, completed: 0, totalQuantity: 0, totalAmount: 0 } }; const total = data.length; const active = data.filter(a => a.status === 'active').length; const completed = data.filter(a => a.status === 'completed').length; const totalQuantity = data.reduce((sum, a) => sum + (a.quantity || 0), 0); const totalAmount = data.reduce((sum, a) => sum + (a.amount || 0), 0); return { success: true, data: { total, active, completed, totalQuantity, totalAmount } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, active: 0, completed: 0, totalQuantity: 0, totalAmount: 0 } } }
}

export async function checkResourceAvailability(resourceType: string, resourceId: string, startDate: string, endDate: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allocations').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).eq('status', 'active').or(`start_date.lte.${endDate},end_date.gte.${startDate}`); if (error) throw error; return { success: true, isAvailable: (data || []).length === 0, conflicts: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', isAvailable: false, conflicts: [] } }
}
