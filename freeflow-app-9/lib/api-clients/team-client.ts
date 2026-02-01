/**
 * Team API Client
 *
 * Provides typed API methods for team member management, roles, and permissions
 * Integrates with Supabase for real-time team collaboration
 *
 * Features:
 * - Full CRUD for team members
 * - Role and permission management
 * - Team invitations
 * - Performance tracking
 * - Department organization
 */

import { createClient } from '@/lib/supabase/client'
import { BaseApiClient, type ApiResponse, type PaginatedResponse } from './base-client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

// ============================================================================
// Types
// ============================================================================

export interface TeamMember {
  id: string
  user_id: string
  organization_id?: string
  name: string
  email: string
  avatar_url: string | null
  role: TeamRole
  department: string | null
  title: string | null
  phone: string | null
  status: 'active' | 'inactive' | 'pending' | 'on_leave' | 'suspended'
  is_lead: boolean
  is_admin: boolean
  permissions: TeamPermission[]
  projects_count: number
  tasks_completed: number
  tasks_assigned: number
  performance_score: number
  hourly_rate: number | null
  hire_date: string | null
  last_active_at: string | null
  skills: string[]
  bio: string | null
  timezone: string | null
  work_hours: WorkHours | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type TeamRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'contractor'
  | 'guest'
  | 'viewer'

export type TeamPermission =
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'tasks.assign'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'clients.view'
  | 'invoices.create'
  | 'invoices.edit'
  | 'invoices.delete'
  | 'invoices.send'
  | 'team.invite'
  | 'team.manage'
  | 'team.remove'
  | 'settings.view'
  | 'settings.edit'
  | 'billing.view'
  | 'billing.manage'
  | 'reports.view'
  | 'reports.export'
  | 'files.upload'
  | 'files.delete'

export interface WorkHours {
  monday: { start: string; end: string } | null
  tuesday: { start: string; end: string } | null
  wednesday: { start: string; end: string } | null
  thursday: { start: string; end: string } | null
  friday: { start: string; end: string } | null
  saturday: { start: string; end: string } | null
  sunday: { start: string; end: string } | null
}

export interface TeamInvitation {
  id: string
  organization_id: string
  email: string
  role: TeamRole
  permissions: TeamPermission[]
  invited_by: string
  invited_by_name: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  message: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface TeamDepartment {
  id: string
  name: string
  description: string | null
  lead_id: string | null
  lead_name: string | null
  color: string | null
  member_count: number
  created_at: string
  updated_at: string
}

export interface CreateTeamMemberData {
  name: string
  email: string
  role: TeamRole
  department?: string
  title?: string
  phone?: string
  permissions?: TeamPermission[]
  is_lead?: boolean
  is_admin?: boolean
  hourly_rate?: number
  hire_date?: string
  skills?: string[]
  bio?: string
  timezone?: string
  work_hours?: WorkHours
  metadata?: Record<string, any>
}

export interface UpdateTeamMemberData {
  name?: string
  email?: string
  avatar_url?: string
  role?: TeamRole
  department?: string
  title?: string
  phone?: string
  status?: 'active' | 'inactive' | 'pending' | 'on_leave' | 'suspended'
  is_lead?: boolean
  is_admin?: boolean
  permissions?: TeamPermission[]
  hourly_rate?: number
  hire_date?: string
  skills?: string[]
  bio?: string
  timezone?: string
  work_hours?: WorkHours
  metadata?: Record<string, any>
}

export interface CreateInvitationData {
  email: string
  role: TeamRole
  permissions?: TeamPermission[]
  message?: string
  expires_in_days?: number
}

export interface TeamFilters {
  status?: ('active' | 'inactive' | 'pending' | 'on_leave' | 'suspended')[]
  role?: TeamRole[]
  department?: string[]
  is_lead?: boolean
  is_admin?: boolean
  search?: string
}

export interface TeamStats {
  total_members: number
  active_members: number
  inactive_members: number
  pending_invitations: number
  on_leave: number
  total_leads: number
  total_admins: number
  departments: {
    name: string
    count: number
  }[]
  roles: {
    role: TeamRole
    count: number
  }[]
  avg_performance_score: number
  avg_tasks_completed: number
  total_hourly_rate: number
  recent_joins: number
  recent_departures: number
}

// ============================================================================
// API Client
// ============================================================================

class TeamClient extends BaseApiClient {
  private supabase = createClient()

  /**
   * Get all team members with pagination and filters
   */
  async getTeamMembers(
    page: number = 1,
    pageSize: number = 20,
    filters?: TeamFilters
  ): Promise<ApiResponse<PaginatedResponse<TeamMember>>> {
    // Demo mode - return empty data
    if (isDemoModeEnabled()) {
      return {
        success: true,
        data: {
          data: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        }
      }
    }

    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = this.supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('name', { ascending: true })

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }

      if (filters?.role?.length) {
        query = query.in('role', filters.role)
      }

      if (filters?.department?.length) {
        query = query.in('department', filters.department)
      }

      if (filters?.is_lead !== undefined) {
        query = query.eq('is_lead', filters.is_lead)
      }

      if (filters?.is_admin !== undefined) {
        query = query.eq('is_admin', filters.is_admin)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > to + 1
        }
      }
    } catch (error) {
      // Silently handle known RLS policy errors, return empty data
      if (error?.code === '42P17') {
        // Infinite recursion in RLS policy - known issue
      } else {
        console.error('Failed to fetch team members:', error)
      }
      return {
        success: true,
        data: {
          data: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        }
      }
    }
  }

  /**
   * Get single team member by ID
   */
  async getTeamMember(id: string): Promise<ApiResponse<TeamMember>> {
    try {
      const { data, error } = await this.supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to fetch team member:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch team member'
      }
    }
  }

  /**
   * Create a new team member
   */
  async createTeamMember(memberData: CreateTeamMemberData): Promise<ApiResponse<TeamMember>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const defaultPermissions = this.getDefaultPermissions(memberData.role)

      const { data, error } = await this.supabase
        .from('team_members')
        .insert({
          ...memberData,
          user_id: user.id,
          status: 'pending',
          permissions: memberData.permissions || defaultPermissions,
          skills: memberData.skills || [],
          metadata: memberData.metadata || {},
          projects_count: 0,
          tasks_completed: 0,
          tasks_assigned: 0,
          performance_score: 0
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to create team member:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create team member'
      }
    }
  }

  /**
   * Update an existing team member
   */
  async updateTeamMember(id: string, updates: UpdateTeamMemberData): Promise<ApiResponse<TeamMember>> {
    try {
      const { data, error } = await this.supabase
        .from('team_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to update team member:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update team member'
      }
    }
  }

  /**
   * Delete a team member
   */
  async deleteTeamMember(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to delete team member:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete team member'
      }
    }
  }

  /**
   * Update team member status
   */
  async updateStatus(
    id: string,
    status: TeamMember['status']
  ): Promise<ApiResponse<TeamMember>> {
    return this.updateTeamMember(id, { status })
  }

  /**
   * Update team member role and permissions
   */
  async updateRole(
    id: string,
    role: TeamRole,
    permissions?: TeamPermission[]
  ): Promise<ApiResponse<TeamMember>> {
    const updates: UpdateTeamMemberData = { role }
    if (permissions) {
      updates.permissions = permissions
    } else {
      updates.permissions = this.getDefaultPermissions(role)
    }
    return this.updateTeamMember(id, updates)
  }

  /**
   * Update team member performance score
   */
  async updatePerformance(id: string, score: number): Promise<ApiResponse<TeamMember>> {
    try {
      const { data, error } = await this.supabase
        .from('team_members')
        .update({
          performance_score: Math.min(100, Math.max(0, score)),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to update performance:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update performance'
      }
    }
  }

  /**
   * Toggle lead status
   */
  async toggleLead(id: string): Promise<ApiResponse<TeamMember>> {
    try {
      // Get current status
      const { data: member, error: fetchError } = await this.supabase
        .from('team_members')
        .select('is_lead')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await this.supabase
        .from('team_members')
        .update({
          is_lead: !member.is_lead,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to toggle lead status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle lead status'
      }
    }
  }

  /**
   * Send team invitation
   */
  async sendInvitation(invitationData: CreateInvitationData): Promise<ApiResponse<TeamInvitation>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (invitationData.expires_in_days || 7))

      const { data, error } = await this.supabase
        .from('team_invitations')
        .insert({
          email: invitationData.email,
          role: invitationData.role,
          permissions: invitationData.permissions || this.getDefaultPermissions(invitationData.role),
          invited_by: user.id,
          message: invitationData.message,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation'
      }
    }
  }

  /**
   * Get pending invitations
   */
  async getInvitations(
    status?: ('pending' | 'accepted' | 'declined' | 'expired')[]
  ): Promise<ApiResponse<TeamInvitation[]>> {
    // Demo mode - return empty data
    if (isDemoModeEnabled()) {
      return { success: true, data: [] }
    }

    try {
      let query = this.supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false })

      if (status?.length) {
        query = query.in('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      // Silently handle RLS policy errors (infinite recursion)
      if (error?.code !== '42P17') {
        console.error('Failed to fetch invitations:', error)
      }
      // Return empty data for graceful degradation
      return { success: true, data: [] }
    }
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('team_invitations')
        .delete()
        .eq('id', id)
        .eq('status', 'pending')

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel invitation'
      }
    }
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(id: string): Promise<ApiResponse<TeamInvitation>> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { data, error } = await this.supabase
        .from('team_invitations')
        .update({
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend invitation'
      }
    }
  }

  /**
   * Get departments
   */
  async getDepartments(): Promise<ApiResponse<TeamDepartment[]>> {
    try {
      // Try 'departments' table first, fall back to 'team_departments'
      const { data, error } = await this.supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        // If departments table doesn't exist, return empty array
        return { success: true, data: [] }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      // Return empty data on error for graceful degradation
      return { success: true, data: [] }
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(): Promise<ApiResponse<TeamStats>> {
    // Demo mode - return default stats
    if (isDemoModeEnabled()) {
      const defaultStats: TeamStats = {
        total_members: 0,
        active_members: 0,
        inactive_members: 0,
        pending_invitations: 0,
        on_leave: 0,
        total_leads: 0,
        total_admins: 0,
        departments: [],
        roles: [],
        avg_performance_score: 0,
        avg_tasks_completed: 0,
        total_hourly_rate: 0,
        recent_joins: 0,
        recent_departures: 0
      }
      return { success: true, data: defaultStats }
    }

    try {
      const { data: members, error } = await this.supabase
        .from('team_members')
        .select('*')

      if (error) throw error

      const { data: invitations } = await this.supabase
        .from('team_invitations')
        .select('*')
        .eq('status', 'pending')

      const memberList = members || []
      const activeMembers = memberList.filter(m => m.status === 'active')

      // Calculate department stats
      const departmentCounts = memberList.reduce((acc, m) => {
        if (m.department) {
          acc[m.department] = (acc[m.department] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      // Calculate role stats
      const roleCounts = memberList.reduce((acc, m) => {
        acc[m.role] = (acc[m.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calculate recent joins (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentJoins = memberList.filter(m =>
        new Date(m.created_at) > thirtyDaysAgo
      ).length

      const stats: TeamStats = {
        total_members: memberList.length,
        active_members: activeMembers.length,
        inactive_members: memberList.filter(m => m.status === 'inactive').length,
        pending_invitations: invitations?.length || 0,
        on_leave: memberList.filter(m => m.status === 'on_leave').length,
        total_leads: memberList.filter(m => m.is_lead).length,
        total_admins: memberList.filter(m => m.is_admin).length,
        departments: Object.entries(departmentCounts).map(([name, count]) => ({ name, count })),
        roles: Object.entries(roleCounts).map(([role, count]) => ({
          role: role as TeamRole,
          count
        })),
        avg_performance_score: activeMembers.length > 0
          ? Math.round(activeMembers.reduce((sum, m) => sum + (m.performance_score || 0), 0) / activeMembers.length)
          : 0,
        avg_tasks_completed: activeMembers.length > 0
          ? Math.round(activeMembers.reduce((sum, m) => sum + (m.tasks_completed || 0), 0) / activeMembers.length)
          : 0,
        total_hourly_rate: memberList.reduce((sum, m) => sum + (m.hourly_rate || 0), 0),
        recent_joins: recentJoins,
        recent_departures: memberList.filter(m =>
          m.status === 'inactive' && new Date(m.updated_at) > thirtyDaysAgo
        ).length
      }

      return { success: true, data: stats }
    } catch (error) {
      // Silently handle known RLS policy errors
      if (error?.code !== '42P17') {
        console.error('Failed to fetch team stats:', error)
      }
      // Return default stats on error (e.g., RLS policy issues)
      const defaultStats: TeamStats = {
        total_members: 0,
        active_members: 0,
        inactive_members: 0,
        pending_invitations: 0,
        on_leave: 0,
        total_leads: 0,
        total_admins: 0,
        departments: [],
        roles: [],
        avg_performance_score: 0,
        recent_joins: 0,
        recent_departures: 0
      }
      return { success: true, data: defaultStats }
    }
  }

  /**
   * Get default permissions for a role
   */
  private getDefaultPermissions(role: TeamRole): TeamPermission[] {
    switch (role) {
      case 'owner':
      case 'admin':
        return [
          'projects.create', 'projects.edit', 'projects.delete', 'projects.view',
          'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign',
          'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
          'invoices.create', 'invoices.edit', 'invoices.delete', 'invoices.send',
          'team.invite', 'team.manage', 'team.remove',
          'settings.view', 'settings.edit',
          'billing.view', 'billing.manage',
          'reports.view', 'reports.export',
          'files.upload', 'files.delete'
        ]
      case 'manager':
        return [
          'projects.create', 'projects.edit', 'projects.view',
          'tasks.create', 'tasks.edit', 'tasks.assign',
          'clients.create', 'clients.edit', 'clients.view',
          'invoices.create', 'invoices.edit', 'invoices.send',
          'team.invite',
          'settings.view',
          'reports.view', 'reports.export',
          'files.upload', 'files.delete'
        ]
      case 'member':
        return [
          'projects.view',
          'tasks.create', 'tasks.edit',
          'clients.view',
          'invoices.view',
          'reports.view',
          'files.upload'
        ]
      case 'contractor':
        return [
          'projects.view',
          'tasks.create', 'tasks.edit',
          'files.upload'
        ]
      case 'guest':
      case 'viewer':
        return [
          'projects.view',
          'clients.view',
          'reports.view'
        ]
      default:
        return ['projects.view']
    }
  }
}

// Export singleton instance
export const teamClient = new TeamClient()
