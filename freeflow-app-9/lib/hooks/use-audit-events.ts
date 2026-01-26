'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'
import type { JsonValue } from '@/lib/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'access' | 'login' | 'logout' | 'export' | 'import' | 'approve' | 'reject'
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AuditStatus = 'success' | 'failure' | 'pending' | 'blocked'

/** Represents change tracking data in audit events */
export interface AuditChangeData {
  field?: string
  old_value?: JsonValue
  new_value?: JsonValue
  [key: string]: JsonValue | undefined
}

/** Metadata associated with audit events */
export type AuditMetadata = Record<string, JsonValue>

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
  changes: AuditChangeData | null
  previous_values: AuditChangeData | null
  new_values: AuditChangeData | null

  // Metadata
  metadata: AuditMetadata | null
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

/** Evidence data for compliance checks */
export interface ComplianceEvidence {
  type?: string
  source?: string
  data?: JsonValue
  collected_at?: string
  [key: string]: JsonValue | undefined
}

/** Findings from compliance checks */
export interface ComplianceFinding {
  id?: string
  severity?: string
  description?: string
  control_id?: string
  [key: string]: JsonValue | undefined
}

/** Recommendations from compliance checks */
export interface ComplianceRecommendation {
  id?: string
  priority?: string
  description?: string
  action_required?: string
  [key: string]: JsonValue | undefined
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

  evidence: ComplianceEvidence[] | null
  findings: ComplianceFinding[] | null
  recommendations: ComplianceRecommendation[] | null

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

  const buildQuery = (supabase: SupabaseClient) => {
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
  const buildQuery = (supabase: SupabaseClient) => {
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
