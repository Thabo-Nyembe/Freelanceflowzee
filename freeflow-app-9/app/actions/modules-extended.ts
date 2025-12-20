'use server'

/**
 * Extended Modules Server Actions
 * Tables: modules, module_versions, module_installations, module_dependencies, module_configs, module_permissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getModule(moduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modules').select('*, module_versions(*), module_dependencies(*), module_configs(*)').eq('id', moduleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createModule(moduleData: { name: string; slug: string; description?: string; author_id: string; category?: string; repository_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modules').insert({ ...moduleData, status: 'draft', is_published: false, install_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateModule(moduleId: string, updates: Partial<{ name: string; description: string; category: string; repository_url: string; status: string; is_published: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('modules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', moduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteModule(moduleId: string) {
  try { const supabase = await createClient(); await supabase.from('module_versions').delete().eq('module_id', moduleId); await supabase.from('module_dependencies').delete().eq('module_id', moduleId); await supabase.from('module_configs').delete().eq('module_id', moduleId); const { error } = await supabase.from('modules').delete().eq('id', moduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getModules(options?: { category?: string; status?: string; is_published?: boolean; author_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('modules').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.author_id) query = query.eq('author_id', options.author_id); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createVersion(versionData: { module_id: string; version: string; changelog?: string; download_url?: string; min_system_version?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_versions').insert({ ...versionData, status: 'draft', download_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishVersion(versionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_versions').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', versionId).select().single(); if (error) throw error; const version = data; await supabase.from('modules').update({ current_version: version.version, is_published: true, updated_at: new Date().toISOString() }).eq('id', version.module_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVersions(moduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_versions').select('*').eq('module_id', moduleId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installModule(installData: { module_id: string; version_id: string; organization_id?: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_installations').insert({ ...installData, status: 'active', installed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('modules').update({ install_count: supabase.sql`install_count + 1` }).eq('id', installData.module_id); await supabase.from('module_versions').update({ download_count: supabase.sql`download_count + 1` }).eq('id', installData.version_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallModule(installationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_installations').update({ status: 'uninstalled', uninstalled_at: new Date().toISOString() }).eq('id', installationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstallations(options?: { organization_id?: string; user_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('module_installations').select('*, modules(*), module_versions(*)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDependency(moduleId: string, dependencyData: { depends_on_id: string; min_version?: string; is_required?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_dependencies').insert({ module_id: moduleId, ...dependencyData, is_required: dependencyData.is_required ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDependencies(moduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('module_dependencies').select('*, modules!depends_on_id(*)').eq('module_id', moduleId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setConfig(installationId: string, config: Record<string, any>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('module_configs').select('id').eq('installation_id', installationId).single(); if (existing) { const { data, error } = await supabase.from('module_configs').update({ config, updated_at: new Date().toISOString() }).eq('installation_id', installationId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('module_configs').insert({ installation_id: installationId, config, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPermissions(moduleId: string, permissions: string[]) {
  try { const supabase = await createClient(); await supabase.from('module_permissions').delete().eq('module_id', moduleId); const insertData = permissions.map(p => ({ module_id: moduleId, permission: p, created_at: new Date().toISOString() })); const { data, error } = await supabase.from('module_permissions').insert(insertData).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
