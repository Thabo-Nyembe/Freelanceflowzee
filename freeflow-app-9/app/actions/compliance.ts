'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCompliance(data: {
  compliance_name: string
  description?: string
  compliance_type: string
  framework?: string
  regulation_name?: string
  due_date?: string
  risk_level?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: compliance, error } = await supabase
    .from('compliance')
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function updateCompliance(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: compliance, error } = await supabase
    .from('compliance')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function deleteCompliance(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('compliance')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
}

export async function updateRequirements(id: string, requirements: { met: number, total: number }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function conductAudit(id: string, score: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('compliance')
    .select('audit_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Compliance not found')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function certifyCompliance(id: string, certification: {
  name: string
  number: string
  certified_by: string
  expiry_date: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function recordViolation(id: string, violation: { description: string, severity: string }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('compliance')
    .select('violation_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Compliance not found')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function updateRemediation(id: string, remediation: {
  plan: string
  status: string
  deadline: string
  cost?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function updateTrainingProgress(id: string, trained: number, total: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}

export async function submitReport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/compliance-v2')
  return compliance
}
