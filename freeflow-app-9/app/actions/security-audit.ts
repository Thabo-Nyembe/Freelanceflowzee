'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('security-audit-actions')

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
export async function createSecurityAudit(input: SecurityAuditInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to create security audit', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit created successfully', { name: input.name })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Security audit created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSecurityAudit(id: string, updates: Partial<SecurityAuditInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('security_audits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit updated successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Security audit updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSecurityAudit(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('security_audits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit deleted successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess({ success: true }, 'Security audit deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startSecurityAudit(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit start attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to start security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit started successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Security audit started successfully')
  } catch (error: any) {
    logger.error('Unexpected error starting security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeSecurityAudit(
  id: string,
  status: 'passed' | 'failed' | 'warning',
  score?: number
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit completion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to complete security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit completed successfully', { id, status })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Security audit completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error completing security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function cancelSecurityAudit(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit cancellation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to cancel security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit cancelled successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Security audit cancelled successfully')
  } catch (error: any) {
    logger.error('Unexpected error cancelling security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSecurityAudits(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audits fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('security_audits')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch security audits', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audits fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Security audits fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching security audits', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSecurityAudit(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized security audit fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('security_audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch security audit', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Security audit fetched successfully', { id })
    return actionSuccess(data, 'Security audit fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching security audit', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Audit Finding Actions
export async function createAuditFinding(input: AuditFindingInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized audit finding creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('audit_findings')
      .insert([{
        ...input,
        status: 'open'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create audit finding', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update audit finding counts
    const countField = `findings_${input.severity === 'info' ? 'low' : input.severity}`
    await supabase.rpc('increment_audit_findings', {
      audit_id: input.audit_id,
      field_name: countField
    })

    logger.info('Audit finding created successfully', { auditId: input.audit_id, severity: input.severity })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Audit finding created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating audit finding', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAuditFinding(id: string, updates: Partial<AuditFindingInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('audit_findings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update audit finding', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit finding updated successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Audit finding updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating audit finding', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function remediateFinding(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized finding remediation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to remediate finding', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Finding remediated successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Finding remediated successfully')
  } catch (error: any) {
    logger.error('Unexpected error remediating finding', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function acceptFinding(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('audit_findings')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to accept finding', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Finding accepted successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Finding accepted successfully')
  } catch (error: any) {
    logger.error('Unexpected error accepting finding', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markFalsePositive(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('audit_findings')
      .update({
        status: 'false-positive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark finding as false positive', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Finding marked as false positive successfully', { id })
    revalidatePath('/dashboard/security-audit-v2')
    return actionSuccess(data, 'Finding marked as false positive successfully')
  } catch (error: any) {
    logger.error('Unexpected error marking finding as false positive', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAuditFindings(auditId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('audit_id', auditId)
      .order('severity', { ascending: false })

    if (error) {
      logger.error('Failed to fetch audit findings', { error: error.message, auditId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit findings fetched successfully', { auditId, count: data?.length || 0 })
    return actionSuccess(data || [], 'Audit findings fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching audit findings', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
