'use client'

import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type Platform = 'all' | 'windows' | 'macos' | 'linux' | 'cross-platform'
export type BuildStatus = 'pending' | 'building' | 'testing' | 'stable' | 'beta' | 'deprecated' | 'failed'

export interface DesktopApp {
  id: string
  user_id: string
  app_name: string
  app_version: string
  build_number: string | null
  platform: Platform
  supported_os: string[] | null
  minimum_os_version: string | null
  total_installs: number
  active_users: number
  windows_installs: number
  macos_installs: number
  linux_installs: number
  current_version: string | null
  latest_version: string | null
  previous_version: string | null
  update_rate: number
  auto_update_enabled: boolean
  performance_score: number
  startup_time_ms: number
  memory_usage_mb: number
  cpu_usage_percent: number
  crash_rate: number
  build_status: BuildStatus
  build_date: string | null
  release_date: string | null
  deployment_date: string | null
  download_url: string | null
  checksum: string | null
  file_size_mb: number
  installer_type: string | null
  offline_sync_enabled: boolean
  auto_backup_enabled: boolean
  telemetry_enabled: boolean
  analytics_enabled: boolean
  user_rating: number
  review_count: number
  helpful_rating_percent: number
  nps_score: number
  known_issues: number
  critical_bugs: number
  bug_fix_rate: number
  open_tickets: number
  adoption_rate: number
  retention_rate: number
  churn_rate: number
  daily_active_users: number
  monthly_active_users: number
  update_channel: string | null
  force_update: boolean
  rollback_available: boolean
  rollback_version: string | null
  security_score: number
  last_security_audit: string | null
  vulnerability_count: number
  code_signing_enabled: boolean
  description: string | null
  release_notes: string | null
  changelog: string | null
  tags: string[] | null
  category: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseDesktopAppsOptions {
  platform?: Platform | 'all'
  status?: BuildStatus | 'all'
}

export function useDesktopApps(options: UseDesktopAppsOptions = {}) {
  const { platform, status } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('desktop_apps')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }

    if (status && status !== 'all') {
      query = query.eq('build_status', status)
    }

    return query
  }

  return useSupabaseQuery<DesktopApp>('desktop_apps', buildQuery, [platform, status])
}

export function useCreateDesktopApp() {
  return useSupabaseMutation<DesktopApp>('desktop_apps', 'insert')
}

export function useUpdateDesktopApp() {
  return useSupabaseMutation<DesktopApp>('desktop_apps', 'update')
}

export function useDeleteDesktopApp() {
  return useSupabaseMutation<DesktopApp>('desktop_apps', 'delete')
}
