'use server'

/**
 * Extended Resources Server Actions
 * Tables: resources, resource_types, resource_allocations, resource_availability, resource_bookings, resource_usage
 */

import { createClient } from '@/lib/supabase/server'

export async function getResource(resourceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resources').select('*, resource_types(*), resource_allocations(*), resource_availability(*), users(*)').eq('id', resourceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createResource(resourceData: { name: string; type_id?: string; description?: string; category?: string; capacity?: number; location?: string; owner_id?: string; organization_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resources').insert({ ...resourceData, status: 'available', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateResource(resourceId: string, updates: Partial<{ name: string; description: string; category: string; capacity: number; location: string; status: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resources').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', resourceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteResource(resourceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('resources').delete().eq('id', resourceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResources(options?: { type_id?: string; category?: string; status?: string; location?: string; owner_id?: string; organization_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('resources').select('*, resource_types(*), users(*)'); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.location) query = query.eq('location', options.location); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getResourceTypes(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('resource_types').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function allocateResource(allocationData: { resource_id: string; entity_type: string; entity_id: string; allocated_by: string; start_date?: string; end_date?: string; quantity?: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_allocations').insert({ ...allocationData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('resources').update({ status: 'allocated', updated_at: new Date().toISOString() }).eq('id', allocationData.resource_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function releaseResource(allocationId: string) {
  try { const supabase = await createClient(); const { data: allocation, error: fetchError } = await supabase.from('resource_allocations').select('resource_id').eq('id', allocationId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from('resource_allocations').update({ status: 'released', released_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', allocationId).select().single(); if (error) throw error; await supabase.from('resources').update({ status: 'available', updated_at: new Date().toISOString() }).eq('id', allocation.resource_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceAllocations(resourceId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('resource_allocations').select('*, users(*)').eq('resource_id', resourceId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setResourceAvailability(resourceId: string, availabilityData: { day_of_week?: number; start_time?: string; end_time?: string; is_available: boolean; date?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_availability').upsert({ resource_id: resourceId, ...availabilityData, updated_at: new Date().toISOString() }, { onConflict: availabilityData.date ? 'resource_id,date' : 'resource_id,day_of_week' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceAvailability(resourceId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('resource_availability').select('*').eq('resource_id', resourceId); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordResourceUsage(usageData: { resource_id: string; user_id: string; start_time: string; end_time?: string; quantity?: number; purpose?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('resource_usage').insert({ ...usageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResourceUsage(resourceId: string, options?: { from_date?: string; to_date?: string; user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('resource_usage').select('*, users(*)').eq('resource_id', resourceId); if (options?.from_date) query = query.gte('start_time', options.from_date); if (options?.to_date) query = query.lte('start_time', options.to_date); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('start_time', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAvailableResources(options?: { type_id?: string; category?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('resources').select('*, resource_types(*)').eq('status', 'available').eq('is_active', true); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getResourceStats(options?: { organization_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('resources').select('status, category'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data } = await query; const resources = data || []; const total = resources.length; const available = resources.filter(r => r.status === 'available').length; const allocated = resources.filter(r => r.status === 'allocated').length; const maintenance = resources.filter(r => r.status === 'maintenance').length; const byCategory: { [key: string]: number } = {}; resources.forEach(r => { byCategory[r.category || 'other'] = (byCategory[r.category || 'other'] || 0) + 1 }); return { success: true, data: { total, available, allocated, maintenance, byCategory } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
