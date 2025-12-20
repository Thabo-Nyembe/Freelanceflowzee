'use server'

/**
 * Extended Compliance Server Actions - Covers all 4 Compliance-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getComplianceChecks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createComplianceCheck(userId: string, input: { requirement_id: string; status: string; notes?: string; evidence?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_checks').insert({ user_id: userId, ...input, checked_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComplianceCheck(checkId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_checks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', checkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComplianceDocuments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadComplianceDocument(userId: string, input: { name: string; type: string; file_url: string; requirement_id?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_documents').insert({ user_id: userId, ...input, status: 'pending_review' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveComplianceDocument(documentId: string, approvedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_documents').update({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString() }).eq('id', documentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectComplianceDocument(documentId: string, rejectedBy: string, reason: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_documents').update({ status: 'rejected', rejected_by: rejectedBy, rejection_reason: reason }).eq('id', documentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComplianceReports(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateComplianceReport(userId: string, input: { name: string; type: string; period_start: string; period_end: string; requirements?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_reports').insert({ user_id: userId, ...input, status: 'generating' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComplianceReportStatus(reportId: string, status: string, reportData?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_reports').update({ status, data: reportData, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', reportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComplianceRequirements(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('compliance_requirements').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createComplianceRequirement(input: { name: string; description: string; category: string; severity: string; due_date?: string; is_mandatory?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_requirements').insert({ ...input, is_mandatory: input.is_mandatory ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateComplianceRequirement(requirementId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('compliance_requirements').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', requirementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteComplianceRequirement(requirementId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('compliance_requirements').delete().eq('id', requirementId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
