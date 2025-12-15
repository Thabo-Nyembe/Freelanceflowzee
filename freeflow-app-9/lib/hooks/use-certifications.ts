'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type CertificationType = 'professional' | 'technical' | 'compliance' | 'safety' | 'quality' | 'industry' | 'vendor' | 'educational'
export type CertificationStatus = 'active' | 'pending' | 'expired' | 'suspended' | 'revoked' | 'in_renewal' | 'archived'
export type VerificationStatus = 'verified' | 'unverified' | 'pending_verification' | 'failed_verification'

export interface Certification {
  id: string
  user_id: string
  certification_name: string
  certification_code?: string
  certification_type: CertificationType
  issuing_organization?: string
  issuing_authority?: string
  accreditation_body?: string
  issue_date?: string
  expiry_date?: string
  renewal_date?: string
  last_renewed_at?: string
  next_renewal_due?: string
  status: CertificationStatus
  verification_status: VerificationStatus
  is_valid: boolean
  is_expired: boolean
  days_until_expiry?: number
  requires_renewal: boolean
  level?: string
  grade?: string
  scope?: string
  specializations?: string[]
  holder_name?: string
  holder_id?: string
  holder_email?: string
  prerequisites?: string[]
  requirements_met?: any
  continuing_education_hours?: number
  required_ce_hours?: number
  verification_method?: string
  verification_url?: string
  verification_code?: string
  verified_at?: string
  verified_by?: string
  certificate_url?: string
  certificate_number?: string
  digital_badge_url?: string
  supporting_documents?: string[]
  compliance_area?: string
  regulatory_body?: string
  compliance_standard?: string
  audit_trail?: any
  renewal_process?: string
  renewal_cost?: number
  renewal_requirements?: string[]
  auto_renew: boolean
  notify_before_expiry: boolean
  notification_days: number
  last_notification_sent?: string
  training_completed: boolean
  exam_passed: boolean
  exam_score?: number
  passing_score?: number
  exam_date?: string
  associated_skills?: string[]
  associated_roles?: string[]
  associated_projects?: string[]
  certification_value?: string
  business_impact?: string
  career_impact?: string
  tags?: string[]
  category?: string
  industry?: string
  region?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCertificationsOptions {
  certificationType?: CertificationType | 'all'
  status?: CertificationStatus | 'all'
  limit?: number
}

export function useCertifications(options: UseCertificationsOptions = {}) {
  const { certificationType, status, limit } = options

  const filters: Record<string, any> = {}
  if (certificationType && certificationType !== 'all') filters.certification_type = certificationType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'certifications',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Certification>(queryOptions)

  const { mutate: createCertification } = useSupabaseMutation({
    table: 'certifications',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateCertification } = useSupabaseMutation({
    table: 'certifications',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteCertification } = useSupabaseMutation({
    table: 'certifications',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    certifications: data,
    loading,
    error,
    createCertification,
    updateCertification,
    deleteCertification,
    refetch
  }
}
