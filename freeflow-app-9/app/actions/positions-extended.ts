'use server'

/**
 * Extended Positions Server Actions
 * Tables: positions, position_applications, position_requirements, position_interviews, position_offers, position_assignments
 */

import { createClient } from '@/lib/supabase/server'

export async function getPosition(positionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('positions').select('*, position_requirements(*), position_applications(count)').eq('id', positionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPosition(positionData: { title: string; description: string; department_id?: string; organization_id?: string; location?: string; type?: string; salary_min?: number; salary_max?: number; requirements?: { requirement: string; is_required: boolean }[] }) {
  try { const supabase = await createClient(); const { requirements, ...positionInfo } = positionData; const { data: position, error: positionError } = await supabase.from('positions').insert({ ...positionInfo, status: 'draft', application_count: 0, created_at: new Date().toISOString() }).select().single(); if (positionError) throw positionError; if (requirements && requirements.length > 0) { const requirementsData = requirements.map((req, idx) => ({ position_id: position.id, requirement: req.requirement, is_required: req.is_required, order: idx, created_at: new Date().toISOString() })); await supabase.from('position_requirements').insert(requirementsData) } return { success: true, data: position } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePosition(positionId: string, updates: Partial<{ title: string; description: string; department_id: string; location: string; type: string; salary_min: number; salary_max: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('positions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', positionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishPosition(positionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('positions').update({ status: 'open', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', positionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closePosition(positionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('positions').update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', positionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePosition(positionId: string) {
  try { const supabase = await createClient(); await supabase.from('position_applications').delete().eq('position_id', positionId); await supabase.from('position_requirements').delete().eq('position_id', positionId); await supabase.from('position_interviews').delete().eq('position_id', positionId); await supabase.from('position_offers').delete().eq('position_id', positionId); const { error } = await supabase.from('positions').delete().eq('id', positionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPositions(options?: { organization_id?: string; department_id?: string; status?: string; type?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('positions').select('*, position_applications(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.department_id) query = query.eq('department_id', options.department_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function apply(positionId: string, applicationData: { applicant_id?: string; resume_url?: string; cover_letter?: string; email: string; name: string; phone?: string; answers?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_applications').insert({ position_id: positionId, ...applicationData, status: 'submitted', applied_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('positions').update({ application_count: supabase.sql`application_count + 1` }).eq('id', positionId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateApplicationStatus(applicationId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_applications').update({ status, reviewer_notes: notes, reviewed_at: new Date().toISOString() }).eq('id', applicationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getApplications(positionId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('position_applications').select('*, users(*)').eq('position_id', positionId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('applied_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleInterview(applicationId: string, interviewData: { position_id: string; scheduled_at: string; duration_minutes: number; type: string; location?: string; meeting_url?: string; interviewers?: string[]; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_interviews').insert({ application_id: applicationId, ...interviewData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('position_applications').update({ status: 'interview_scheduled' }).eq('id', applicationId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeInterview(interviewId: string, feedback: { rating: number; notes: string; recommendation: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_interviews').update({ status: 'completed', feedback, completed_at: new Date().toISOString() }).eq('id', interviewId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createOffer(applicationId: string, offerData: { position_id: string; salary: number; start_date: string; benefits?: any; terms?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_offers').insert({ application_id: applicationId, ...offerData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('position_applications').update({ status: 'offer_extended' }).eq('id', applicationId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function respondToOffer(offerId: string, response: 'accepted' | 'declined', notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_offers').update({ status: response, response_notes: notes, responded_at: new Date().toISOString() }).eq('id', offerId).select().single(); if (error) throw error; const newAppStatus = response === 'accepted' ? 'hired' : 'offer_declined'; await supabase.from('position_applications').update({ status: newAppStatus }).eq('id', data.application_id); if (response === 'accepted') { await supabase.from('positions').update({ status: 'filled', filled_at: new Date().toISOString() }).eq('id', data.position_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignPosition(assignmentData: { position_id: string; user_id: string; start_date: string; end_date?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('position_assignments').insert({ ...assignmentData, status: 'active', assigned_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
