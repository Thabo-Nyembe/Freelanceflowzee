'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'access' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject'
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AuditStatus = 'success' | 'failure' | 'pending' | 'blocked'

export interface AuditEvent {
  id: string
  user_id: string

  // Event Details
  action: AuditAction
  resource: string
  resource_id: string | null
  resource_type: string | null

  // Actor Information
  actor_email: string
  actor_id: string | null
  actor_role: string | null
  actor_ip_address: string | null
  actor_user_agent: string | null
  actor_location: string | null

  // Event Context
  severity: AuditSeverity
  status: AuditStatus

  // Change Tracking
  changes: any
  previous_values: any
  new_values: any

  // Metadata
  metadata: any
  reason: string | null
  notes: string | null
  tags: string[] | null

  // Compliance
  compliance_framework: string | null
  compliance_requirement: string | null
  is_compliance_relevant: boolean

  // Session Info
  session_id: string | null
  request_id: string | null

  // Risk Assessment
  risk_score: number
  is_anomalous: boolean
  anomaly_reason: string | null

  // Retention
  retention_years: number
  is_immutable: boolean

  // Timestamps
  event_timestamp: string
  created_at: string
  deleted_at: string | null
}

export interface ComplianceCheck {
  id: string
  user_id: string

  check_name: string
  framework: string
  requirement: string | null
  description: string | null

  status: 'passing' | 'failing' | 'warning' | 'pending' | 'not_applicable'
  score: number
  max_score: number

  issues_found: number
  critical_issues: number
  warnings: number
  passed_controls: number
  total_controls: number

  evidence: any
  findings: any
  recommendations: any

  remediation_required: boolean
  remediation_status: string | null
  remediation_due_date: string | null
  remediation_assigned_to: string | null

  check_frequency: string
  next_check_at: string | null
  last_check_at: string | null

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UseAuditEventsOptions {
  action?: AuditAction | 'all'
  severity?: AuditSeverity | 'all'
  status?: AuditStatus | 'all'
  resource?: string | 'all'
}

export function useAuditEvents(options: UseAuditEventsOptions = {}) {
  const { action, severity, status, resource } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('audit_events')
      .select('*')
      .is('deleted_at', null)
      .order('event_timestamp', { ascending: false })

    if (action && action !== 'all') {
      query = query.eq('action', action)
    }

    if (severity && severity !== 'all') {
      query = query.eq('severity', severity)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (resource && resource !== 'all') {
      query = query.eq('resource', resource)
    }

    return query
  }

  return useSupabaseQuery<AuditEvent>('audit_events', buildQuery, [action, severity, status, resource])
}

export function useComplianceChecks(framework?: string) {
  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('compliance_checks')
      .select('*')
      .is('deleted_at', null)
      .order('last_check_at', { ascending: false })

    if (framework && framework !== 'all') {
      query = query.eq('framework', framework)
    }

    return query
  }

  return useSupabaseQuery<ComplianceCheck>('compliance_checks', buildQuery, [framework])
}

export function useCreateAuditEvent() {
  return useSupabaseMutation<AuditEvent>('audit_events', 'insert')
}
