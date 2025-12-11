/**
 * KAZI Platform - Comprehensive Projects API
 *
 * Full-featured project management with database integration.
 * Supports CRUD operations, team management, file attachments,
 * task integration, and analytics.
 *
 * @module app/api/projects/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: string
  user_id: string
  team_id?: string
  client_id?: string
  budget?: number
  currency?: string
  start_date?: string
  due_date?: string
  completed_at?: string
  progress: number
  visibility: 'private' | 'team' | 'public'
  settings: Record<string, unknown>
  metadata: Record<string, unknown>
  tags: string[]
  cover_image?: string
  created_at: string
  updated_at: string
}

interface ProjectStats {
  total_tasks: number
  completed_tasks: number
  total_files: number
  total_comments: number
  total_hours: number
  team_members: number
}

// ============================================================================
// DATABASE CLIENT
// ============================================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================================
// GET - List Projects / Get Single Project
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const projectId = searchParams.get('id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const clientId = searchParams.get('client_id')
    const teamId = searchParams.get('team_id')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'updated_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeStats = searchParams.get('include_stats') === 'true'
    const includeMembers = searchParams.get('include_members') === 'true'
    const includeTasks = searchParams.get('include_tasks') === 'true'

    const supabase = getSupabase()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        projects: getDemoProjects(),
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          totalPages: 1
        }
      })
    }

    const userId = session.user.id

    // Single project fetch
    if (projectId) {
      // Check permission
      const canRead = await checkPermission(userId, 'projects', 'read', projectId)
      if (!canRead) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }

      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(id, name, email, company),
          team:teams(id, name),
          owner:users!projects_user_id_fkey(id, name, email, avatar_url)
        `)
        .eq('id', projectId)
        .single()

      if (error || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      // Get additional data if requested
      let stats: ProjectStats | null = null
      let members: unknown[] = []
      let tasks: unknown[] = []

      if (includeStats) {
        stats = await getProjectStats(supabase, projectId)
      }

      if (includeMembers) {
        const { data: memberData } = await supabase
          .from('project_members')
          .select(`
            id, role, can_edit, can_delete,
            user:users(id, name, email, avatar_url)
          `)
          .eq('project_id', projectId)

        members = memberData || []
      }

      if (includeTasks) {
        const { data: taskData } = await supabase
          .from('tasks')
          .select('id, title, status, priority, due_date, assignee_id')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10)

        tasks = taskData || []
      }

      return NextResponse.json({
        success: true,
        project: {
          ...project,
          stats,
          members,
          recent_tasks: tasks
        }
      })
    }

    // Build query for project list
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:clients(id, name, company),
        team:teams(id, name)
      `, { count: 'exact' })

    // Filter by user access (owner, team member, or project member)
    query = query.or(`user_id.eq.${userId},visibility.eq.public`)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: projects, error, count } = await query

    if (error) {
      console.error('Projects query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Get stats for each project if requested
    let projectsWithStats = projects || []
    if (includeStats && projects?.length) {
      projectsWithStats = await Promise.all(
        projects.map(async (project) => ({
          ...project,
          stats: await getProjectStats(supabase, project.id)
        }))
      )
    }

    return NextResponse.json({
      success: true,
      projects: projectsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Project
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check permission
    const canCreate = await checkPermission(userId, 'projects', 'create')
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      status = 'planning',
      priority = 'medium',
      type = 'general',
      team_id,
      client_id,
      budget,
      currency = 'USD',
      start_date,
      due_date,
      visibility = 'private',
      settings = {},
      metadata = {},
      tags = [],
      cover_image,
      template_id,
      members = []
    } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // If using a template, copy template settings
    let templateData = {}
    if (template_id) {
      const { data: template } = await supabase
        .from('project_templates')
        .select('settings, default_tasks, metadata')
        .eq('id', template_id)
        .single()

      if (template) {
        templateData = {
          settings: { ...template.settings, ...settings },
          metadata: { ...template.metadata, ...metadata, template_id }
        }
      }
    }

    // Create project
    const projectData = {
      name: name.trim(),
      description: description?.trim() || '',
      status,
      priority,
      type,
      user_id: userId,
      team_id: team_id || null,
      client_id: client_id || null,
      budget: budget || null,
      currency,
      start_date: start_date || null,
      due_date: due_date || null,
      progress: 0,
      visibility,
      settings: { ...settings, ...templateData },
      metadata: metadata || {},
      tags: tags || [],
      cover_image: cover_image || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Project creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Add creator as project member with owner role
    await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: userId,
        role: 'owner',
        can_edit: true,
        can_delete: true,
        can_share: true,
        can_manage_members: true
      })

    // Add additional members if specified
    if (members.length > 0) {
      const memberRecords = members.map((member: { user_id: string; role?: string }) => ({
        project_id: project.id,
        user_id: member.user_id,
        role: member.role || 'member',
        can_edit: member.role !== 'guest',
        can_delete: false,
        can_share: false,
        can_manage_members: false,
        assigned_by: userId
      }))

      await supabase.from('project_members').insert(memberRecords)
    }

    // Create default tasks from template if applicable
    if (template_id) {
      const { data: template } = await supabase
        .from('project_templates')
        .select('default_tasks')
        .eq('id', template_id)
        .single()

      if (template?.default_tasks?.length) {
        const taskRecords = template.default_tasks.map((task: Record<string, unknown>, index: number) => ({
          ...task,
          project_id: project.id,
          user_id: userId,
          position: index,
          created_at: new Date().toISOString()
        }))

        await supabase.from('tasks').insert(taskRecords)
      }
    }

    // Log activity
    await logProjectActivity(supabase, project.id, userId, 'created', {
      project_name: project.name
    })

    return NextResponse.json({
      success: true,
      project,
      message: 'Project created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Projects POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Project
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canUpdate = await checkPermission(userId, 'projects', 'update', id)
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const supabase = getSupabase()

    // Get current project for comparison
    const { data: currentProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'name', 'description', 'status', 'priority', 'type',
      'team_id', 'client_id', 'budget', 'currency',
      'start_date', 'due_date', 'progress', 'visibility',
      'settings', 'metadata', 'tags', 'cover_image'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Handle status change to completed
    if (updates.status === 'completed' && currentProject.status !== 'completed') {
      updateData.completed_at = new Date().toISOString()
      updateData.progress = 100
    }

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Project update error:', error)
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      )
    }

    // Log activity for significant changes
    const changes: string[] = []
    if (updates.status && updates.status !== currentProject.status) {
      changes.push(`status changed to ${updates.status}`)
    }
    if (updates.priority && updates.priority !== currentProject.priority) {
      changes.push(`priority changed to ${updates.priority}`)
    }
    if (updates.due_date && updates.due_date !== currentProject.due_date) {
      changes.push('due date updated')
    }

    if (changes.length > 0) {
      await logProjectActivity(supabase, id, userId, 'updated', {
        changes,
        project_name: project.name
      })
    }

    return NextResponse.json({
      success: true,
      project,
      message: 'Project updated successfully'
    })
  } catch (error) {
    console.error('Projects PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Project
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canDelete = await checkPermission(userId, 'projects', 'delete', projectId)
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const supabase = getSupabase()

    // Get project info for logging
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (permanent) {
      // Permanent delete - cascade will handle related records
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Project deletion error:', error)
        return NextResponse.json(
          { error: 'Failed to delete project' },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - archive the project
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) {
        console.error('Project archive error:', error)
        return NextResponse.json(
          { error: 'Failed to archive project' },
          { status: 500 }
        )
      }
    }

    // Log activity
    await logProjectActivity(supabase, projectId, userId, permanent ? 'deleted' : 'archived', {
      project_name: project?.name
    })

    return NextResponse.json({
      success: true,
      message: permanent ? 'Project deleted permanently' : 'Project archived successfully'
    })
  } catch (error) {
    console.error('Projects DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getProjectStats(supabase: ReturnType<typeof createClient>, projectId: string): Promise<ProjectStats> {
  try {
    // Get task counts
    const { count: totalTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    const { count: completedTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'completed')

    // Get file count
    const { count: totalFiles } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get comment count
    const { count: totalComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get team members count
    const { count: teamMembers } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get total hours from time entries
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('duration')
      .eq('project_id', projectId)

    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0

    return {
      total_tasks: totalTasks || 0,
      completed_tasks: completedTasks || 0,
      total_files: totalFiles || 0,
      total_comments: totalComments || 0,
      total_hours: Math.round(totalHours / 60), // Convert minutes to hours
      team_members: teamMembers || 0
    }
  } catch (error) {
    console.error('Error getting project stats:', error)
    return {
      total_tasks: 0,
      completed_tasks: 0,
      total_files: 0,
      total_comments: 0,
      total_hours: 0,
      team_members: 0
    }
  }
}

async function logProjectActivity(
  supabase: ReturnType<typeof createClient>,
  projectId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('activity_log').insert({
      entity_type: 'project',
      entity_id: projectId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error logging project activity:', error)
  }
}

function getDemoProjects(): Partial<Project>[] {
  return [
    {
      id: 'demo-1',
      name: 'Brand Identity Design',
      description: 'Complete brand identity package for tech startup',
      status: 'active',
      priority: 'high',
      type: 'branding',
      progress: 65,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['branding', 'design', 'startup'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      name: 'E-commerce Website',
      description: 'Full-stack e-commerce platform development',
      status: 'active',
      priority: 'urgent',
      type: 'web-development',
      progress: 40,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['web', 'ecommerce', 'react'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      name: 'Marketing Campaign',
      description: 'Q1 digital marketing campaign assets',
      status: 'planning',
      priority: 'medium',
      type: 'marketing',
      progress: 15,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['marketing', 'social-media', 'content'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-4',
      name: 'Mobile App UI/UX',
      description: 'Fitness app redesign project',
      status: 'completed',
      priority: 'medium',
      type: 'mobile',
      progress: 100,
      tags: ['mobile', 'ui-ux', 'fitness'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-5',
      name: 'Video Production',
      description: 'Corporate video series production',
      status: 'on_hold',
      priority: 'low',
      type: 'video',
      progress: 25,
      tags: ['video', 'corporate', 'production'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}
