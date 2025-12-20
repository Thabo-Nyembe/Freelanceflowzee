'use server'

/**
 * Extended Dispute Server Actions
 * Tables: disputes, dispute_messages, dispute_evidence, dispute_resolutions
 */

import { createClient } from '@/lib/supabase/server'

export async function getDispute(disputeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('disputes').select('*, dispute_messages(*), dispute_evidence(*), dispute_resolutions(*)').eq('id', disputeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDispute(disputeData: { order_id?: string; transaction_id?: string; initiated_by: string; against_user_id: string; type: string; reason: string; description?: string; amount?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('disputes').insert({ ...disputeData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDisputeStatus(disputeId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('disputes').update({ status, status_notes: notes, updated_at: new Date().toISOString() }).eq('id', disputeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDisputes(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('disputes').select('*'); if (options?.user_id) query = query.or(`initiated_by.eq.${options.user_id},against_user_id.eq.${options.user_id}`); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDisputeMessage(messageData: { dispute_id: string; sender_id: string; content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dispute_messages').insert({ ...messageData, sent_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDisputeMessages(disputeId: string, options?: { include_internal?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('dispute_messages').select('*').eq('dispute_id', disputeId); if (!options?.include_internal) query = query.eq('is_internal', false); const { data, error } = await query.order('sent_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDisputeEvidence(evidenceData: { dispute_id: string; submitted_by: string; type: string; title: string; description?: string; file_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dispute_evidence').insert({ ...evidenceData, submitted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDisputeEvidence(disputeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dispute_evidence').select('*').eq('dispute_id', disputeId).order('submitted_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resolveDispute(resolutionData: { dispute_id: string; resolved_by: string; outcome: string; resolution_notes?: string; refund_amount?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dispute_resolutions').insert({ ...resolutionData, resolved_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('disputes').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', resolutionData.dispute_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function escalateDispute(disputeId: string, escalatedBy: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('disputes').update({ status: 'escalated', escalated_by: escalatedBy, escalation_reason: reason, escalated_at: new Date().toISOString() }).eq('id', disputeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
