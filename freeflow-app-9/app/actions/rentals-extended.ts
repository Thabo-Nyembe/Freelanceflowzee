'use server'

/**
 * Extended Rentals Server Actions
 * Tables: rentals, rental_items, rental_agreements, rental_payments, rental_returns, rental_inventory
 */

import { createClient } from '@/lib/supabase/server'

export async function getRental(rentalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').select('*, rental_items(*), rental_agreements(*), rental_payments(*), users(*), customers(*)').eq('id', rentalId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRental(rentalData: { customer_id: string; user_id?: string; start_date: string; end_date: string; items?: { item_id: string; quantity: number; daily_rate: number }[]; deposit?: number; notes?: string }) {
  try { const supabase = await createClient(); const { items, ...rentalInfo } = rentalData; const rentalNumber = `RNT-${Date.now()}`; const totalDays = Math.ceil((new Date(rentalData.end_date).getTime() - new Date(rentalData.start_date).getTime()) / (1000 * 60 * 60 * 24)); const { data: rental, error: rentalError } = await supabase.from('rentals').insert({ ...rentalInfo, rental_number: rentalNumber, total_days: totalDays, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (rentalError) throw rentalError; if (items && items.length > 0) { const itemsData = items.map(item => ({ rental_id: rental.id, ...item, total: item.daily_rate * item.quantity * totalDays, created_at: new Date().toISOString() })); await supabase.from('rental_items').insert(itemsData); const totalAmount = itemsData.reduce((sum, i) => sum + i.total, 0); await supabase.from('rentals').update({ total_amount: totalAmount }).eq('id', rental.id) } return { success: true, data: rental } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRental(rentalId: string, updates: Partial<{ start_date: string; end_date: string; deposit: number; notes: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', rentalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function confirmRental(rentalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').update({ status: 'confirmed', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', rentalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startRental(rentalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').update({ status: 'active', picked_up_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', rentalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeRental(rentalId: string, returnData?: { condition?: string; damages?: string; additional_charges?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').update({ status: 'completed', returned_at: new Date().toISOString(), return_condition: returnData?.condition, damages: returnData?.damages, additional_charges: returnData?.additional_charges, updated_at: new Date().toISOString() }).eq('id', rentalId).select().single(); if (error) throw error; await supabase.from('rental_returns').insert({ rental_id: rentalId, condition: returnData?.condition, damages: returnData?.damages, additional_charges: returnData?.additional_charges, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRental(rentalId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: reason, updated_at: new Date().toISOString() }).eq('id', rentalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRentals(options?: { customer_id?: string; user_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rentals').select('*, rental_items(count), customers(*), users(*)'); if (options?.customer_id) query = query.eq('customer_id', options.customer_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('start_date', options.from_date); if (options?.to_date) query = query.lte('end_date', options.to_date); if (options?.search) query = query.ilike('rental_number', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveRentals(options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rentals').select('*, rental_items(*), customers(*)').eq('status', 'active').order('end_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOverdueRentals(options?: { limit?: number }) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('rentals').select('*, rental_items(*), customers(*)').eq('status', 'active').lt('end_date', now).order('end_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRentalItems(rentalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rental_items').select('*, rental_inventory(*)').eq('rental_id', rentalId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRentalPayments(rentalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rental_payments').select('*').eq('rental_id', rentalId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRentalPayment(rentalId: string, paymentData: { amount: number; payment_method: string; type: 'deposit' | 'rental' | 'damage' | 'refund'; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rental_payments').insert({ rental_id: rentalId, ...paymentData, status: 'completed', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRentalInventory(options?: { category?: string; is_available?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rental_inventory').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRentalStats(options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('rentals').select('status, total_amount'); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const rentals = data || []; const total = rentals.length; const active = rentals.filter(r => r.status === 'active').length; const completed = rentals.filter(r => r.status === 'completed').length; const cancelled = rentals.filter(r => r.status === 'cancelled').length; const totalRevenue = rentals.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.total_amount || 0), 0); return { success: true, data: { total, active, completed, cancelled, totalRevenue } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
