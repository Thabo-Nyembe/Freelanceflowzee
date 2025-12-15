'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ChangeType = 'feature' | 'improvement' | 'bug_fix' | 'security' | 'performance' | 'breaking_change' | 'deprecated' | 'removed' | 'documentation'
export type ReleaseStatus = 'draft' | 'scheduled' | 'released' | 'archived'
export type ImpactLevel = 'critical' | 'major' | 'minor' | 'patch' | 'none'

export interface Changelog {
  id: string
  user_id: string
  title: string
  description?: string
  change_type: ChangeType
  version: string
  version_major?: number
  version_minor?: number
  version_patch?: number
  version_tag?: string
  release_name?: string
  release_date?: string
  release_status: ReleaseStatus
  summary?: string
  details?: string
  technical_details?: string
  migration_notes?: string
  impact_level: ImpactLevel
  breaking_change: boolean
  requires_migration: boolean
  requires_downtime: boolean
  category?: string
  component?: string
  affected_modules?: string[]
  affected_apis?: string[]
  author_id?: string
  author_name?: string
  contributors?: string[]
  reviewers?: string[]
  pr_url?: string
  issue_url?: string
  documentation_url?: string
  demo_url?: string
  related_changes?: string[]
  commit_hash?: string
  branch_name?: string
  repository?: string
  pull_request_number?: number
  ticket_id?: string
  jira_key?: string
  epic_id?: string
  sprint_id?: string
  is_public: boolean
  is_featured: boolean
  show_in_changelog: boolean
  visibility: string
  target_audience?: string[]
  applies_to_versions?: string[]
  platform?: string[]
  environment?: string
  rollout_percentage: number
  rollout_start_date?: string
  rollout_end_date?: string
  rollout_status?: string
  adoption_rate?: number
  satisfaction_score?: number
  issue_count: number
  feedback_count: number
  is_deprecated: boolean
  deprecated_at?: string
  deprecation_reason?: string
  alternative_solution?: string
  removal_date?: string
  screenshots?: string[]
  videos?: string[]
  demo_images?: string[]
  view_count: number
  like_count: number
  comment_count: number
  slug?: string
  meta_description?: string
  keywords?: string[]
  published_at?: string
  scheduled_for?: string
  last_published_at?: string
  notify_users: boolean
  notification_sent: boolean
  notification_sent_at?: string
  tags?: string[]
  priority?: string
  severity?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseChangelogOptions {
  changeType?: ChangeType | 'all'
  releaseStatus?: ReleaseStatus | 'all'
  limit?: number
}

export function useChangelog(options: UseChangelogOptions = {}) {
  const { changeType, releaseStatus, limit } = options

  const filters: Record<string, any> = {}
  if (changeType && changeType !== 'all') filters.change_type = changeType
  if (releaseStatus && releaseStatus !== 'all') filters.release_status = releaseStatus

  const queryOptions: any = {
    table: 'changelog',
    filters,
    orderBy: { column: 'version', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Changelog>(queryOptions)

  const { mutate: createChange } = useSupabaseMutation({
    table: 'changelog',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateChange } = useSupabaseMutation({
    table: 'changelog',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteChange } = useSupabaseMutation({
    table: 'changelog',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    changelog: data,
    loading,
    error,
    createChange,
    updateChange,
    deleteChange,
    refetch
  }
}
