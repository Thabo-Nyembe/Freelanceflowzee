'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ComplianceType = 'regulatory' | 'legal' | 'industry' | 'internal' | 'security' | 'privacy' | 'data_protection' | 'financial'
export type ComplianceStatus = 'pending' | 'in_progress' | 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review' | 'expired'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Compliance {
  id: string
  user_id: string
  compliance_name: string
  description?: string
  compliance_type: ComplianceType
  framework?: string
  standard?: string
  regulation_name?: string
  regulation_code?: string
  jurisdiction?: string
  status: ComplianceStatus
  compliance_status?: string
  is_compliant: boolean
  compliance_score?: number
  compliance_percentage?: number
  total_requirements: number
  met_requirements: number
  pending_requirements: number
  failed_requirements: number
  requirements?: any[]
  last_audit_date?: string
  next_audit_date?: string
  audit_frequency?: string
  audit_count: number
  audit_history?: any[]
  last_assessment_date?: string
  next_assessment_date?: string
  assessment_score?: number
  assessment_results?: any
  certification_name?: string
  certification_number?: string
  certified_by?: string
  certification_date?: string
  certification_expiry?: string
  is_certified: boolean
  recertification_required: boolean
  due_date?: string
  expiry_date?: string
  renewal_date?: string
  days_until_expiry?: number
  is_expired: boolean
  is_expiring_soon: boolean
  documentation_url?: string
  evidence_urls?: any[]
  policy_document_url?: string
  procedure_document_url?: string
  documentation_complete: boolean
  owner_id?: string
  owner_name?: string
  assigned_to?: string
  assigned_team?: string
  risk_level: RiskLevel
  risk_score?: number
  impact_level?: string
  mitigation_plan?: string
  control_count: number
  controls?: any[]
  control_effectiveness?: number
  violation_count: number
  violations?: any[]
  incident_count: number
  incidents?: any[]
  last_violation_date?: string
  remediation_required: boolean
  remediation_plan?: string
  remediation_status?: string
  remediation_deadline?: string
  remediation_cost?: number
  penalty_amount?: number
  fine_amount?: number
  total_penalties: number
  training_required: boolean
  training_completion_rate?: number
  trained_employees: number
  total_employees: number
  continuous_monitoring: boolean
  monitoring_frequency?: string
  last_monitored_at?: string
  monitoring_alerts: number
  reporting_frequency?: string
  last_report_date?: string
  next_report_date?: string
  report_submitted: boolean
  vendor_compliance_required: boolean
  vendor_count: number
  vendors?: any[]
  implementation_cost?: number
  annual_cost?: number
  total_cost?: number
  notify_on_expiry: boolean
  notify_on_violation: boolean
  notification_days_before: number
  priority?: string
  category?: string
  tags?: string[]
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseComplianceOptions {
  complianceType?: ComplianceType | 'all'
  status?: ComplianceStatus | 'all'
  riskLevel?: RiskLevel | 'all'
  limit?: number
}

export function useCompliance(options: UseComplianceOptions = {}) {
  const { complianceType, status, riskLevel, limit } = options

  const filters: Record<string, any> = {}
  if (complianceType && complianceType !== 'all') filters.compliance_type = complianceType
  if (status && status !== 'all') filters.status = status
  if (riskLevel && riskLevel !== 'all') filters.risk_level = riskLevel

  const queryOptions: any = {
    table: 'compliance',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Compliance>(queryOptions)

  const { mutate: createCompliance } = useSupabaseMutation({
    table: 'compliance',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateCompliance } = useSupabaseMutation({
    table: 'compliance',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteCompliance } = useSupabaseMutation({
    table: 'compliance',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    compliance: data,
    loading,
    error,
    createCompliance,
    updateCompliance,
    deleteCompliance,
    refetch
  }
}
