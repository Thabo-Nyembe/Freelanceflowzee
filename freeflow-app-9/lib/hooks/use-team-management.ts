import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type TeamType = 'department' | 'project' | 'functional' | 'cross_functional' | 'temporary' | 'permanent' | 'virtual' | 'custom'
export type TeamStatus = 'active' | 'inactive' | 'archived' | 'forming' | 'suspended'
export type TeamVisibility = 'public' | 'private' | 'restricted' | 'secret'
export type JoinPolicy = 'open' | 'approval_required' | 'invitation_only' | 'closed'

export interface Team {
  id: string
  user_id: string
  team_name: string
  team_code?: string
  description?: string
  team_type: TeamType
  team_lead_id?: string
  manager_id?: string
  sponsor_id?: string
  status: TeamStatus
  visibility: TeamVisibility
  join_policy: JoinPolicy
  member_ids?: string[]
  member_count: number
  max_members?: number
  pending_member_ids?: string[]
  parent_team_id?: string
  child_team_ids?: string[]
  organization_id?: string
  department?: string
  division?: string
  location?: string
  goals?: string[]
  objectives: any
  key_results: any
  performance_metrics: any
  permissions?: string[]
  access_level: string
  can_invite_members: boolean
  can_remove_members: boolean
  can_manage_projects: boolean
  chat_enabled: boolean
  email_alias?: string
  slack_channel?: string
  teams_channel?: string
  meeting_schedule?: string
  budget?: number
  budget_used: number
  tools_access?: string[]
  assigned_resources: any
  start_date?: string
  end_date?: string
  formation_date?: string
  dissolution_date?: string
  health_score?: number
  productivity_score?: number
  collaboration_score?: number
  engagement_score?: number
  milestones: any
  achievements?: string[]
  settings: any
  preferences: any
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

export interface UseTeamManagementOptions {
  teamType?: TeamType | 'all'
  status?: TeamStatus | 'all'
  department?: string | 'all'
  limit?: number
}

export function useTeamManagement(options: UseTeamManagementOptions = {}) {
  const { teamType, status, department, limit } = options

  const filters: Record<string, any> = {}
  if (teamType && teamType !== 'all') filters.team_type = teamType
  if (status && status !== 'all') filters.status = status
  if (department && department !== 'all') filters.department = department

  const queryOptions: any = {
    table: 'team_management',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Team>(queryOptions)

  const { mutate: create } = useSupabaseMutation<Team>({
    table: 'team_management',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<Team>({
    table: 'team_management',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<Team>({
    table: 'team_management',
    operation: 'delete'
  })

  return {
    teams: data,
    loading,
    error,
    createTeam: create,
    updateTeam: update,
    deleteTeam: remove,
    refetch
  }
}
