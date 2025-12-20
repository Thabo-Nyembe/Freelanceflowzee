'use server'

/**
 * Extended Policy Server Actions - Covers all Policy-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPolicy(policyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').select('*').eq('id', policyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPolicy(policyData: { name: string; policy_type: string; resource_type: string; effect: 'allow' | 'deny'; actions: string[]; conditions?: Record<string, any>; priority?: number; description?: string; is_active?: boolean; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').insert({ ...policyData, is_active: policyData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePolicy(policyId: string, updates: Partial<{ name: string; effect: 'allow' | 'deny'; actions: string[]; conditions: Record<string, any>; priority: number; description: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('policies').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', policyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePolicy(policyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('policies').delete().eq('id', policyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function evaluatePolicy(resourceType: string, action: string, context: Record<string, any>) {
  try { const supabase = await createClient(); const { data: policies } = await supabase.from('policies').select('*').eq('resource_type', resourceType).eq('is_active', true).order('priority', { ascending: false }); for (const policy of policies || []) { if (policy.actions.includes(action) || policy.actions.includes('*')) { if (!policy.conditions || evaluatePolicyConditions(policy.conditions, context)) { return { success: true, effect: policy.effect, policy: policy }; } } } return { success: true, effect: 'deny', policy: null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', effect: 'deny' } }
}

function evaluatePolicyConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(conditions)) {
    if (context[key] !== value) return false;
  }
  return true;
}

export async function getPolicies(options?: { policyType?: string; resourceType?: string; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('policies').select('*'); if (options?.policyType) query = query.eq('policy_type', options.policyType); if (options?.resourceType) query = query.eq('resource_type', options.resourceType); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function attachPolicyToRole(policyId: string, roleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('role_policies').upsert({ policy_id: policyId, role_id: roleId, attached_at: new Date().toISOString() }, { onConflict: 'policy_id,role_id' }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function detachPolicyFromRole(policyId: string, roleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('role_policies').delete().eq('policy_id', policyId).eq('role_id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRolePolicies(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_policies').select('policy_id, policies(*)').eq('role_id', roleId); if (error) throw error; return { success: true, data: data?.map(rp => rp.policies) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
