import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type HealthStatus = 'healthy' | 'at_risk' | 'critical' | 'churned' | 'onboarding' | 'inactive'
export type HealthTrend = 'improving' | 'stable' | 'declining' | 'unknown'
export type AccountTier = 'enterprise' | 'business' | 'professional' | 'starter' | 'trial' | 'freemium'
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'churned' | 'trial' | 'onboarding'
export type EngagementLevel = 'high' | 'medium' | 'low' | 'inactive' | 'dormant'
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked'
export type AlertLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface CustomerSuccess {
  id: string
  user_id: string
  customer_id?: string
  customer_name: string
  company_name?: string

  // Health scoring
  health_score: number
  health_status: HealthStatus
  previous_health_score?: number
  health_trend?: HealthTrend

  // Account information
  account_tier: AccountTier
  account_status: AccountStatus

  // Financial metrics
  mrr: number
  arr: number
  lifetime_value: number
  total_revenue: number
  avg_order_value: number

  // Contract details
  contract_start_date?: string
  contract_end_date?: string
  renewal_date?: string
  days_to_renewal?: number
  contract_term_months?: number
  auto_renewal: boolean

  // Engagement
  engagement_level: EngagementLevel
  product_usage_percentage: number
  feature_adoption_count: number
  total_features_available: number
  feature_adoption_rate: number

  // Activity
  last_login_date?: string
  login_count: number
  logins_last_30_days: number
  avg_session_duration_minutes?: number
  total_time_spent_hours: number

  // Support
  support_ticket_count: number
  open_ticket_count: number
  closed_ticket_count: number
  avg_resolution_time_hours?: number
  escalation_count: number

  // Satisfaction
  nps_score?: number
  csat_score?: number
  last_survey_date?: string
  survey_response_count: number

  // CSM assignment
  csm_id?: string
  csm_name?: string
  csm_email?: string
  last_csm_contact?: string
  next_check_in?: string

  // Onboarding
  onboarding_status?: OnboardingStatus
  onboarding_progress_percentage: number
  onboarding_completed_date?: string
  time_to_value_days?: number

  // Expansion
  expansion_opportunity: boolean
  upsell_potential: number
  cross_sell_opportunities?: string[]
  expansion_notes?: string

  // Churn risk
  churn_risk_score: number
  churn_probability: number
  churn_reasons?: string[]
  at_risk_since?: string
  retention_actions?: string[]

  // Goals
  customer_goals?: string[]
  success_milestones?: any
  milestones_achieved: number
  total_milestones: number

  // QBR
  last_qbr_date?: string
  next_qbr_date?: string
  qbr_count: number
  qbr_notes?: string

  // Advocacy
  is_reference_customer: boolean
  is_case_study: boolean
  testimonial_provided: boolean
  referral_count: number

  // Feedback
  feature_request_count: number
  bug_report_count: number
  product_feedback_submissions: number

  // Training
  training_sessions_completed: number
  certification_achieved: boolean
  resource_downloads: number

  // Communication
  email_engagement_rate: number
  webinar_attendance_count: number
  community_participation_score: number

  // Alerts
  alert_level: AlertLevel
  alert_reasons?: string[]
  last_alert_date?: string

  // Notes
  notes?: string
  action_items?: string[]
  tags?: string[]

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string

  // Metadata
  metadata?: any
  custom_fields?: any
}

export function useCustomerSuccess(filters?: {
  healthStatus?: HealthStatus | 'all'
  accountTier?: AccountTier | 'all'
  accountStatus?: AccountStatus | 'all'
}) {
  let query = useSupabaseQuery<CustomerSuccess>('customer_success')

  if (filters?.healthStatus && filters.healthStatus !== 'all') {
    query = query.eq('health_status', filters.healthStatus)
  }

  if (filters?.accountTier && filters.accountTier !== 'all') {
    query = query.eq('account_tier', filters.accountTier)
  }

  if (filters?.accountStatus && filters.accountStatus !== 'all') {
    query = query.eq('account_status', filters.accountStatus)
  }

  return query.order('health_score', { ascending: false })
}

export function useCreateCustomerSuccess() {
  return useSupabaseMutation<CustomerSuccess>('customer_success', 'insert')
}

export function useUpdateCustomerSuccess() {
  return useSupabaseMutation<CustomerSuccess>('customer_success', 'update')
}

export function useDeleteCustomerSuccess() {
  return useSupabaseMutation<CustomerSuccess>('customer_success', 'delete')
}
