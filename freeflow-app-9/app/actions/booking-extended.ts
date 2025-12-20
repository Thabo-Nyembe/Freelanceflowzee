'use server'

/**
 * Extended Booking Server Actions - Covers all 16 Booking-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBookingAttendees(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_attendees').select('*').eq('booking_id', bookingId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBookingAttendee(bookingId: string, input: { name: string; email: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_attendees').insert({ booking_id: bookingId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingAvailability(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_availability').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setBookingAvailability(userId: string, input: { day_of_week: number; start_time: string; end_time: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_availability').upsert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingBlockedTimes(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_blocked_times').select('*').eq('user_id', userId).order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingBlockedTime(userId: string, input: { start_time: string; end_time: string; reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_blocked_times').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBookingBlockedTime(blockedTimeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('booking_blocked_times').delete().eq('id', blockedTimeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingClients(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_clients').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingClient(userId: string, input: { name: string; email: string; phone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_clients').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingCouponUsage(couponId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_coupon_usage').select('*').eq('coupon_id', couponId).order('used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBookingCoupons(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_coupons').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingCoupon(userId: string, input: { code: string; discount_type: string; discount_value: number; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_coupons').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateBookingCoupon(couponId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_coupons').update({ is_active: false }).eq('id', couponId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingIntegrations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_integrations').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingIntegration(userId: string, input: { type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_integrations').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingPackageServices(packageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_package_services').select('*').eq('package_id', packageId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addServiceToPackage(packageId: string, serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_package_services').insert({ package_id: packageId, service_id: serviceId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingPackages(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_packages').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingPackage(userId: string, input: { name: string; description?: string; price: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_packages').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingPayments(bookingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_payments').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingPayment(bookingId: string, input: { amount: number; method: string; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_payments').insert({ booking_id: bookingId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingReminders(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_reminders').select('*').eq('user_id', userId).order('remind_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingReminder(userId: string, bookingId: string, remindAt: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_reminders').insert({ user_id: userId, booking_id: bookingId, remind_at: remindAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingServices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_services').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingService(userId: string, input: { name: string; description?: string; duration: number; price: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_services').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBookingService(serviceId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_services').update(updates).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_settings').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBookingSettings(userId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_settings').upsert({ user_id: userId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingSlots(serviceId: string, date?: string) {
  try { const supabase = await createClient(); let query = supabase.from('booking_slots').select('*').eq('service_id', serviceId).eq('is_available', true); if (date) query = query.eq('date', date); const { data, error } = await query.order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bookSlot(slotId: string, clientId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_slots').update({ is_available: false, booked_by: clientId }).eq('id', slotId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_stats').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookingTypes(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_types').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookingType(userId: string, input: { name: string; description?: string; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('booking_types').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
