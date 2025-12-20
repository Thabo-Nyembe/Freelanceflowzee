'use server'

/**
 * Extended Standard Server Actions - Covers all Standard/Specification tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStandard(standardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').select('*').eq('id', standardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStandard(standardData: { name: string; code: string; standard_type: string; category?: string; version?: string; description?: string; specification?: Record<string, any>; effective_date?: string; is_mandatory?: boolean; is_active?: boolean; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').insert({ ...standardData, is_mandatory: standardData.is_mandatory ?? false, is_active: standardData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStandard(standardId: string, updates: Partial<{ name: string; version: string; description: string; specification: Record<string, any>; effective_date: string; is_mandatory: boolean; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', standardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStandard(standardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('standards').delete().eq('id', standardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStandards(options?: { standardType?: string; category?: string; isMandatory?: boolean; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('standards').select('*'); if (options?.standardType) query = query.eq('standard_type', options.standardType); if (options?.category) query = query.eq('category', options.category); if (options?.isMandatory !== undefined) query = query.eq('is_mandatory', options.isMandatory); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('code', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStandardByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standards').select('*').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkCompliance(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data: standards } = await supabase.from('standards').select('*').eq('is_active', true).eq('is_mandatory', true); const { data: compliance } = await supabase.from('standard_compliance').select('*').eq('entity_type', entityType).eq('entity_id', entityId); const results = standards?.map(std => ({ standard: std, compliant: compliance?.some(c => c.standard_id === std.id && c.is_compliant) || false })) || []; const allCompliant = results.every(r => r.compliant); return { success: true, allCompliant, results } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', allCompliant: false, results: [] } }
}

export async function recordCompliance(standardId: string, entityType: string, entityId: string, isCompliant: boolean, notes?: string, verifiedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('standard_compliance').upsert({ standard_id: standardId, entity_type: entityType, entity_id: entityId, is_compliant: isCompliant, notes, verified_by: verifiedBy, verified_at: new Date().toISOString() }, { onConflict: 'standard_id,entity_type,entity_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
