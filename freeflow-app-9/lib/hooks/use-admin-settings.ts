import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type ValueType = 'string' | 'number' | 'boolean' | 'json' | 'array' | 'date' | 'time' | 'datetime' | 'color' | 'url' | 'email'
export type SettingScope = 'global' | 'organization' | 'team' | 'user' | 'custom'
export type AccessLevel = 'superadmin' | 'admin' | 'manager' | 'user' | 'public'
export type SettingStatus = 'active' | 'inactive' | 'deprecated' | 'testing'

export interface AdminSetting {
  id: string
  user_id: string
  setting_key: string
  setting_category: string
  setting_group?: string
  setting_name: string
  description?: string
  value_type: ValueType
  value_string?: string
  value_number?: number
  value_boolean?: boolean
  value_json?: any
  default_value?: string
  scope: SettingScope
  access_level: AccessLevel
  status: SettingStatus
  is_required: boolean
  is_encrypted: boolean
  is_visible: boolean
  is_editable: boolean
  validation_rules: any
  allowed_values?: string[]
  min_value?: number
  max_value?: number
  pattern?: string
  previous_value?: string
  changed_by?: string
  changed_at?: string
  change_reason?: string
  version: number
  depends_on?: string[]
  affects_settings?: string[]
  help_text?: string
  warning_text?: string
  tags?: string[]
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseAdminSettingsOptions {
  category?: string | 'all'
  scope?: SettingScope | 'all'
  status?: SettingStatus | 'all'
  limit?: number
}

export function useAdminSettings(options: UseAdminSettingsOptions = {}) {
  const { category, scope, status, limit } = options

  const filters: Record<string, any> = {}
  if (category && category !== 'all') filters.setting_category = category
  if (scope && scope !== 'all') filters.scope = scope
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'admin_settings',
    filters,
    orderBy: { column: 'setting_category', ascending: true },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<AdminSetting>(queryOptions)

  const { mutate: create } = useSupabaseMutation<AdminSetting>({
    table: 'admin_settings',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<AdminSetting>({
    table: 'admin_settings',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<AdminSetting>({
    table: 'admin_settings',
    operation: 'delete'
  })

  return {
    settings: data,
    loading,
    error,
    createSetting: create,
    updateSetting: update,
    deleteSetting: remove,
    refetch
  }
}
