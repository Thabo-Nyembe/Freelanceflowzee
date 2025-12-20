'use server'

/**
 * Extended Certifications Server Actions
 * Tables: certifications, certification_courses, certification_exams, certification_badges
 */

import { createClient } from '@/lib/supabase/server'

export async function getCertification(certificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('certifications').select('*').eq('id', certificationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCertification(certData: { user_id: string; name: string; issuer: string; issued_date: string; expiry_date?: string; credential_id?: string; credential_url?: string; skills?: string[]; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('certifications').insert({ ...certData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCertification(certificationId: string, updates: Partial<{ name: string; issuer: string; issued_date: string; expiry_date: string; credential_id: string; credential_url: string; skills: string[]; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('certifications').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', certificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCertification(certificationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('certifications').delete().eq('id', certificationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCertifications(options?: { user_id?: string; issuer?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('certifications').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.issuer) query = query.eq('issuer', options.issuer); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('issued_date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExpiringCertifications(userId: string, daysAhead?: number) {
  try { const supabase = await createClient(); const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + (daysAhead || 30)); const { data, error } = await supabase.from('certifications').select('*').eq('user_id', userId).eq('status', 'active').not('expiry_date', 'is', null).lte('expiry_date', futureDate.toISOString()).order('expiry_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function renewCertification(certificationId: string, newExpiryDate: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('certifications').update({ expiry_date: newExpiryDate, status: 'active', renewed_at: new Date().toISOString() }).eq('id', certificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCertificationCourses(options?: { issuer?: string; skill?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('certification_courses').select('*'); if (options?.issuer) query = query.eq('issuer', options.issuer); if (options?.skill) query = query.contains('skills', [options.skill]); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function awardCertificationBadge(userId: string, badgeData: { certification_id: string; badge_type: string; name: string; image_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('certification_badges').insert({ user_id: userId, ...badgeData, awarded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
