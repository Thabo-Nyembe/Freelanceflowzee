/**
 * Team Hub Queries
 *
 * Supabase queries for team member and department management.
 * Supports CRUD operations, analytics, and team collaboration.
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

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
  settings: Record<string, JsonValue>
  metadata: Record<string, JsonValue>
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
  settings: Record<string, JsonValue>
  metadata: Record<string, JsonValue>
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
): Promise<{ data: TeamMember[]; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching team members', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get a single team member by ID
 */
export async function getTeamMember(
  memberId: string,
  userId: string
): Promise<{ data: TeamMember | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching team member', { error, memberId })
    return { data: null, error: toDbError(error) }
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
): Promise<{ data: TeamMember | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception creating team member', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(
  memberId: string,
  userId: string,
  updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: TeamMember | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception updating team member', { error, memberId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(
  memberId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception deleting team member', { error, memberId })
    return { success: false, error: toDbError(error) }
  }
}

/**
 * Update member status (online, offline, busy, away)
 */
export async function updateMemberStatus(
  memberId: string,
  userId: string,
  status: MemberStatus
): Promise<{ success: boolean; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception updating member status', { error, memberId })
    return { success: false, error: toDbError(error) }
  }
}

/**
 * Update member availability
 */
export async function updateMemberAvailability(
  memberId: string,
  userId: string,
  availability: AvailabilityStatus
): Promise<{ success: boolean; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception updating member availability', { error, memberId })
    return { success: false, error: toDbError(error) }
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
): Promise<{ data: Department[]; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching departments', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get a single department by ID
 */
export async function getDepartment(
  departmentId: string,
  userId: string
): Promise<{ data: Department | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching department', { error, departmentId })
    return { data: null, error: toDbError(error) }
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
): Promise<{ data: Department | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception creating department', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a department
 */
export async function updateDepartment(
  departmentId: string,
  userId: string,
  updates: Partial<Omit<Department, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Department | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception updating department', { error, departmentId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a department
 */
export async function deleteDepartment(
  departmentId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception deleting department', { error, departmentId })
    return { success: false, error: toDbError(error) }
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
): Promise<{ data: TeamOverview | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching team overview', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get department statistics
 */
export async function getDepartmentStats(
  userId: string,
  department: DepartmentType
): Promise<{ data: DepartmentStats | null; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching department stats', { error, userId, department })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get top performing team members
 */
export async function getTopPerformers(
  userId: string,
  limit: number = 10
): Promise<{ data: TopPerformer[]; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception fetching top performers', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get members by department
 */
export async function getMembersByDepartment(
  userId: string,
  department: DepartmentType
): Promise<{ data: TeamMember[]; error: DatabaseError | null }> {
  return getTeamMembers(userId, { department })
}

/**
 * Search team members
 */
export async function searchTeamMembers(
  userId: string,
  searchTerm: string
): Promise<{ data: TeamMember[]; error: DatabaseError | null }> {
  return getTeamMembers(userId, { searchTerm })
}

/**
 * Get online team members
 */
export async function getOnlineMembers(
  userId: string
): Promise<{ data: TeamMember[]; error: DatabaseError | null }> {
  return getTeamMembers(userId, { status: 'online' })
}

/**
 * Update member performance stats
 */
export async function updateMemberStats(
  memberId: string,
  incrementProjects: boolean = false,
  incrementTasks: boolean = false
): Promise<{ success: boolean; error: DatabaseError | null }> {
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
  } catch (error: unknown) {
    logger.error('Exception updating member stats', { error, memberId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================
// TEAM GOALS & MILESTONES
// ============================================

export interface TeamGoal {
  id: string
  title: string
  target: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

export interface TeamMilestone {
  id: string
  title: string
  project: string
  date: string
  status: 'pending' | 'achieved'
  created_at: string
}

export interface TeamFeedback {
  id: string
  member_id: string
  rating: number
  comments: string
  submitted_at: string
}

export interface TeamRecognition {
  id: string
  member_id: string
  award: string
  reason: string
  awarded_at: string
}

export interface TeamTask {
  id: string
  member_id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

/**
 * Create a team goal - stores in department goals metadata
 */
export async function createTeamGoal(
  userId: string,
  goal: {
    title: string
    target: string
    deadline: string
  }
): Promise<{ data: TeamGoal | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating team goal', { userId, goal })

    const supabase = createClient()

    // Get or create a default department for goals
    const { data: depts } = await supabase
      .from('departments')
      .select('id, metadata')
      .eq('user_id', userId)
      .limit(1)
      .single()

    const newGoal: TeamGoal = {
      id: crypto.randomUUID(),
      title: goal.title,
      target: goal.target,
      deadline: goal.deadline,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    if (depts) {
      // Add goal to existing department metadata
      const existingGoals = depts.metadata?.goals || []
      const { error } = await supabase
        .from('departments')
        .update({
          metadata: {
            ...depts.metadata,
            goals: [...existingGoals, newGoal]
          }
        })
        .eq('id', depts.id)
        .eq('user_id', userId)

      if (error) {
        logger.error('Failed to create team goal', { error, userId })
        return { data: null, error }
      }
    } else {
      // Create a default department with the goal
      const { error } = await supabase
        .from('departments')
        .insert({
          user_id: userId,
          name: 'Team Goals',
          type: 'management',
          metadata: { goals: [newGoal] }
        })

      if (error) {
        logger.error('Failed to create department for goal', { error, userId })
        return { data: null, error }
      }
    }

    logger.info('Team goal created successfully', { goalId: newGoal.id })
    return { data: newGoal, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating team goal', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a team milestone - stores in department metadata
 */
export async function createTeamMilestone(
  userId: string,
  milestone: {
    title: string
    project: string
    date: string
  }
): Promise<{ data: TeamMilestone | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating team milestone', { userId, milestone })

    const supabase = createClient()

    const { data: depts } = await supabase
      .from('departments')
      .select('id, metadata')
      .eq('user_id', userId)
      .limit(1)
      .single()

    const newMilestone: TeamMilestone = {
      id: crypto.randomUUID(),
      title: milestone.title,
      project: milestone.project,
      date: milestone.date,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    if (depts) {
      const existingMilestones = depts.metadata?.milestones || []
      const { error } = await supabase
        .from('departments')
        .update({
          metadata: {
            ...depts.metadata,
            milestones: [...existingMilestones, newMilestone]
          }
        })
        .eq('id', depts.id)
        .eq('user_id', userId)

      if (error) {
        logger.error('Failed to create milestone', { error, userId })
        return { data: null, error }
      }
    } else {
      const { error } = await supabase
        .from('departments')
        .insert({
          user_id: userId,
          name: 'Team Milestones',
          type: 'management',
          metadata: { milestones: [newMilestone] }
        })

      if (error) {
        logger.error('Failed to create department for milestone', { error, userId })
        return { data: null, error }
      }
    }

    logger.info('Team milestone created successfully', { milestoneId: newMilestone.id })
    return { data: newMilestone, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating milestone', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Submit feedback for a team member - stores in member metadata
 */
export async function submitTeamFeedback(
  userId: string,
  feedback: {
    memberId: string
    rating: number
    comments: string
  }
): Promise<{ data: TeamFeedback | null; error: DatabaseError | null }> {
  try {
    logger.info('Submitting team feedback', { userId, memberId: feedback.memberId })

    const supabase = createClient()

    // Get current member data
    const { data: member } = await supabase
      .from('team_members')
      .select('id, metadata, rating')
      .eq('id', feedback.memberId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      return { data: null, error: { message: 'Member not found' } }
    }

    const newFeedback: TeamFeedback = {
      id: crypto.randomUUID(),
      member_id: feedback.memberId,
      rating: feedback.rating,
      comments: feedback.comments,
      submitted_at: new Date().toISOString()
    }

    const existingFeedback = member.metadata?.feedback || []
    const allFeedback = [...existingFeedback, newFeedback]

    // Calculate new average rating
    const totalRatings = allFeedback.length
    const sumRatings = allFeedback.reduce((sum: number, f: TeamFeedback) => sum + f.rating, 0)
    const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : member.rating

    const { error } = await supabase
      .from('team_members')
      .update({
        metadata: { ...member.metadata, feedback: allFeedback },
        rating: newAverageRating
      })
      .eq('id', feedback.memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to submit feedback', { error, memberId: feedback.memberId })
      return { data: null, error }
    }

    logger.info('Team feedback submitted successfully', { feedbackId: newFeedback.id })
    return { data: newFeedback, error: null }
  } catch (error: unknown) {
    logger.error('Exception submitting feedback', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Give recognition/award to a team member - stores in member metadata
 */
export async function giveTeamRecognition(
  userId: string,
  recognition: {
    memberId: string
    award: string
    reason: string
  }
): Promise<{ data: TeamRecognition | null; error: DatabaseError | null }> {
  try {
    logger.info('Giving team recognition', { userId, memberId: recognition.memberId })

    const supabase = createClient()

    const { data: member } = await supabase
      .from('team_members')
      .select('id, metadata')
      .eq('id', recognition.memberId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      return { data: null, error: { message: 'Member not found' } }
    }

    const newRecognition: TeamRecognition = {
      id: crypto.randomUUID(),
      member_id: recognition.memberId,
      award: recognition.award,
      reason: recognition.reason,
      awarded_at: new Date().toISOString()
    }

    const existingRecognitions = member.metadata?.recognitions || []

    const { error } = await supabase
      .from('team_members')
      .update({
        metadata: {
          ...member.metadata,
          recognitions: [...existingRecognitions, newRecognition]
        }
      })
      .eq('id', recognition.memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to give recognition', { error, memberId: recognition.memberId })
      return { data: null, error }
    }

    logger.info('Team recognition given successfully', { recognitionId: newRecognition.id })
    return { data: newRecognition, error: null }
  } catch (error: unknown) {
    logger.error('Exception giving recognition', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Assign a task to a team member - stores in member metadata and increments stats
 */
export async function assignTeamTask(
  userId: string,
  task: {
    memberId: string
    title: string
    priority: 'low' | 'medium' | 'high'
    dueDate: string
  }
): Promise<{ data: TeamTask | null; error: DatabaseError | null }> {
  try {
    logger.info('Assigning team task', { userId, memberId: task.memberId })

    const supabase = createClient()

    const { data: member } = await supabase
      .from('team_members')
      .select('id, metadata, projects_count')
      .eq('id', task.memberId)
      .eq('user_id', userId)
      .single()

    if (!member) {
      return { data: null, error: { message: 'Member not found' } }
    }

    const newTask: TeamTask = {
      id: crypto.randomUUID(),
      member_id: task.memberId,
      title: task.title,
      priority: task.priority,
      due_date: task.dueDate,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const existingTasks = member.metadata?.tasks || []

    const { error } = await supabase
      .from('team_members')
      .update({
        metadata: {
          ...member.metadata,
          tasks: [...existingTasks, newTask]
        },
        projects_count: (member.projects_count || 0) + 1
      })
      .eq('id', task.memberId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to assign task', { error, memberId: task.memberId })
      return { data: null, error }
    }

    logger.info('Team task assigned successfully', { taskId: newTask.id })
    return { data: newTask, error: null }
  } catch (error: unknown) {
    logger.error('Exception assigning task', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}
