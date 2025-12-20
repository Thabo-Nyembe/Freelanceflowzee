'use server'

/**
 * Extended Customer Server Actions - Covers all Customer-related tables
 * Tables: customers, customer_segments, customer_notes, customer_activities
 */

import { createClient } from '@/lib/supabase/server'

export async function getCustomer(customerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').select('*, customer_notes(*), customer_activities(*)').eq('id', customerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCustomer(customerData: { user_id: string; email: string; name?: string; company?: string; phone?: string; address?: Record<string, any>; avatar_url?: string; segment_id?: string; source?: string; tags?: string[]; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').insert({ ...customerData, status: 'active', lifetime_value: 0, total_orders: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCustomer(customerId: string, updates: Partial<{ name: string; company: string; phone: string; address: Record<string, any>; avatar_url: string; segment_id: string; status: string; tags: string[]; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', customerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCustomer(customerId: string) {
  try { const supabase = await createClient(); await supabase.from('customer_notes').delete().eq('customer_id', customerId); await supabase.from('customer_activities').delete().eq('customer_id', customerId); const { error } = await supabase.from('customers').delete().eq('id', customerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomers(userId: string, options?: { status?: string; segment_id?: string; tag?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('customers').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.segment_id) query = query.eq('segment_id', options.segment_id); if (options?.tag) query = query.contains('tags', [options.tag]); if (options?.search) query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,company.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCustomerNote(noteData: { customer_id: string; user_id: string; content: string; is_private?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_notes').insert({ ...noteData, is_private: noteData.is_private ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerNotes(customerId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteCustomerNote(noteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('customer_notes').delete().eq('id', noteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordCustomerActivity(activityData: { customer_id: string; activity_type: string; description?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_activities').insert({ ...activityData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerActivities(customerId: string, options?: { activity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('customer_activities').select('*').eq('customer_id', customerId); if (options?.activity_type) query = query.eq('activity_type', options.activity_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCustomerSegment(segmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_segments').select('*').eq('id', segmentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCustomerSegment(segmentData: { name: string; description?: string; user_id: string; criteria?: Record<string, any>; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_segments').insert({ ...segmentData, customer_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCustomerSegment(segmentId: string, updates: Partial<{ name: string; description: string; criteria: Record<string, any>; color: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_segments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', segmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCustomerSegment(segmentId: string) {
  try { const supabase = await createClient(); await supabase.from('customers').update({ segment_id: null }).eq('segment_id', segmentId); const { error } = await supabase.from('customer_segments').delete().eq('id', segmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerSegments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customer_segments').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateCustomerLifetimeValue(customerId: string, orderValue: number) {
  try { const supabase = await createClient(); const { data: customer } = await supabase.from('customers').select('lifetime_value, total_orders').eq('id', customerId).single(); if (!customer) return { success: false, error: 'Customer not found' }; const { data, error } = await supabase.from('customers').update({ lifetime_value: (customer.lifetime_value || 0) + orderValue, total_orders: (customer.total_orders || 0) + 1, last_order_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', customerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomerStats(userId: string) {
  try { const supabase = await createClient(); const { data: customers } = await supabase.from('customers').select('status, lifetime_value, total_orders, created_at').eq('user_id', userId); if (!customers) return { success: true, data: { total: 0, active: 0, inactive: 0, totalLifetimeValue: 0, totalOrders: 0, avgLifetimeValue: 0 } }; const total = customers.length; const active = customers.filter(c => c.status === 'active').length; const inactive = customers.filter(c => c.status === 'inactive').length; const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0); const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0); const avgLifetimeValue = total > 0 ? totalLifetimeValue / total : 0; const thisMonth = new Date(); thisMonth.setDate(1); const newThisMonth = customers.filter(c => new Date(c.created_at) >= thisMonth).length; return { success: true, data: { total, active, inactive, totalLifetimeValue, totalOrders, avgLifetimeValue, newThisMonth } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function mergeCustomers(primaryId: string, secondaryId: string) {
  try { const supabase = await createClient(); const { data: secondary } = await supabase.from('customers').select('lifetime_value, total_orders').eq('id', secondaryId).single(); if (!secondary) return { success: false, error: 'Secondary customer not found' }; const { data: primary } = await supabase.from('customers').select('lifetime_value, total_orders').eq('id', primaryId).single(); if (!primary) return { success: false, error: 'Primary customer not found' }; await supabase.from('customer_notes').update({ customer_id: primaryId }).eq('customer_id', secondaryId); await supabase.from('customer_activities').update({ customer_id: primaryId }).eq('customer_id', secondaryId); await supabase.from('customers').update({ lifetime_value: (primary.lifetime_value || 0) + (secondary.lifetime_value || 0), total_orders: (primary.total_orders || 0) + (secondary.total_orders || 0), updated_at: new Date().toISOString() }).eq('id', primaryId); await supabase.from('customers').delete().eq('id', secondaryId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
