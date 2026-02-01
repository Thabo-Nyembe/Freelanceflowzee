import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Project Management API
// Supports: CRUD projects, update status, assign team, track progress

export const runtime = 'nodejs'

async function getSupabase() {
  const supabase = await createClient()
  return supabase
}

// Create new project
async function handleCreateProject(data: any): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const projectData = {
      title: data.title || 'Untitled Project',
      description: data.description || '',
      status: 'draft',
      progress: 0,
      client_id: data.client_id, // Ensure client_id is passed
      budget: data.budget || 0,
      spent: 0,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date,
      priority: data.priority || 'medium',
      user_id: user.id
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'create',
      project,
      message: `Project "${project.title}" created successfully!`,
      projectId: project.id
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create project'
    }, { status: 500 })
  }
}

// List projects with filters
async function handleListProjects(filters?: any): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('projects')
      .select('*, client:clients(name)')
      .eq('user_id', user.id)

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.client) {
      // Filter by client name logic would be complex with join, simplified to client_id if possible or post-filter
      // For now assuming filters.client is an ID if passed, or we skip
    }

    // Sort
    query = query.order('created_at', { ascending: false })

    const { data: projects, error } = await query

    if (error) throw error

    // Transform for UI if needed (client_name from joined client)
    const formattedProjects = projects.map((p: any) => ({
      ...p,
      client_name: p.client?.name || 'Unknown Client',
      // Attachments/Team members would need separate tables/queries in full impl
      team_members: [], // Placeholder
      attachments: [], // Placeholder
      comments_count: 0 // Placeholder
    }))

    if (filters?.search) {
      // Post-fetch search for title/desc
      const searchLower = filters.search.toLowerCase()
      return NextResponse.json({
        success: true,
        action: 'list',
        projects: formattedProjects.filter((p: { title: string; description?: string }) =>
          p.title.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
        ),
        message: 'Projects fetched'
      })
    }

    const stats = {
      total: formattedProjects.length,
      active: formattedProjects.filter((p: { status: string }) => p.status === 'active').length,
      completed: formattedProjects.filter((p: { status: string }) => p.status === 'completed').length,
      totalBudget: formattedProjects.reduce((sum: number, p: { budget?: number }) => sum + (p.budget || 0), 0),
      totalSpent: formattedProjects.reduce((sum: number, p: { spent?: number }) => sum + (p.spent || 0), 0),
      avgProgress: formattedProjects.length > 0 ? Math.round(formattedProjects.reduce((sum: number, p: { progress?: number }) => sum + (p.progress || 0), 0) / formattedProjects.length) : 0
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      projects: formattedProjects,
      stats,
      message: `Found ${formattedProjects.length} projects`
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list projects'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

// Update project status
async function handleUpdateStatus(projectId: string, newStatus: string): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()

    const updates: { status: string; updated_at: string; progress?: number } = { status: newStatus, updated_at: new Date().toISOString() }
    if (newStatus === 'completed') updates.progress = 100

    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'update-status',
      project,
      message: `Project status updated to ${newStatus}`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update status'
    }, { status: 500 })
  }
}

// Update project progress
async function handleUpdateProgress(projectId: string, progress: number): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()

    const safeProgress = Math.min(Math.max(progress, 0), 100)
    const updates: any = { progress: safeProgress, updated_at: new Date().toISOString() }
    if (safeProgress === 100) updates.status = 'completed'

    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'update-progress',
      project,
      message: `Project progress updated to ${project.progress}%`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update progress'
    }, { status: 500 })
  }
}

// Update project
async function handleUpdateProject(projectId: string, updates: any): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()

    const { data: project, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'update',
      project,
      message: 'Project updated successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update project'
    }, { status: 500 })
  }
}

// Delete project
async function handleDeleteProject(projectId: string): Promise<NextResponse> {
  try {
    const supabase = await getSupabase()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'delete',
      projectId,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete project'
    }, { status: 500 })
  }
}

// Add team member to project (Mock for now as we don't have team_members table)
async function handleAddMember(projectId: string, member: any): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    action: 'add-member',
    result: { projectId, member, added: true },
    message: 'Team members not yet supported in DB'
  })
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    switch (body.action) {
      case 'create':
        return handleCreateProject(body.data)

      case 'list':
        return handleListProjects(body.filters)

      case 'update-status':
        return handleUpdateStatus(body.projectId, body.data.status)

      case 'update-progress':
        return handleUpdateProgress(body.projectId, body.data.progress)

      case 'update':
        return handleUpdateProject(body.projectId, body.data)

      case 'delete':
        return handleDeleteProject(body.projectId)

      case 'add-member':
        return handleAddMember(body.projectId, body.data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    return handleListProjects({ status, priority, search })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    }, { status: 500 })
  }
}
