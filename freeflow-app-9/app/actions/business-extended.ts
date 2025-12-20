'use server'

/**
 * Extended Business Server Actions - Covers all Business-related tables
 * Tables: business_profiles, business_settings, business_hours, business_reports
 */

import { createClient } from '@/lib/supabase/server'

export async function getBusinessProfile(profileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_profiles').select('*, business_hours(*), business_settings(*)').eq('id', profileId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBusinessProfile(profileData: { user_id: string; name: string; description?: string; industry?: string; business_type?: string; registration_number?: string; tax_id?: string; website?: string; email?: string; phone?: string; address?: Record<string, any>; logo_url?: string; social_links?: Record<string, string> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_profiles').insert({ ...profileData, is_verified: false, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBusinessProfile(profileId: string, updates: Partial<{ name: string; description: string; industry: string; business_type: string; registration_number: string; tax_id: string; website: string; email: string; phone: string; address: Record<string, any>; logo_url: string; social_links: Record<string, string>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', profileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBusinessProfile(profileId: string) {
  try { const supabase = await createClient(); await supabase.from('business_hours').delete().eq('business_id', profileId); await supabase.from('business_settings').delete().eq('business_id', profileId); const { error } = await supabase.from('business_profiles').delete().eq('id', profileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBusinessProfiles(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_profiles').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function verifyBusinessProfile(profileId: string, verificationData: { verified_by: string; verification_method: string; verification_documents?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_profiles').update({ is_verified: true, verified_at: new Date().toISOString(), verification_data: verificationData, status: 'active', updated_at: new Date().toISOString() }).eq('id', profileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBusinessSettings(businessId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_settings').select('*').eq('business_id', businessId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBusinessSettings(businessId: string, settings: Partial<{ currency: string; timezone: string; language: string; date_format: string; notification_preferences: Record<string, boolean>; payment_settings: Record<string, any>; booking_settings: Record<string, any>; invoice_settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('business_settings').select('id').eq('business_id', businessId).single(); if (existing) { const { data, error } = await supabase.from('business_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('business_id', businessId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('business_settings').insert({ business_id: businessId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBusinessHours(businessId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_hours').select('*').eq('business_id', businessId).order('day_of_week', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setBusinessHours(businessId: string, hours: { day_of_week: number; is_open: boolean; open_time?: string; close_time?: string; breaks?: { start: string; end: string }[] }[]) {
  try { const supabase = await createClient(); await supabase.from('business_hours').delete().eq('business_id', businessId); const hoursData = hours.map(h => ({ business_id: businessId, ...h, created_at: new Date().toISOString() })); const { data, error } = await supabase.from('business_hours').insert(hoursData).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateBusinessHoursForDay(businessId: string, dayOfWeek: number, updates: { is_open: boolean; open_time?: string; close_time?: string; breaks?: { start: string; end: string }[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_hours').update({ ...updates, updated_at: new Date().toISOString() }).eq('business_id', businessId).eq('day_of_week', dayOfWeek).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBusinessReport(reportData: { business_id: string; report_type: string; period_start: string; period_end: string; data: Record<string, any>; generated_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_reports').insert({ ...reportData, status: 'completed', generated_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBusinessReports(businessId: string, options?: { report_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('business_reports').select('*').eq('business_id', businessId); if (options?.report_type) query = query.eq('report_type', options.report_type); const { data, error } = await query.order('generated_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBusinessReport(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('business_reports').select('*').eq('id', reportId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBusinessReport(reportId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('business_reports').delete().eq('id', reportId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchBusinessProfiles(query: string, options?: { industry?: string; business_type?: string; verified_only?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('business_profiles').select('*').or(`name.ilike.%${query}%,description.ilike.%${query}%`); if (options?.industry) dbQuery = dbQuery.eq('industry', options.industry); if (options?.business_type) dbQuery = dbQuery.eq('business_type', options.business_type); if (options?.verified_only) dbQuery = dbQuery.eq('is_verified', true); const { data, error } = await dbQuery.order('name', { ascending: true }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBusinessStats(businessId: string) {
  try { const supabase = await createClient(); const { data: profile } = await supabase.from('business_profiles').select('*').eq('id', businessId).single(); if (!profile) return { success: false, error: 'Business not found' }; const { data: reports } = await supabase.from('business_reports').select('report_type, created_at').eq('business_id', businessId); return { success: true, data: { profile, reportsCount: reports?.length || 0, isVerified: profile.is_verified, status: profile.status, createdAt: profile.created_at } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
