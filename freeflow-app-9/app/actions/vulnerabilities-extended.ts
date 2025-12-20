'use server'

/**
 * Extended Vulnerabilities Server Actions
 * Tables: vulnerabilities, vulnerability_scans, vulnerability_fixes, vulnerability_reports
 */

import { createClient } from '@/lib/supabase/server'

export async function getVulnerability(vulnerabilityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vulnerabilities').select('*').eq('id', vulnerabilityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVulnerability(vulnerabilityData: { title: string; severity: string; description?: string; affected_component?: string; cve_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vulnerabilities').insert({ ...vulnerabilityData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVulnerability(vulnerabilityId: string, updates: Partial<{ title: string; severity: string; status: string; description: string; resolution: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vulnerabilities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vulnerabilityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveVulnerability(vulnerabilityId: string, resolution: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vulnerabilities').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', vulnerabilityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVulnerabilities(options?: { severity?: string; status?: string; affected_component?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('vulnerabilities').select('*'); if (options?.severity) query = query.eq('severity', options.severity); if (options?.status) query = query.eq('status', options.status); if (options?.affected_component) query = query.eq('affected_component', options.affected_component); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVulnerabilityScans(options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('vulnerability_scans').select('*'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVulnerabilityFixes(vulnerabilityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('vulnerability_fixes').select('*').eq('vulnerability_id', vulnerabilityId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVulnerabilityReports(options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('vulnerability_reports').select('*'); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
