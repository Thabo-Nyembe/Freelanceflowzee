'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('compliance-actions')

export async function createCompliance(data: {
  compliance_name: string
  description?: string
  compliance_type: string
  framework?: string
  regulation_name?: string
  due_date?: string
  risk_level?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create compliance', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Compliance created successfully', { complianceId: compliance.id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Compliance created successfully')
  } catch (error) {
    logger.error('Unexpected error in createCompliance', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCompliance(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update compliance', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Compliance updated successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Compliance updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateCompliance', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCompliance(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('compliance')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete compliance', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Compliance deleted successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(undefined, 'Compliance deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteCompliance', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRequirements(id: string, requirements: { met: number, total: number }): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const compliancePercentage = requirements.total > 0
      ? parseFloat(((requirements.met / requirements.total) * 100).toFixed(2))
      : 0

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        total_requirements: requirements.total,
        met_requirements: requirements.met,
        pending_requirements: requirements.total - requirements.met,
        compliance_percentage: compliancePercentage,
        is_compliant: compliancePercentage === 100
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update requirements', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Requirements updated successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Requirements updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateRequirements', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function conductAudit(id: string, score: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('compliance')
      .select('audit_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Compliance not found', 'NOT_FOUND')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        last_audit_date: new Date().toISOString(),
        audit_count: (current.audit_count || 0) + 1,
        assessment_score: score,
        compliance_score: score
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to conduct audit', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit conducted successfully', { id, score })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Audit conducted successfully')
  } catch (error) {
    logger.error('Unexpected error in conductAudit', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function certifyCompliance(id: string, certification: {
  name: string
  number: string
  certified_by: string
  expiry_date: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        certification_name: certification.name,
        certification_number: certification.number,
        certified_by: certification.certified_by,
        certification_date: new Date().toISOString(),
        certification_expiry: certification.expiry_date,
        is_certified: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to certify compliance', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Compliance certified successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Compliance certified successfully')
  } catch (error) {
    logger.error('Unexpected error in certifyCompliance', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordViolation(id: string, violation: { description: string, severity: string }): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('compliance')
      .select('violation_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Compliance not found', 'NOT_FOUND')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        violation_count: (current.violation_count || 0) + 1,
        last_violation_date: new Date().toISOString(),
        status: 'non_compliant',
        is_compliant: false
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record violation', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Violation recorded successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Violation recorded successfully')
  } catch (error) {
    logger.error('Unexpected error in recordViolation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRemediation(id: string, remediation: {
  plan: string
  status: string
  deadline: string
  cost?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        remediation_required: true,
        remediation_plan: remediation.plan,
        remediation_status: remediation.status,
        remediation_deadline: remediation.deadline,
        remediation_cost: remediation.cost
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update remediation', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Remediation updated successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Remediation updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateRemediation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTrainingProgress(id: string, trained: number, total: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const completionRate = total > 0
      ? parseFloat(((trained / total) * 100).toFixed(2))
      : 0

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        trained_employees: trained,
        total_employees: total,
        training_completion_rate: completionRate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update training progress', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Training progress updated successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Training progress updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateTrainingProgress', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function submitReport(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: compliance, error } = await supabase
      .from('compliance')
      .update({
        last_report_date: new Date().toISOString(),
        report_submitted: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to submit report', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Report submitted successfully', { id })
    revalidatePath('/dashboard/compliance-v2')
    return actionSuccess(compliance, 'Report submitted successfully')
  } catch (error) {
    logger.error('Unexpected error in submitReport', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
