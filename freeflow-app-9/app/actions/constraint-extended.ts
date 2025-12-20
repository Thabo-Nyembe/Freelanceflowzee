'use server'

/**
 * Extended Constraint Server Actions - Covers all Constraint-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getConstraint(constraintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('constraints').select('*').eq('id', constraintId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createConstraint(constraintData: { name: string; constraint_type: string; entity_type: string; field?: string; operator: string; value: any; error_message?: string; is_blocking?: boolean; is_active?: boolean; description?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('constraints').insert({ ...constraintData, is_blocking: constraintData.is_blocking ?? true, is_active: constraintData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateConstraint(constraintId: string, updates: Partial<{ name: string; operator: string; value: any; error_message: string; is_blocking: boolean; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('constraints').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', constraintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteConstraint(constraintId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('constraints').delete().eq('id', constraintId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkConstraints(entityType: string, data: Record<string, any>) {
  try { const supabase = await createClient(); const { data: constraints } = await supabase.from('constraints').select('*').eq('entity_type', entityType).eq('is_active', true); const violations: Array<{ constraint: any; message: string }> = []; for (const constraint of constraints || []) { if (!evaluateConstraint(constraint, data)) { violations.push({ constraint, message: constraint.error_message || `Constraint "${constraint.name}" violated` }); } } const hasBlockingViolations = violations.some(v => v.constraint.is_blocking); return { success: true, valid: violations.length === 0, violations, hasBlockingViolations } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', valid: false, violations: [] } }
}

function evaluateConstraint(constraint: any, data: Record<string, any>): boolean {
  const fieldValue = constraint.field ? data[constraint.field] : data;
  switch (constraint.operator) {
    case 'equals': return fieldValue === constraint.value;
    case 'not_equals': return fieldValue !== constraint.value;
    case 'greater_than': return Number(fieldValue) > Number(constraint.value);
    case 'less_than': return Number(fieldValue) < Number(constraint.value);
    case 'greater_than_or_equals': return Number(fieldValue) >= Number(constraint.value);
    case 'less_than_or_equals': return Number(fieldValue) <= Number(constraint.value);
    case 'in': return Array.isArray(constraint.value) && constraint.value.includes(fieldValue);
    case 'not_in': return Array.isArray(constraint.value) && !constraint.value.includes(fieldValue);
    case 'matches': return new RegExp(constraint.value).test(String(fieldValue));
    case 'not_null': return fieldValue != null;
    case 'is_null': return fieldValue == null;
    case 'min_length': return String(fieldValue).length >= Number(constraint.value);
    case 'max_length': return String(fieldValue).length <= Number(constraint.value);
    default: return true;
  }
}

export async function getConstraints(options?: { constraintType?: string; entityType?: string; isActive?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('constraints').select('*'); if (options?.constraintType) query = query.eq('constraint_type', options.constraintType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateConstraint(constraintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('constraints').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', constraintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateConstraint(constraintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('constraints').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', constraintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
