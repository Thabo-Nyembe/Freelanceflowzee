'use server'

/**
 * Extended Dependencies Server Actions
 * Tables: dependencies, dependency_versions, dependency_vulnerabilities, dependency_licenses
 */

import { createClient } from '@/lib/supabase/server'

export async function getDependency(dependencyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependencies').select('*, dependency_versions(*), dependency_vulnerabilities(*)').eq('id', dependencyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDependency(dependencyData: { project_id: string; name: string; version: string; type?: string; source?: string; license?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependencies').insert({ ...dependencyData, is_dev: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDependency(dependencyId: string, updates: Partial<{ version: string; type: string; is_dev: boolean; license: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependencies').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', dependencyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDependency(dependencyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dependencies').delete().eq('id', dependencyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjectDependencies(projectId: string, options?: { type?: string; is_dev?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('dependencies').select('*').eq('project_id', projectId); if (options?.type) query = query.eq('type', options.type); if (options?.is_dev !== undefined) query = query.eq('is_dev', options.is_dev); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkDependencyVulnerabilities(dependencyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependency_vulnerabilities').select('*').eq('dependency_id', dependencyId).order('severity', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addVulnerability(vulnData: { dependency_id: string; cve_id?: string; severity: string; description?: string; fix_version?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependency_vulnerabilities').insert({ ...vulnData, status: 'open', discovered_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDependencyVersions(dependencyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependency_versions').select('*').eq('dependency_id', dependencyId).order('released_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOutdatedDependencies(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependencies').select('*').eq('project_id', projectId).eq('is_outdated', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDependencyLicenses(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dependencies').select('name, license').eq('project_id', projectId); if (error) throw error; const licenses: Record<string, string[]> = {}; data?.forEach(d => { if (d.license) { if (!licenses[d.license]) licenses[d.license] = []; licenses[d.license].push(d.name) } }); return { success: true, data: licenses } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}
