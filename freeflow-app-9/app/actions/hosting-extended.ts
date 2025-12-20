'use server'

/**
 * Extended Hosting Server Actions
 * Tables: hosting_sites, hosting_deployments, hosting_domains, hosting_ssl, hosting_analytics, hosting_plans
 */

import { createClient } from '@/lib/supabase/server'

export async function getSite(siteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_sites').select('*, hosting_domains(*), hosting_deployments(*), hosting_ssl(*)').eq('id', siteId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSite(siteData: { name: string; owner_id: string; subdomain?: string; framework?: string; repo_url?: string; plan_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_sites').insert({ ...siteData, status: 'pending', deployment_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSite(siteId: string, updates: Partial<{ name: string; subdomain: string; framework: string; repo_url: string; build_command: string; output_directory: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_sites').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', siteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSite(siteId: string) {
  try { const supabase = await createClient(); await supabase.from('hosting_deployments').delete().eq('site_id', siteId); await supabase.from('hosting_domains').delete().eq('site_id', siteId); await supabase.from('hosting_ssl').delete().eq('site_id', siteId); const { error } = await supabase.from('hosting_sites').delete().eq('id', siteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSites(options?: { owner_id?: string; status?: string; framework?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('hosting_sites').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.status) query = query.eq('status', options.status); if (options?.framework) query = query.eq('framework', options.framework); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDeployment(deploymentData: { site_id: string; commit_hash?: string; commit_message?: string; branch?: string; triggered_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_deployments').insert({ ...deploymentData, status: 'queued', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDeployment(deploymentId: string, updates: Partial<{ status: string; build_logs: string; deploy_url: string; error_message: string; completed_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_deployments').update({ ...updates }).eq('id', deploymentId).select().single(); if (error) throw error; if (updates.status === 'success') { const { data: deployment } = await supabase.from('hosting_deployments').select('site_id').eq('id', deploymentId).single(); if (deployment) { const { data: site } = await supabase.from('hosting_sites').select('deployment_count').eq('id', deployment.site_id).single(); await supabase.from('hosting_sites').update({ deployment_count: (site?.deployment_count || 0) + 1, status: 'live', updated_at: new Date().toISOString() }).eq('id', deployment.site_id) } }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDeployments(siteId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('hosting_deployments').select('*').eq('site_id', siteId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDomain(domainData: { site_id: string; domain: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_domains').insert({ ...domainData, status: 'pending', is_verified: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyDomain(domainId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_domains').update({ status: 'active', is_verified: true, verified_at: new Date().toISOString() }).eq('id', domainId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDomains(siteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_domains').select('*').eq('site_id', siteId).order('is_primary', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function provisionSSL(sslData: { site_id: string; domain_id: string; provider?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_ssl').insert({ ...sslData, status: 'provisioning', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSiteAnalytics(siteId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('hosting_analytics').select('*').eq('site_id', siteId); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); const { data, error } = await query.order('date', { ascending: false }).limit(30); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHostingPlans() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('hosting_plans').select('*').eq('is_active', true).order('price', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
