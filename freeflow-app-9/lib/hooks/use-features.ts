'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type FeatureStatus = 'enabled' | 'disabled' | 'rollout' | 'testing' | 'archived'
export type RolloutType = 'percentage' | 'gradual' | 'targeted' | 'full' | 'off'

export interface Feature {
  id: string
  user_id: string

  // Basic Info
  feature_name: string
  feature_key: string
  description: string | null

  // Status
  status: FeatureStatus
  is_enabled: boolean

  // Environment
  environments: string[]
  production_enabled: boolean
  staging_enabled: boolean
  development_enabled: boolean

  // Rollout Configuration
  rollout_percentage: number
  rollout_type: RolloutType
  target_users: number
  active_users: number

  // Targeting
  target_segments: string[] | null
  target_user_ids: string[] | null
  target_groups: string[] | null
  targeting_rules: any

  // A/B Testing
  is_ab_test: boolean
  ab_test_variants: any
  ab_test_traffic: any
  ab_test_conversion: any
  ab_test_winner: string | null
  ab_test_sample_size: number

  // Metrics
  total_requests: number
  successful_requests: number
  failed_requests: number
  avg_response_time_ms: number
  success_rate: number

  // Rollback
  can_rollback: boolean
  last_rollback_at: string | null
  rollback_reason: string | null

  // Metadata
  created_by: string | null
  updated_by: string | null
  tags: string[] | null
  category: string | null

  // Timestamps
  created_at: string
  updated_at: string
  enabled_at: string | null
  disabled_at: string | null
  deleted_at: string | null
}

export interface UseFeaturesOptions {
  status?: FeatureStatus | 'all'
  environment?: 'production' | 'staging' | 'development' | 'all'
  rolloutType?: RolloutType | 'all'
  abTest?: boolean
}

export function useFeatures(options: UseFeaturesOptions = {}) {
  const { status, environment, rolloutType, abTest } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('features')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (environment && environment !== 'all') {
      query = query.eq(`${environment}_enabled`, true)
    }

    if (rolloutType && rolloutType !== 'all') {
      query = query.eq('rollout_type', rolloutType)
    }

    if (abTest !== undefined) {
      query = query.eq('is_ab_test', abTest)
    }

    return query
  }

  return useSupabaseQuery<Feature>('features', buildQuery, [status, environment, rolloutType, abTest])
}

export function useCreateFeature() {
  return useSupabaseMutation<Feature>('features', 'insert')
}

export function useUpdateFeature() {
  return useSupabaseMutation<Feature>('features', 'update')
}

export function useDeleteFeature() {
  return useSupabaseMutation<Feature>('features', 'delete')
}
