/**
 * Client Zone Projects API Route
 * Full CRUD operations for client projects with deliverables and milestones
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('client-zone-projects-api')

// Demo mode check
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

// Project status types matching database schema
type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled'
type DeliverableStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'revision-requested'
type RevisionStatus = 'open' | 'in-progress' | 'completed' | 'rejected'

interface ClientProject {
  id: string
  user_id: string
  client_id: string
  name: string
  description: string | null
  status: ProjectStatus
  phase: string | null
  progress: number
  budget: number
  spent: number
  start_date: string
  due_date: string | null
  completed_date: string | null
  team_members: string[]
  tags: string[]
  last_update: string
  created_at: string
  updated_at: string
}

interface ProjectDeliverable {
  id: string
  project_id: string
  name: string
  description: string | null
  status: DeliverableStatus
  due_date: string | null
  completed_date: string | null
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  file_urls: string[]
  created_at: string
  updated_at: string
}

// Demo data
const demoProjects: ClientProject[] = [
  {
    id: 'proj-001',
    user_id: DEMO_USER_ID,
    client_id: 'client-001',
    name: 'Website Redesign',
    description: 'Complete overhaul of corporate website with modern design',
    status: 'in-progress',
    phase: 'Design',
    progress: 75,
    budget: 15000,
    spent: 11250,
    start_date: '2024-01-01T00:00:00Z',
    due_date: '2024-02-15T00:00:00Z',
    completed_date: null,
    team_members: [],
    tags: ['web', 'design', 'corporate'],
    last_update: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'proj-002',
    user_id: DEMO_USER_ID,
    client_id: 'client-002',
    name: 'Mobile App',
    description: 'iOS and Android app for customer engagement',
    status: 'pending',
    phase: 'Planning',
    progress: 30,
    budget: 45000,
    spent: 13500,
    start_date: '2024-01-10T00:00:00Z',
    due_date: '2024-03-01T00:00:00Z',
    completed_date: null,
    team_members: [],
    tags: ['mobile', 'ios', 'android'],
    last_update: '2024-01-14T14:00:00Z',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-14T14:00:00Z'
  },
  {
    id: 'proj-003',
    user_id: DEMO_USER_ID,
    client_id: 'client-003',
    name: 'Brand Identity',
    description: 'New brand identity including logo, colors, and guidelines',
    status: 'completed',
    phase: 'Completed',
    progress: 100,
    budget: 5000,
    spent: 5000,
    start_date: '2023-12-01T00:00:00Z',
    due_date: '2024-01-20T00:00:00Z',
    completed_date: '2024-01-18T00:00:00Z',
    team_members: [],
    tags: ['branding', 'logo', 'identity'],
    last_update: '2024-01-18T00:00:00Z',
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z'
  }
]

const demoDeliverables: ProjectDeliverable[] = [
  {
    id: 'del-001',
    project_id: 'proj-001',
    name: 'Wireframes',
    description: 'Low-fidelity wireframes for all pages',
    status: 'completed',
    due_date: '2024-01-15T00:00:00Z',
    completed_date: '2024-01-14T00:00:00Z',
    requires_approval: true,
    approved_by: 'client-001',
    approved_at: '2024-01-14T16:00:00Z',
    file_urls: ['/files/wireframes-v1.fig'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-14T16:00:00Z'
  },
  {
    id: 'del-002',
    project_id: 'proj-001',
    name: 'High-Fidelity Mockups',
    description: 'Final design mockups with client feedback incorporated',
    status: 'review',
    due_date: '2024-01-25T00:00:00Z',
    completed_date: null,
    requires_approval: true,
    approved_by: null,
    approved_at: null,
    file_urls: ['/files/mockups-v2.fig'],
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  },
  {
    id: 'del-003',
    project_id: 'proj-001',
    name: 'Development',
    description: 'Frontend and backend development',
    status: 'in-progress',
    due_date: '2024-02-10T00:00:00Z',
    completed_date: null,
    requires_approval: true,
    approved_by: null,
    approved_at: null,
    file_urls: [],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
]

/**
 * GET /api/client-zone/projects
 * Retrieves projects for the current user (as freelancer or client)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const status = searchParams.get('status') as ProjectStatus | null
    const clientId = searchParams.get('client_id')
    const includeDeliverables = searchParams.get('include_deliverables') === 'true'
    const includeStats = searchParams.get('include_stats') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Fetching client zone projects', { userId, projectId, status })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Single project fetch with full details
      if (projectId) {
        const { data: project, error } = await supabase
          .from('client_projects')
          .select(`
            *,
            client:client_id(id, email, full_name, avatar_url),
            freelancer:user_id(id, email, full_name, avatar_url)
          `)
          .eq('id', projectId)
          .or(`user_id.eq.${userId},client_id.eq.${userId}`)
          .single()

        if (error) throw error

        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }

        // Fetch deliverables
        let deliverables = []
        if (includeDeliverables) {
          const { data: delData } = await supabase
            .from('project_deliverables')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })

          deliverables = delData || []
        }

        // Fetch revision requests
        const { data: revisions } = await supabase
          .from('revision_requests')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })

        // Fetch milestone payments
        const { data: milestones } = await supabase
          .from('milestone_payments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        // Fetch recent messages count
        const { count: messageCount } = await supabase
          .from('client_messages')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)

        // Fetch files count
        const { count: fileCount } = await supabase
          .from('client_files')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)

        return NextResponse.json({
          success: true,
          data: {
            ...project,
            deliverables,
            revisions: revisions || [],
            milestones: milestones || [],
            stats: {
              messageCount: messageCount || 0,
              fileCount: fileCount || 0,
              deliverableCount: deliverables.length,
              completedDeliverables: deliverables.filter((d: ProjectDeliverable) => d.status === 'completed').length
            }
          }
        })
      }

      // Build query for project list
      let query = supabase
        .from('client_projects')
        .select(`
          *,
          client:client_id(id, email, full_name, avatar_url),
          freelancer:user_id(id, email, full_name, avatar_url)
        `, { count: 'exact' })
        .or(`user_id.eq.${userId},client_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data: projects, error, count } = await query

      if (error) throw error

      // Get stats for each project if requested
      let projectsWithStats = projects || []
      if (includeStats && projects) {
        projectsWithStats = await Promise.all(
          projects.map(async (project) => {
            const { count: deliverableCount } = await supabase
              .from('project_deliverables')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)

            const { count: messageCount } = await supabase
              .from('client_messages')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)

            return {
              ...project,
              stats: {
                deliverableCount: deliverableCount || 0,
                messageCount: messageCount || 0
              }
            }
          })
        )
      }

      // Get overall stats
      const { count: activeCount } = await supabase
        .from('client_projects')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},client_id.eq.${userId}`)
        .in('status', ['in-progress', 'review'])

      const { count: completedCount } = await supabase
        .from('client_projects')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},client_id.eq.${userId}`)
        .eq('status', 'completed')

      return NextResponse.json({
        success: true,
        data: projectsWithStats,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        summary: {
          total: count || 0,
          active: activeCount || 0,
          completed: completedCount || 0
        }
      })
    } catch (dbError) {
      logger.warn('Database error, using demo data', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      if (projectId) {
        const project = demoProjects.find(p => p.id === projectId)
        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }

        const deliverables = includeDeliverables
          ? demoDeliverables.filter(d => d.project_id === projectId)
          : []

        return NextResponse.json({
          success: true,
          data: {
            ...project,
            deliverables,
            revisions: [],
            milestones: [],
            stats: {
              messageCount: 5,
              fileCount: 3,
              deliverableCount: deliverables.length,
              completedDeliverables: deliverables.filter(d => d.status === 'completed').length
            }
          }
        })
      }

      let filteredProjects = [...demoProjects]

      if (status) {
        filteredProjects = filteredProjects.filter(p => p.status === status)
      }

      if (clientId) {
        filteredProjects = filteredProjects.filter(p => p.client_id === clientId)
      }

      const paginatedProjects = filteredProjects.slice(offset, offset + limit)

      return NextResponse.json({
        success: true,
        data: paginatedProjects,
        pagination: {
          total: filteredProjects.length,
          limit,
          offset,
          hasMore: filteredProjects.length > offset + limit
        },
        summary: {
          total: demoProjects.length,
          active: demoProjects.filter(p => ['in-progress', 'review'].includes(p.status)).length,
          completed: demoProjects.filter(p => p.status === 'completed').length
        }
      })
    }
  } catch (error) {
    logger.error('Error fetching projects', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client-zone/projects
 * Create a new project or perform project actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'create', ...data } = body

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Client zone projects action', { action, userId })

    switch (action) {
      case 'create':
        return handleCreateProject(userId, data)
      case 'add-deliverable':
        return handleAddDeliverable(userId, data)
      case 'update-deliverable':
        return handleUpdateDeliverable(userId, data)
      case 'complete-deliverable':
        return handleCompleteDeliverable(userId, data)
      case 'approve-deliverable':
        return handleApproveDeliverable(userId, data)
      case 'request-revision':
        return handleRequestRevision(userId, data)
      case 'resolve-revision':
        return handleResolveRevision(userId, data)
      case 'update-progress':
        return handleUpdateProgress(userId, data)
      case 'change-status':
        return handleChangeStatus(userId, data)
      case 'add-milestone':
        return handleAddMilestone(userId, data)
      case 'approve-milestone':
        return handleApproveMilestone(userId, data)
      case 'release-milestone':
        return handleReleaseMilestone(userId, data)
      case 'add-team-member':
        return handleAddTeamMember(userId, data)
      case 'remove-team-member':
        return handleRemoveTeamMember(userId, data)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Error in projects action', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process project action' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/client-zone/projects
 * Update a project
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Updating project', { projectId: id, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership
      const { data: project, error: fetchError } = await supabase
        .from('client_projects')
        .select('user_id, client_id')
        .eq('id', id)
        .single()

      if (fetchError || !project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      // Only freelancer can fully update, client can update limited fields
      const isFreelancer = project.user_id === userId
      const isClient = project.client_id === userId

      if (!isFreelancer && !isClient) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to update this project' },
          { status: 403 }
        )
      }

      // Filter allowed fields based on role
      const allowedFields = isFreelancer
        ? ['name', 'description', 'status', 'phase', 'progress', 'budget', 'spent', 'due_date', 'tags', 'team_members']
        : ['tags'] // Clients can only update tags

      const filteredData: Record<string, unknown> = {}
      for (const key of Object.keys(updateData)) {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key]
        }
      }

      filteredData.updated_at = new Date().toISOString()
      filteredData.last_update = new Date().toISOString()

      const { data: updatedProject, error } = await supabase
        .from('client_projects')
        .update(filteredData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const projectIndex = demoProjects.findIndex(p => p.id === id)
      if (projectIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      const updatedProject = {
        ...demoProjects[projectIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: updatedProject,
        message: 'Project updated successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error updating project', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/client-zone/projects
 * Delete a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Deleting project', { projectId, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership (only freelancer can delete)
      const { data: project, error: fetchError } = await supabase
        .from('client_projects')
        .select('user_id, status')
        .eq('id', projectId)
        .single()

      if (fetchError || !project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      if (project.user_id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Only the project owner can delete' },
          { status: 403 }
        )
      }

      // Prevent deletion of active projects
      if (['in-progress', 'review'].includes(project.status)) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete an active project. Change status to cancelled first.' },
          { status: 400 }
        )
      }

      // Delete project (cascades to deliverables, messages, files, etc.)
      const { error } = await supabase
        .from('client_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error deleting project', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateProject(userId: string, data: Record<string, unknown>) {
  const {
    client_id,
    name,
    description,
    budget = 0,
    due_date,
    tags = [],
    phase = 'Planning'
  } = data as {
    client_id: string
    name: string
    description?: string
    budget?: number
    due_date?: string
    tags?: string[]
    phase?: string
  }

  if (!client_id || !name) {
    return NextResponse.json(
      { success: false, error: 'Client ID and name are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    const newProject = {
      user_id: userId,
      client_id,
      name,
      description: description || null,
      status: 'pending' as ProjectStatus,
      phase,
      progress: 0,
      budget,
      spent: 0,
      start_date: new Date().toISOString(),
      due_date: due_date || null,
      tags,
      team_members: [],
      last_update: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdProject, error } = await supabase
      .from('client_projects')
      .insert(newProject)
      .select(`
        *,
        client:client_id(id, email, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Notify client
    await supabase
      .from('client_notifications')
      .insert({
        user_id: client_id,
        notification_type: 'new_project',
        title: 'New Project Created',
        message: `A new project "${name}" has been created for you`,
        project_id: createdProject.id,
        action_url: `/client-zone/projects/${createdProject.id}`
      })

    return NextResponse.json({
      success: true,
      data: createdProject,
      message: 'Project created successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    const newProject: ClientProject = {
      id: `proj-${Date.now()}`,
      user_id: userId,
      client_id: client_id as string,
      name: name as string,
      description: (description as string) || null,
      status: 'pending',
      phase: (phase as string) || 'Planning',
      progress: 0,
      budget: (budget as number) || 0,
      spent: 0,
      start_date: new Date().toISOString(),
      due_date: (due_date as string) || null,
      completed_date: null,
      tags: (tags as string[]) || [],
      team_members: [],
      last_update: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newProject,
      message: 'Project created successfully (demo)'
    })
  }
}

async function handleAddDeliverable(userId: string, data: Record<string, unknown>) {
  const {
    project_id,
    name,
    description,
    due_date,
    requires_approval = true
  } = data as {
    project_id: string
    name: string
    description?: string
    due_date?: string
    requires_approval?: boolean
  }

  if (!project_id || !name) {
    return NextResponse.json(
      { success: false, error: 'Project ID and name are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .select('user_id')
      .eq('id', project_id)
      .single()

    if (projectError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const newDeliverable = {
      project_id,
      name,
      description: description || null,
      status: 'pending' as DeliverableStatus,
      due_date: due_date || null,
      requires_approval,
      file_urls: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdDeliverable, error } = await supabase
      .from('project_deliverables')
      .insert(newDeliverable)
      .select()
      .single()

    if (error) throw error

    // Update project's last_update
    await supabase
      .from('client_projects')
      .update({ last_update: new Date().toISOString() })
      .eq('id', project_id)

    return NextResponse.json({
      success: true,
      data: createdDeliverable,
      message: 'Deliverable added successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    const newDeliverable: ProjectDeliverable = {
      id: `del-${Date.now()}`,
      project_id: project_id as string,
      name: name as string,
      description: (description as string) || null,
      status: 'pending',
      due_date: (due_date as string) || null,
      completed_date: null,
      requires_approval: requires_approval !== false,
      approved_by: null,
      approved_at: null,
      file_urls: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newDeliverable,
      message: 'Deliverable added successfully (demo)'
    })
  }
}

async function handleUpdateDeliverable(userId: string, data: Record<string, unknown>) {
  const { deliverable_id, ...updateData } = data as {
    deliverable_id: string
    [key: string]: unknown
  }

  if (!deliverable_id) {
    return NextResponse.json(
      { success: false, error: 'Deliverable ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify deliverable exists and user owns the project
    const { data: deliverable, error: fetchError } = await supabase
      .from('project_deliverables')
      .select('project_id, project:project_id(user_id)')
      .eq('id', deliverable_id)
      .single()

    if (fetchError || !deliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    const project = deliverable.project as { user_id: string }
    if (project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this deliverable' },
        { status: 403 }
      )
    }

    const allowedFields = ['name', 'description', 'status', 'due_date', 'file_urls']
    const filteredData: Record<string, unknown> = {}
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key]
      }
    }
    filteredData.updated_at = new Date().toISOString()

    const { data: updatedDeliverable, error } = await supabase
      .from('project_deliverables')
      .update(filteredData)
      .eq('id', deliverable_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedDeliverable,
      message: 'Deliverable updated successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: deliverable_id, ...updateData },
      message: 'Deliverable updated successfully (demo)'
    })
  }
}

async function handleCompleteDeliverable(userId: string, data: Record<string, unknown>) {
  const { deliverable_id, file_urls = [] } = data as {
    deliverable_id: string
    file_urls?: string[]
  }

  if (!deliverable_id) {
    return NextResponse.json(
      { success: false, error: 'Deliverable ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: deliverable, error: fetchError } = await supabase
      .from('project_deliverables')
      .select('*, project:project_id(user_id, client_id, name)')
      .eq('id', deliverable_id)
      .single()

    if (fetchError || !deliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    const project = deliverable.project as { user_id: string; client_id: string; name: string }
    if (project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const newStatus = deliverable.requires_approval ? 'review' : 'completed'

    const { data: updatedDeliverable, error } = await supabase
      .from('project_deliverables')
      .update({
        status: newStatus,
        file_urls: file_urls.length > 0 ? file_urls : deliverable.file_urls,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliverable_id)
      .select()
      .single()

    if (error) throw error

    // Notify client if requires approval
    if (deliverable.requires_approval) {
      await supabase
        .from('client_notifications')
        .insert({
          user_id: project.client_id,
          notification_type: 'deliverable_review',
          title: 'Deliverable Ready for Review',
          message: `The deliverable "${deliverable.name}" is ready for your review`,
          project_id: deliverable.project_id,
          related_entity_type: 'deliverable',
          related_entity_id: deliverable_id,
          action_url: `/client-zone/projects/${deliverable.project_id}`
        })
    }

    return NextResponse.json({
      success: true,
      data: updatedDeliverable,
      message: deliverable.requires_approval
        ? 'Deliverable submitted for review'
        : 'Deliverable marked as completed'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: deliverable_id, status: 'review' },
      message: 'Deliverable submitted for review (demo)'
    })
  }
}

async function handleApproveDeliverable(userId: string, data: Record<string, unknown>) {
  const { deliverable_id } = data as { deliverable_id: string }

  if (!deliverable_id) {
    return NextResponse.json(
      { success: false, error: 'Deliverable ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify client is approving
    const { data: deliverable, error: fetchError } = await supabase
      .from('project_deliverables')
      .select('*, project:project_id(user_id, client_id, name)')
      .eq('id', deliverable_id)
      .single()

    if (fetchError || !deliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    const project = deliverable.project as { user_id: string; client_id: string; name: string }
    if (project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the client can approve deliverables' },
        { status: 403 }
      )
    }

    if (deliverable.status !== 'review') {
      return NextResponse.json(
        { success: false, error: 'Deliverable is not in review status' },
        { status: 400 }
      )
    }

    const { data: updatedDeliverable, error } = await supabase
      .from('project_deliverables')
      .update({
        status: 'completed',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        completed_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', deliverable_id)
      .select()
      .single()

    if (error) throw error

    // Notify freelancer
    await supabase
      .from('client_notifications')
      .insert({
        user_id: project.user_id,
        notification_type: 'deliverable_approved',
        title: 'Deliverable Approved',
        message: `Your deliverable "${deliverable.name}" has been approved`,
        project_id: deliverable.project_id,
        action_url: `/client-zone/projects/${deliverable.project_id}`
      })

    // Update project progress
    const { data: allDeliverables } = await supabase
      .from('project_deliverables')
      .select('status')
      .eq('project_id', deliverable.project_id)

    if (allDeliverables) {
      const completedCount = allDeliverables.filter(d => d.status === 'completed').length
      const progress = Math.round((completedCount / allDeliverables.length) * 100)

      await supabase
        .from('client_projects')
        .update({
          progress,
          last_update: new Date().toISOString()
        })
        .eq('id', deliverable.project_id)
    }

    return NextResponse.json({
      success: true,
      data: updatedDeliverable,
      message: 'Deliverable approved successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: deliverable_id, status: 'completed', approved_by: userId },
      message: 'Deliverable approved successfully (demo)'
    })
  }
}

async function handleRequestRevision(userId: string, data: Record<string, unknown>) {
  const { deliverable_id, project_id, notes } = data as {
    deliverable_id: string
    project_id: string
    notes: string
  }

  if (!deliverable_id || !notes) {
    return NextResponse.json(
      { success: false, error: 'Deliverable ID and notes are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify client is requesting
    const { data: deliverable, error: fetchError } = await supabase
      .from('project_deliverables')
      .select('*, project:project_id(user_id, client_id)')
      .eq('id', deliverable_id)
      .single()

    if (fetchError || !deliverable) {
      return NextResponse.json(
        { success: false, error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    const project = deliverable.project as { user_id: string; client_id: string }
    if (project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the client can request revisions' },
        { status: 403 }
      )
    }

    // Create revision request
    const { data: revision, error: revisionError } = await supabase
      .from('revision_requests')
      .insert({
        deliverable_id,
        project_id: deliverable.project_id,
        requested_by: userId,
        notes,
        status: 'open' as RevisionStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (revisionError) throw revisionError

    // Update deliverable status
    await supabase
      .from('project_deliverables')
      .update({
        status: 'revision-requested',
        updated_at: new Date().toISOString()
      })
      .eq('id', deliverable_id)

    // Notify freelancer
    await supabase
      .from('client_notifications')
      .insert({
        user_id: project.user_id,
        notification_type: 'revision_requested',
        title: 'Revision Requested',
        message: `A revision has been requested for "${deliverable.name}"`,
        project_id: deliverable.project_id,
        action_url: `/client-zone/projects/${deliverable.project_id}`
      })

    return NextResponse.json({
      success: true,
      data: revision,
      message: 'Revision requested successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `rev-${Date.now()}`,
        deliverable_id,
        project_id,
        requested_by: userId,
        notes,
        status: 'open'
      },
      message: 'Revision requested successfully (demo)'
    })
  }
}

async function handleResolveRevision(userId: string, data: Record<string, unknown>) {
  const { revision_id, resolution_notes } = data as {
    revision_id: string
    resolution_notes?: string
  }

  if (!revision_id) {
    return NextResponse.json(
      { success: false, error: 'Revision ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify freelancer is resolving
    const { data: revision, error: fetchError } = await supabase
      .from('revision_requests')
      .select('*, project:project_id(user_id, client_id), deliverable:deliverable_id(name)')
      .eq('id', revision_id)
      .single()

    if (fetchError || !revision) {
      return NextResponse.json(
        { success: false, error: 'Revision not found' },
        { status: 404 }
      )
    }

    const project = revision.project as { user_id: string; client_id: string }
    if (project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the freelancer can resolve revisions' },
        { status: 403 }
      )
    }

    const { data: updatedRevision, error } = await supabase
      .from('revision_requests')
      .update({
        status: 'completed',
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', revision_id)
      .select()
      .single()

    if (error) throw error

    // Update deliverable back to review
    await supabase
      .from('project_deliverables')
      .update({
        status: 'review',
        updated_at: new Date().toISOString()
      })
      .eq('id', revision.deliverable_id)

    // Notify client
    await supabase
      .from('client_notifications')
      .insert({
        user_id: project.client_id,
        notification_type: 'revision_completed',
        title: 'Revision Completed',
        message: `The revision for "${(revision.deliverable as { name: string }).name}" has been completed`,
        project_id: revision.project_id,
        action_url: `/client-zone/projects/${revision.project_id}`
      })

    return NextResponse.json({
      success: true,
      data: updatedRevision,
      message: 'Revision resolved successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: revision_id, status: 'completed' },
      message: 'Revision resolved successfully (demo)'
    })
  }
}

async function handleUpdateProgress(userId: string, data: Record<string, unknown>) {
  const { project_id, progress, phase } = data as {
    project_id: string
    progress: number
    phase?: string
  }

  if (!project_id || progress === undefined) {
    return NextResponse.json(
      { success: false, error: 'Project ID and progress are required' },
      { status: 400 }
    )
  }

  if (progress < 0 || progress > 100) {
    return NextResponse.json(
      { success: false, error: 'Progress must be between 0 and 100' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('client_projects')
      .select('user_id')
      .eq('id', project_id)
      .single()

    if (fetchError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {
      progress,
      last_update: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (phase) {
      updateData.phase = phase
    }

    // Auto-complete if 100%
    if (progress === 100) {
      updateData.status = 'completed'
      updateData.completed_date = new Date().toISOString()
    }

    const { data: updatedProject, error } = await supabase
      .from('client_projects')
      .update(updateData)
      .eq('id', project_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Progress updated successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: project_id, progress, phase },
      message: 'Progress updated successfully (demo)'
    })
  }
}

async function handleChangeStatus(userId: string, data: Record<string, unknown>) {
  const { project_id, status } = data as {
    project_id: string
    status: ProjectStatus
  }

  if (!project_id || !status) {
    return NextResponse.json(
      { success: false, error: 'Project ID and status are required' },
      { status: 400 }
    )
  }

  const validStatuses: ProjectStatus[] = ['pending', 'in-progress', 'review', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { success: false, error: 'Invalid status' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('client_projects')
      .select('user_id, client_id, name')
      .eq('id', project_id)
      .single()

    if (fetchError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {
      status,
      last_update: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString()
      updateData.progress = 100
    }

    const { data: updatedProject, error } = await supabase
      .from('client_projects')
      .update(updateData)
      .eq('id', project_id)
      .select()
      .single()

    if (error) throw error

    // Notify client of status change
    await supabase
      .from('client_notifications')
      .insert({
        user_id: project.client_id,
        notification_type: 'status_change',
        title: 'Project Status Updated',
        message: `Project "${project.name}" status changed to ${status}`,
        project_id,
        action_url: `/client-zone/projects/${project_id}`
      })

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Status updated successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: project_id, status },
      message: 'Status updated successfully (demo)'
    })
  }
}

async function handleAddMilestone(userId: string, data: Record<string, unknown>) {
  const { project_id, name, description, amount, due_date, in_escrow = false } = data as {
    project_id: string
    name: string
    description?: string
    amount: number
    due_date?: string
    in_escrow?: boolean
  }

  if (!project_id || !name || !amount) {
    return NextResponse.json(
      { success: false, error: 'Project ID, name, and amount are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('client_projects')
      .select('user_id')
      .eq('id', project_id)
      .single()

    if (fetchError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const { data: milestone, error } = await supabase
      .from('milestone_payments')
      .insert({
        project_id,
        name,
        description: description || null,
        amount,
        status: 'pending',
        in_escrow,
        due_date: due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: milestone,
      message: 'Milestone added successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `mile-${Date.now()}`,
        project_id,
        name,
        description,
        amount,
        status: 'pending',
        in_escrow
      },
      message: 'Milestone added successfully (demo)'
    })
  }
}

async function handleApproveMilestone(userId: string, data: Record<string, unknown>) {
  const { milestone_id } = data as { milestone_id: string }

  if (!milestone_id) {
    return NextResponse.json(
      { success: false, error: 'Milestone ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify client is approving
    const { data: milestone, error: fetchError } = await supabase
      .from('milestone_payments')
      .select('*, project:project_id(user_id, client_id)')
      .eq('id', milestone_id)
      .single()

    if (fetchError || !milestone) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const project = milestone.project as { user_id: string; client_id: string }
    if (project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the client can approve milestones' },
        { status: 403 }
      )
    }

    const { data: updatedMilestone, error } = await supabase
      .from('milestone_payments')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: 'Milestone approved successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: milestone_id, status: 'approved' },
      message: 'Milestone approved successfully (demo)'
    })
  }
}

async function handleReleaseMilestone(userId: string, data: Record<string, unknown>) {
  const { milestone_id } = data as { milestone_id: string }

  if (!milestone_id) {
    return NextResponse.json(
      { success: false, error: 'Milestone ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify client is releasing
    const { data: milestone, error: fetchError } = await supabase
      .from('milestone_payments')
      .select('*, project:project_id(user_id, client_id, name)')
      .eq('id', milestone_id)
      .single()

    if (fetchError || !milestone) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const project = milestone.project as { user_id: string; client_id: string; name: string }
    if (project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the client can release milestone payments' },
        { status: 403 }
      )
    }

    if (milestone.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Milestone must be approved before release' },
        { status: 400 }
      )
    }

    const { data: updatedMilestone, error } = await supabase
      .from('milestone_payments')
      .update({
        status: 'released',
        paid_date: new Date().toISOString(),
        escrow_released_at: milestone.in_escrow ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone_id)
      .select()
      .single()

    if (error) throw error

    // Update project spent amount
    await supabase
      .from('client_projects')
      .update({
        spent: milestone.amount,
        last_update: new Date().toISOString()
      })
      .eq('id', milestone.project_id)

    // Notify freelancer
    await supabase
      .from('client_notifications')
      .insert({
        user_id: project.user_id,
        notification_type: 'payment_released',
        title: 'Payment Released',
        message: `Payment of $${milestone.amount} has been released for "${milestone.name}"`,
        project_id: milestone.project_id,
        action_url: `/client-zone/projects/${milestone.project_id}`
      })

    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: 'Payment released successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: milestone_id, status: 'released' },
      message: 'Payment released successfully (demo)'
    })
  }
}

async function handleAddTeamMember(userId: string, data: Record<string, unknown>) {
  const { project_id, member_id } = data as { project_id: string; member_id: string }

  if (!project_id || !member_id) {
    return NextResponse.json(
      { success: false, error: 'Project ID and member ID are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('client_projects')
      .select('user_id, team_members')
      .eq('id', project_id)
      .single()

    if (fetchError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const teamMembers = project.team_members || []
    if (teamMembers.includes(member_id)) {
      return NextResponse.json(
        { success: false, error: 'Member already in team' },
        { status: 400 }
      )
    }

    const { data: updatedProject, error } = await supabase
      .from('client_projects')
      .update({
        team_members: [...teamMembers, member_id],
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Team member added successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Team member added successfully (demo)'
    })
  }
}

async function handleRemoveTeamMember(userId: string, data: Record<string, unknown>) {
  const { project_id, member_id } = data as { project_id: string; member_id: string }

  if (!project_id || !member_id) {
    return NextResponse.json(
      { success: false, error: 'Project ID and member ID are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('client_projects')
      .select('user_id, team_members')
      .eq('id', project_id)
      .single()

    if (fetchError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Project not found or not authorized' },
        { status: 403 }
      )
    }

    const teamMembers = (project.team_members || []).filter((id: string) => id !== member_id)

    const { data: updatedProject, error } = await supabase
      .from('client_projects')
      .update({
        team_members: teamMembers,
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Team member removed successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully (demo)'
    })
  }
}
