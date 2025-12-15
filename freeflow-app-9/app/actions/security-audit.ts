'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface SecurityAuditInput {
  name: string
  description?: string
  audit_type: 'access-control' | 'data-encryption' | 'compliance' | 'penetration-test' | 'code-review' | 'infrastructure'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  compliance_standards?: string[]
  audited_by?: string
  auditor_email?: string
  schedule_cron?: string
  next_scheduled_at?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface AuditFindingInput {
  audit_id: string
  title: string
  description?: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  category?: string
  affected_resource?: string
  evidence?: string
  recommendation?: string
  cve_id?: string
  cvss_score?: number
  compliance_impact?: string[]
  metadata?: Record<string, any>
}

// Security Audit Actions
export async function createSecurityAudit(input: SecurityAuditInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('security_audits')
    .insert([{
      ...input,
      user_id: user.id,
      status: 'scheduled',
      findings_critical: 0,
      findings_high: 0,
      findings_medium: 0,
      findings_low: 0,
      total_recommendations: 0,
      remediated_count: 0,
      duration_seconds: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function updateSecurityAudit(id: string, updates: Partial<SecurityAuditInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('security_audits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function deleteSecurityAudit(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('security_audits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return { success: true }
}

export async function startSecurityAudit(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('security_audits')
    .update({
      status: 'in-progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function completeSecurityAudit(
  id: string,
  status: 'passed' | 'failed' | 'warning',
  score?: number
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get audit to calculate duration
  const { data: audit } = await supabase
    .from('security_audits')
    .select('started_at')
    .eq('id', id)
    .single()

  const startedAt = audit?.started_at ? new Date(audit.started_at) : new Date()
  const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000)

  const { data, error } = await supabase
    .from('security_audits')
    .update({
      status,
      completed_at: new Date().toISOString(),
      duration_seconds: duration,
      security_score: score,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function cancelSecurityAudit(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('security_audits')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function getSecurityAudits() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSecurityAudit(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

// Audit Finding Actions
export async function createAuditFinding(input: AuditFindingInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('audit_findings')
    .insert([{
      ...input,
      status: 'open'
    }])
    .select()
    .single()

  if (error) throw error

  // Update audit finding counts
  const countField = `findings_${input.severity === 'info' ? 'low' : input.severity}`
  await supabase.rpc('increment_audit_findings', {
    audit_id: input.audit_id,
    field_name: countField
  })

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function updateAuditFinding(id: string, updates: Partial<AuditFindingInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('audit_findings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function remediateFinding(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('audit_findings')
    .update({
      status: 'remediated',
      remediated_at: new Date().toISOString(),
      remediated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function acceptFinding(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('audit_findings')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function markFalsePositive(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('audit_findings')
    .update({
      status: 'false-positive',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/security-audit-v2')
  return data
}

export async function getAuditFindings(auditId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('audit_id', auditId)
    .order('severity', { ascending: false })

  if (error) throw error
  return data || []
}
