/**
 * Team Hub Queries
 *
 * Supabase queries for team member and department management.
 * Supports CRUD operations, analytics, and team collaboration.
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('TeamHubQueries')

// Types matching the database schema
export type MemberStatus = 'online' | 'offline' | 'busy' | 'away'
export type AvailabilityStatus = 'available' | 'busy' | 'in_meeting' | 'on_break' | 'offline' | 'on_leave'
export type RoleLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
export type DepartmentType = 'design' | 'development' | 'management' | 'marketing' | 'qa' | 'content' | 'operations' | 'analytics' | 'sales' | 'support'

export interface TeamMember {
  id: string
  user_id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role: string
  role_level: RoleLevel
  department: DepartmentType
  phone?: string
  location?: string
  timezone: string
  status: MemberStatus
  availability: AvailabilityStatus
  last_seen?: string
  skills: string[]
  start_date?: string
  projects_count: number
  tasks_completed: number
  rating: number
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  user_id: string
  name: string
  type: DepartmentType
  description?: string
  head_member_id?: string
  member_count: number
  active_projects: number
  budget?: number
  location?: string
  goals: string[]
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TeamOverview {
  total_members: number
  online_members: number
  total_departments: number
  total_projects: number
  total_tasks_completed: number
  average_rating: number
}

export interface DepartmentStats {
  member_count: number
  online_count: number
  average_rating: number
  total_tasks_completed: number
  total_projects: number
}

export interface TopPerformer {
  member_id: string
  name: string
  role: string
  department: DepartmentType
  rating: number
  tasks_completed: number
  projects_count: number
}

// ============================================
// TEAM MEMBER CRUD OPERATIONS
// ============================================

/**
 * Get all team members with optional filters
 */
export async function getTeamMembers(
  userId: string,
  filters?: {
    department?: DepartmentType
    status?: MemberStatus
    availability?: AvailabilityStatus
    roleLevel?: RoleLevel
    searchTerm?: string
  }
): Promise<{ data: TeamMember[]; error: any }> {
  try {
    logger.info('Fetching team members from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    // Apply filters
    if (filters?.department) {
      query = query.eq('department', filters.department)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.availability) {
      query = query.eq('availability', filters.availability)
    }
    if (filters?.roleLevel) {
      query = query.eq('role_level', filters.roleLevel)
    }
    if (filters?.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,role.ilike.%${filters.searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch team members', { error, userId })
      return { data: [], error }
    }

    logger.info('Team members fetched successfully', {
      count: data?.length || 0,
      userId
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching team members', { error, userId })
    return { data: [], error }
  }
}

/**
 * Get a single team member by ID
 */
export async function getTeamMember(
  memberId: string,
  userId: string
): Promise<{ data: TeamMember | null; error: any }> {
  try {
    logger.info('Fetching team member from Supabase', { memberId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch team member', { error, memberId })
      return { data: null, error }
    }

    logger.info('Team member fetched successfully', { memberId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching team member', { error, memberId })
    return { data: null, error }
  }
}

/**
 * Create a new team member
 */
export async function createTeamMember(
  userId: string,
  member: {
    name: string
    email: string
    role: string
    department: DepartmentType
    avatar?: string
    bio?: string
    role_level?: RoleLevel
    phone?: string
    location?: string
    timezone?: string
    skills?: string[]
    start_date?: string
  }
): Promise<{ data: TeamMember | null; error: any }> {
  try {
    logger.info('Creating team member in Supabase', { userId, member })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        avatar: member.avatar,
        bio: member.bio,
        role_level: member.role_level || 'mid',
        phone: member.phone,
        location: member.location,
        timezone: member.timezone || 'UTC',
        skills: member.skills || [],
        start_date: member.start_date,
        status: 'offline',
        availability: 'available'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create team member', { error, userId })
      return { data: null, error }
    }

    logger.info('Team member created successfully', {
      memberId: data.id,
      name: member.name
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating team member', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(
  memberId: string,
  userId: string,
  updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: TeamMember | null; error: any }> {
  try {
    logger.info('Updating team member in Supabase', { memberId, userId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update team member', { error, memberId })
      return { data: null, error }
    }

    logger.info('Team member updated successfully', { memberId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating team member', { error, memberId })
    return { data: null, error }
  }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(
  memberId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting team member from Supabase', { memberId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete team member', { error, memberId })
      return { success: false, error }
    }

    logger.info('Team member deleted successfully', { memberId })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting team member', { error, memberId })
    return { success: false, error }
  }
}

/**
 * Update member status (online, offline, busy, away)
 */
export async function updateMemberStatus(
  memberId: string,
  userId: string,
  status: MemberStatus
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Updating member status', { memberId, userId, status })

    const supabase = createClient()
    const { error } = await supabase
      .from('team_members')
      .update({ status, last_seen: new Date().toISOString() })
      .eq('id', memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to update member status', { error, memberId })
      return { success: false, error }
    }

    logger.info('Member status updated successfully', { memberId, status })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception updating member status', { error, memberId })
    return { success: false, error }
  }
}

/**
 * Update member availability
 */
export async function updateMemberAvailability(
  memberId: string,
  userId: string,
  availability: AvailabilityStatus
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Updating member availability', { memberId, userId, availability })

    const supabase = createClient()
    const { error } = await supabase
      .from('team_members')
      .update({ availability })
      .eq('id', memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to update member availability', { error, memberId })
      return { success: false, error }
    }

    logger.info('Member availability updated successfully', { memberId, availability })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception updating member availability', { error, memberId })
    return { success: false, error }
  }
}

// ============================================
// DEPARTMENT CRUD OPERATIONS
// ============================================

/**
 * Get all departments
 */
export async function getDepartments(
  userId: string
): Promise<{ data: Department[]; error: any }> {
  try {
    logger.info('Fetching departments from Supabase', { userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to fetch departments', { error, userId })
      return { data: [], error }
    }

    logger.info('Departments fetched successfully', {
      count: data?.length || 0,
      userId
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching departments', { error, userId })
    return { data: [], error }
  }
}

/**
 * Get a single department by ID
 */
export async function getDepartment(
  departmentId: string,
  userId: string
): Promise<{ data: Department | null; error: any }> {
  try {
    logger.info('Fetching department from Supabase', { departmentId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch department', { error, departmentId })
      return { data: null, error }
    }

    logger.info('Department fetched successfully', { departmentId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching department', { error, departmentId })
    return { data: null, error }
  }
}

/**
 * Create a new department
 */
export async function createDepartment(
  userId: string,
  department: {
    name: string
    type: DepartmentType
    description?: string
    head_member_id?: string
    budget?: number
    location?: string
    goals?: string[]
  }
): Promise<{ data: Department | null; error: any }> {
  try {
    logger.info('Creating department in Supabase', { userId, department })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .insert({
        user_id: userId,
        name: department.name,
        type: department.type,
        description: department.description,
        head_member_id: department.head_member_id,
        budget: department.budget,
        location: department.location,
        goals: department.goals || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create department', { error, userId })
      return { data: null, error }
    }

    logger.info('Department created successfully', {
      departmentId: data.id,
      name: department.name
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating department', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a department
 */
export async function updateDepartment(
  departmentId: string,
  userId: string,
  updates: Partial<Omit<Department, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Department | null; error: any }> {
  try {
    logger.info('Updating department in Supabase', { departmentId, userId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', departmentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update department', { error, departmentId })
      return { data: null, error }
    }

    logger.info('Department updated successfully', { departmentId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating department', { error, departmentId })
    return { data: null, error }
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(
  departmentId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting department from Supabase', { departmentId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete department', { error, departmentId })
      return { success: false, error }
    }

    logger.info('Department deleted successfully', { departmentId })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting department', { error, departmentId })
    return { success: false, error }
  }
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

/**
 * Get team overview statistics
 */
export async function getTeamOverview(
  userId: string
): Promise<{ data: TeamOverview | null; error: any }> {
  try {
    logger.info('Fetching team overview from Supabase', { userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_team_overview', { p_user_id: userId })
      .single()

    if (error) {
      logger.error('Failed to fetch team overview', { error, userId })
      return { data: null, error }
    }

    logger.info('Team overview fetched successfully', {
      totalMembers: data?.total_members,
      onlineMembers: data?.online_members
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching team overview', { error, userId })
    return { data: null, error }
  }
}

/**
 * Get department statistics
 */
export async function getDepartmentStats(
  userId: string,
  department: DepartmentType
): Promise<{ data: DepartmentStats | null; error: any }> {
  try {
    logger.info('Fetching department stats', { userId, department })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_department_stats', {
        p_user_id: userId,
        p_department: department
      })
      .single()

    if (error) {
      logger.error('Failed to fetch department stats', { error, userId, department })
      return { data: null, error }
    }

    logger.info('Department stats fetched successfully', {
      department,
      memberCount: data?.member_count
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching department stats', { error, userId, department })
    return { data: null, error }
  }
}

/**
 * Get top performing team members
 */
export async function getTopPerformers(
  userId: string,
  limit: number = 10
): Promise<{ data: TopPerformer[]; error: any }> {
  try {
    logger.info('Fetching top performers', { userId, limit })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_top_performers', {
        p_user_id: userId,
        p_limit: limit
      })

    if (error) {
      logger.error('Failed to fetch top performers', { error, userId })
      return { data: [], error }
    }

    logger.info('Top performers fetched successfully', {
      count: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching top performers', { error, userId })
    return { data: [], error }
  }
}

/**
 * Get members by department
 */
export async function getMembersByDepartment(
  userId: string,
  department: DepartmentType
): Promise<{ data: TeamMember[]; error: any }> {
  return getTeamMembers(userId, { department })
}

/**
 * Search team members
 */
export async function searchTeamMembers(
  userId: string,
  searchTerm: string
): Promise<{ data: TeamMember[]; error: any }> {
  return getTeamMembers(userId, { searchTerm })
}

/**
 * Get online team members
 */
export async function getOnlineMembers(
  userId: string
): Promise<{ data: TeamMember[]; error: any }> {
  return getTeamMembers(userId, { status: 'online' })
}

/**
 * Update member performance stats
 */
export async function updateMemberStats(
  memberId: string,
  incrementProjects: boolean = false,
  incrementTasks: boolean = false
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Updating member stats', { memberId, incrementProjects, incrementTasks })

    const supabase = createClient()
    const { error } = await supabase
      .rpc('update_member_stats', {
        p_member_id: memberId,
        p_increment_projects: incrementProjects,
        p_increment_tasks: incrementTasks
      })

    if (error) {
      logger.error('Failed to update member stats', { error, memberId })
      return { success: false, error }
    }

    logger.info('Member stats updated successfully', { memberId })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception updating member stats', { error, memberId })
    return { success: false, error }
  }
}
