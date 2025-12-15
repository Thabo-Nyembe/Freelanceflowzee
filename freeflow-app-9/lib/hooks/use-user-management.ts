import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'team_lead' | 'member' | 'user' | 'guest' | 'custom'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'locked' | 'archived'

export interface ManagedUser {
  id: string
  user_id: string
  managed_user_id: string
  username?: string
  email: string
  full_name?: string
  display_name?: string
  role: UserRole
  permissions?: string[]
  permission_groups?: string[]
  custom_permissions: any
  status: UserStatus
  account_status?: string
  email_verified: boolean
  phone_verified: boolean
  department?: string
  job_title?: string
  employee_id?: string
  hire_date?: string
  termination_date?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  two_factor_enabled: boolean
  security_questions_set: boolean
  password_changed_at?: string
  must_change_password: boolean
  failed_login_attempts: number
  locked_until?: string
  last_login_at?: string
  last_active_at?: string
  last_login_ip?: string
  login_count: number
  session_timeout: number
  team_ids?: string[]
  organization_id?: string
  reports_to?: string
  manages_team_ids?: string[]
  language: string
  timezone: string
  date_format?: string
  time_format?: string
  notifications_enabled: boolean
  preferences: any
  storage_quota?: number
  storage_used: number
  api_quota?: number
  api_calls_used: number
  onboarding_completed: boolean
  onboarding_completed_at?: string
  training_completed?: string[]
  certifications?: string[]
  notes?: string
  tags?: string[]
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseUserManagementOptions {
  role?: UserRole | 'all'
  status?: UserStatus | 'all'
  department?: string | 'all'
  limit?: number
}

export function useUserManagement(options: UseUserManagementOptions = {}) {
  const { role, status, department, limit } = options

  const filters: Record<string, any> = {}
  if (role && role !== 'all') filters.role = role
  if (status && status !== 'all') filters.status = status
  if (department && department !== 'all') filters.department = department

  const queryOptions: any = {
    table: 'user_management',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<ManagedUser>(queryOptions)

  const { mutate: create } = useSupabaseMutation<ManagedUser>({
    table: 'user_management',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<ManagedUser>({
    table: 'user_management',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<ManagedUser>({
    table: 'user_management',
    operation: 'delete'
  })

  return {
    users: data,
    loading,
    error,
    createUser: create,
    updateUser: update,
    deleteUser: remove,
    refetch
  }
}
