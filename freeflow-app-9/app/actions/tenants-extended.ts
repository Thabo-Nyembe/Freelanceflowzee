'use server'

/**
 * Extended Tenants Server Actions
 * Tables: tenants, tenant_users, tenant_settings, tenant_subscriptions, tenant_invitations, tenant_domains
 */

import { createClient } from '@/lib/supabase/server'

export async function getTenant(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').select('*, tenant_settings(*), tenant_subscriptions(*), tenant_domains(*)').eq('id', tenantId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTenant(tenantData: { name: string; slug: string; description?: string; owner_id: string; logo_url?: string; plan?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('tenants').select('id').eq('slug', tenantData.slug).single(); if (existing) return { success: false, error: 'Slug already exists' }; const { data: tenant, error: tenantError } = await supabase.from('tenants').insert({ ...tenantData, plan: tenantData.plan || 'free', status: 'active', user_count: 1, created_at: new Date().toISOString() }).select().single(); if (tenantError) throw tenantError; await supabase.from('tenant_users').insert({ tenant_id: tenant.id, user_id: tenantData.owner_id, role: 'owner', is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data: tenant } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTenant(tenantId: string, updates: Partial<{ name: string; description: string; logo_url: string; status: string; plan: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenants').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tenantId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTenant(tenantId: string) {
  try { const supabase = await createClient(); await supabase.from('tenant_users').delete().eq('tenant_id', tenantId); await supabase.from('tenant_settings').delete().eq('tenant_id', tenantId); await supabase.from('tenant_subscriptions').delete().eq('tenant_id', tenantId); await supabase.from('tenant_invitations').delete().eq('tenant_id', tenantId); await supabase.from('tenant_domains').delete().eq('tenant_id', tenantId); const { error } = await supabase.from('tenants').delete().eq('id', tenantId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTenants(options?: { status?: string; plan?: string; owner_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tenants').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.plan) query = query.eq('plan', options.plan); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.search) query = query.or(`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUser(tenantId: string, userId: string, role: string = 'member', addedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('tenant_users').select('id').eq('tenant_id', tenantId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'User is already a member' }; const { data, error } = await supabase.from('tenant_users').insert({ tenant_id: tenantId, user_id: userId, role, added_by: addedBy, is_active: true, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await updateUserCount(tenantId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeUser(tenantId: string, userId: string) {
  try { const supabase = await createClient(); const { data: user } = await supabase.from('tenant_users').select('role').eq('tenant_id', tenantId).eq('user_id', userId).single(); if (user?.role === 'owner') return { success: false, error: 'Cannot remove tenant owner' }; const { error } = await supabase.from('tenant_users').delete().eq('tenant_id', tenantId).eq('user_id', userId); if (error) throw error; await updateUserCount(tenantId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUserRole(tenantId: string, userId: string, newRole: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_users').update({ role: newRole, updated_at: new Date().toISOString() }).eq('tenant_id', tenantId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateUserCount(tenantId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('tenant_users').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_active', true)
  await supabase.from('tenants').update({ user_count: count || 0, updated_at: new Date().toISOString() }).eq('id', tenantId)
}

export async function getUsers(tenantId: string, options?: { role?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('tenant_users').select('*, users(*)').eq('tenant_id', tenantId); if (options?.role) query = query.eq('role', options.role); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function inviteUser(tenantId: string, email: string, role: string = 'member', invitedBy: string) {
  try { const supabase = await createClient(); const token = generateToken(); const { data, error } = await supabase.from('tenant_invitations').insert({ tenant_id: tenantId, email, role, invited_by: invitedBy, token, status: 'pending', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return token
}

export async function acceptInvitation(token: string, userId: string) {
  try { const supabase = await createClient(); const { data: invitation } = await supabase.from('tenant_invitations').select('*').eq('token', token).eq('status', 'pending').single(); if (!invitation) return { success: false, error: 'Invalid or expired invitation' }; if (new Date(invitation.expires_at) < new Date()) return { success: false, error: 'Invitation has expired' }; await supabase.from('tenant_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id); return await addUser(invitation.tenant_id, userId, invitation.role, invitation.invited_by) } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSettings(tenantId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const settingsArray = Object.entries(settings).map(([key, value]) => ({ tenant_id: tenantId, setting_key: key, setting_value: value, updated_at: new Date().toISOString() })); for (const setting of settingsArray) { await supabase.from('tenant_settings').upsert(setting, { onConflict: 'tenant_id,setting_key' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettings(tenantId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId); if (error) throw error; const settingsMap: Record<string, any> = {}; data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value }); return { success: true, data: settingsMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function addDomain(tenantId: string, domain: string, isPrimary: boolean = false) {
  try { const supabase = await createClient(); if (isPrimary) { await supabase.from('tenant_domains').update({ is_primary: false }).eq('tenant_id', tenantId) } const { data, error } = await supabase.from('tenant_domains').insert({ tenant_id: tenantId, domain, is_primary: isPrimary, is_verified: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTenants(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tenant_users').select('*, tenants(*)').eq('user_id', userId).eq('is_active', true).order('joined_at', { ascending: false }); if (error) throw error; return { success: true, data: (data || []).map(m => ({ ...m.tenants, membership: m })) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
