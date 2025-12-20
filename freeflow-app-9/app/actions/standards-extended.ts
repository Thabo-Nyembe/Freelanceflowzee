'use server'

/**
 * Extended Standards Server Actions
 * Tables: standards, standard_requirements, standard_compliance, standard_audits, standard_certifications, standard_documents
 */

import { createClient } from '@/lib/supabase/server'

export async function getStandard(standardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').select('*, standard_requirements(*), standard_documents(*)').eq('id', standardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStandard(standardData: { name: string; code: string; description?: string; category?: string; version?: string; effective_date?: string; requirements?: any[]; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { requirements, ...standardInfo } = standardData; const { data: standard, error: standardError } = await supabase.from('standards').insert({ ...standardInfo, is_active: standardInfo.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (standardError) throw standardError; if (requirements && requirements.length > 0) { const reqData = requirements.map((r, i) => ({ standard_id: standard.id, ...r, order_index: i, created_at: new Date().toISOString() })); await supabase.from('standard_requirements').insert(reqData) } return { success: true, data: standard } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStandard(standardId: string, updates: Partial<{ name: string; code: string; description: string; category: string; version: string; effective_date: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', standardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStandard(standardId: string) {
  try { const supabase = await createClient(); await supabase.from('standard_requirements').delete().eq('standard_id', standardId); await supabase.from('standard_documents').delete().eq('standard_id', standardId); const { error } = await supabase.from('standards').delete().eq('id', standardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStandards(options?: { category?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('standards').select('*, standard_requirements(count)'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRequirement(standardId: string, reqData: { name: string; description?: string; requirement_type: string; is_mandatory?: boolean; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_requirements').insert({ standard_id: standardId, ...reqData, is_mandatory: reqData.is_mandatory ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequirements(standardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_requirements').select('*').eq('standard_id', standardId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assessCompliance(entityType: string, entityId: string, standardId: string, assessedBy: string, assessmentData: { requirement_results: { requirement_id: string; status: string; notes?: string }[]; overall_status: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_compliance').insert({ entity_type: entityType, entity_id: entityId, standard_id: standardId, assessed_by: assessedBy, ...assessmentData, assessed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComplianceHistory(entityType: string, entityId: string, options?: { standard_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('standard_compliance').select('*, standards(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (options?.standard_id) query = query.eq('standard_id', options.standard_id); const { data, error } = await query.order('assessed_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleAudit(auditData: { standard_id: string; entity_type: string; entity_id?: string; auditor_id: string; scheduled_date: string; scope?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_audits').insert({ ...auditData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeAudit(auditId: string, results: { findings: any[]; recommendations?: any[]; overall_result: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_audits').update({ ...results, status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', auditId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function issueCertification(certData: { standard_id: string; entity_type: string; entity_id: string; issued_by: string; valid_from: string; valid_until: string; certificate_number?: string; scope?: string }) {
  try { const supabase = await createClient(); const certNumber = certData.certificate_number || `CERT-${Date.now()}`; const { data, error } = await supabase.from('standard_certifications').insert({ ...certData, certificate_number: certNumber, status: 'active', issued_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCertifications(options?: { entity_type?: string; entity_id?: string; standard_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('standard_certifications').select('*, standards(*)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.standard_id) query = query.eq('standard_id', options.standard_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

