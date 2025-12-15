'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createAuditEvent(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('audit_events')
    .insert({
      ...data,
      user_id: user.id,
      actor_email: user.email || 'Unknown',
      actor_id: user.id,
      event_timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/audit-v2')
  return event
}

export async function getAuditEvent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return event
}

export async function createComplianceCheck(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: check, error } = await supabase
    .from('compliance_checks')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/audit-v2')
  return check
}

export async function updateComplianceCheck(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: check, error } = await supabase
    .from('compliance_checks')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/audit-v2')
  return check
}

export async function runComplianceCheck(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Simulate running compliance check
  const score = Math.floor(Math.random() * 15) + 85 // 85-100
  const issuesFound = Math.floor(Math.random() * 10)
  const criticalIssues = Math.floor(issuesFound * 0.1)
  const warnings = issuesFound - criticalIssues

  const status = score >= 95 ? 'passing' : score >= 85 ? 'warning' : 'failing'

  const { data: check, error } = await supabase
    .from('compliance_checks')
    .update({
      status,
      score,
      issues_found: issuesFound,
      critical_issues: criticalIssues,
      warnings,
      last_check_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/audit-v2')
  return check
}

export async function getAuditStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: events } = await supabase
    .from('audit_events')
    .select('action, severity, status')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    total: events?.length || 0,
    create: events?.filter(e => e.action === 'create').length || 0,
    update: events?.filter(e => e.action === 'update').length || 0,
    delete: events?.filter(e => e.action === 'delete').length || 0,
    access: events?.filter(e => e.action === 'access').length || 0,
    success: events?.filter(e => e.status === 'success').length || 0,
    failure: events?.filter(e => e.status === 'failure').length || 0,
    highSeverity: events?.filter(e => e.severity === 'high' || e.severity === 'critical').length || 0
  }

  return stats
}

export async function exportAuditTrail(startDate: string, endDate: string, format: 'json' | 'csv' = 'json') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('event_timestamp', startDate)
    .lte('event_timestamp', endDate)
    .order('event_timestamp', { ascending: false })

  if (error) throw error

  // Log the export action
  await createAuditEvent({
    action: 'export',
    resource: 'audit_trail',
    resource_id: null,
    severity: 'medium',
    status: 'success',
    metadata: {
      startDate,
      endDate,
      format,
      recordCount: events?.length || 0
    }
  })

  return events
}

export async function searchAuditEvents(query: string, options?: {
  action?: string
  severity?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let queryBuilder = supabase
    .from('audit_events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .or(`resource.ilike.%${query}%,actor_email.ilike.%${query}%,resource_id.ilike.%${query}%`)
    .order('event_timestamp', { ascending: false })
    .limit(100)

  if (options?.action) {
    queryBuilder = queryBuilder.eq('action', options.action)
  }

  if (options?.severity) {
    queryBuilder = queryBuilder.eq('severity', options.severity)
  }

  if (options?.startDate) {
    queryBuilder = queryBuilder.gte('event_timestamp', options.startDate)
  }

  if (options?.endDate) {
    queryBuilder = queryBuilder.lte('event_timestamp', options.endDate)
  }

  const { data: events, error } = await queryBuilder

  if (error) throw error
  return events
}
