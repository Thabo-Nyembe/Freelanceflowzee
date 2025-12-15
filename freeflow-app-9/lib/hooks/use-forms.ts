// Hook for Forms management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type FormType = 'contact' | 'registration' | 'application' | 'survey' | 'quiz' | 'order' | 'feedback' | 'custom'
export type FormStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'

export interface Form {
  id: string
  user_id: string
  organization_id: string | null
  title: string
  description: string | null
  form_type: FormType
  status: FormStatus
  fields: any
  field_count: number
  sections: any
  allow_multiple_submissions: boolean
  require_authentication: boolean
  allow_save_draft: boolean
  show_progress_bar: boolean
  validation_rules: any
  required_fields: any
  max_submissions: number | null
  submission_deadline: string | null
  starts_at: string | null
  ends_at: string | null
  confirmation_message: string | null
  redirect_url: string | null
  send_confirmation_email: boolean
  email_template_id: string | null
  notification_emails: any
  total_submissions: number
  total_views: number
  total_started: number
  total_completed: number
  completion_rate: number
  average_completion_time: number
  is_public: boolean
  password_protected: boolean
  access_code: string | null
  allowed_domains: any
  theme: string
  custom_css: string | null
  logo_url: string | null
  background_image_url: string | null
  primary_color: string | null
  webhook_url: string | null
  webhook_events: any
  integration_settings: any
  analytics_enabled: boolean
  track_source: boolean
  track_location: boolean
  tags: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseFormsOptions {
  status?: FormStatus | 'all'
  formType?: FormType | 'all'
  limit?: number
}

export function useForms(options: UseFormsOptions = {}) {
  const { status, formType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (formType && formType !== 'all') filters.form_type = formType

  const queryOptions: any = {
    table: 'forms',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Form>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'forms',
    onSuccess: refetch
  })

  return {
    forms: data,
    loading,
    error,
    mutating,
    createForm: create,
    updateForm: update,
    deleteForm: remove,
    refetch
  }
}
