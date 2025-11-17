import { NextRequest, NextResponse } from 'next/server'

// Project Management API
// Supports: CRUD projects, update status, assign team, track progress

interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft'
  progress: number
  client_name: string
  budget: number
  spent: number
  start_date: string
  end_date: string
  team_members: { id: string; name: string; avatar: string }[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments_count: number
  attachments: string[]
  category: string
  tags: string[]
  created_at?: string
  updated_at?: string
}

interface ProjectRequest {
  action: 'create' | 'list' | 'update' | 'delete' | 'update-status' | 'add-member' | 'update-progress'
  projectId?: string
  data?: Partial<Project>
  filters?: {
    status?: string
    priority?: string
    client?: string
    category?: string
    search?: string
  }
}

// Generate unique project ID
function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create new project
async function handleCreateProject(data: Partial<Project>): Promise<NextResponse> {
  try {
    const project: Project = {
      id: generateProjectId(),
      title: data.title || 'Untitled Project',
      description: data.description || '',
      status: 'draft',
      progress: 0,
      client_name: data.client_name || '',
      budget: data.budget || 0,
      spent: 0,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      team_members: data.team_members || [],
      priority: data.priority || 'medium',
      comments_count: 0,
      attachments: [],
      category: data.category || 'General',
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // In production: Save to database
    // await db.projects.create(project)

    return NextResponse.json({
      success: true,
      action: 'create',
      project,
      message: `Project "${project.title}" created successfully!`,
      projectId: project.id
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create project'
    }, { status: 500 })
  }
}

// List projects with filters
async function handleListProjects(filters?: any): Promise<NextResponse> {
  try {
    // Mock project data
    const mockProjects: Project[] = [
      {
        id: 'proj_1',
        title: 'E-commerce Website Redesign',
        description: 'Complete redesign of online store with modern UI/UX',
        status: 'active',
        progress: 75,
        client_name: 'TechCorp Inc.',
        budget: 12000,
        spent: 9000,
        start_date: '2024-01-15T00:00:00.000Z',
        end_date: '2024-02-28T00:00:00.000Z',
        team_members: [
          { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
          { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
        ],
        priority: 'high',
        comments_count: 12,
        attachments: ['wireframes.pdf', 'brand-guidelines.pdf'],
        category: 'Web Development',
        tags: ['React', 'E-commerce', 'UI/UX']
      },
      {
        id: 'proj_2',
        title: 'Mobile App Development',
        description: 'iOS and Android app for fitness tracking',
        status: 'active',
        progress: 45,
        client_name: 'FitLife Solutions',
        budget: 25000,
        spent: 11250,
        start_date: '2024-01-20T00:00:00.000Z',
        end_date: '2024-04-15T00:00:00.000Z',
        team_members: [
          { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' }
        ],
        priority: 'urgent',
        comments_count: 24,
        attachments: ['wireframes.sketch', 'api-docs.pdf'],
        category: 'Mobile Development',
        tags: ['React Native', 'iOS', 'Android']
      }
    ]

    let filteredProjects = mockProjects

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === filters.status)
    }
    if (filters?.priority && filters.priority !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.priority === filters.priority)
    }
    if (filters?.client) {
      filteredProjects = filteredProjects.filter(p =>
        p.client_name.toLowerCase().includes(filters.client.toLowerCase())
      )
    }
    if (filters?.search) {
      filteredProjects = filteredProjects.filter(p =>
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.client_name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    const stats = {
      total: filteredProjects.length,
      active: filteredProjects.filter(p => p.status === 'active').length,
      completed: filteredProjects.filter(p => p.status === 'completed').length,
      totalBudget: filteredProjects.reduce((sum, p) => sum + p.budget, 0),
      totalSpent: filteredProjects.reduce((sum, p) => sum + p.spent, 0),
      avgProgress: filteredProjects.length > 0
        ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      projects: filteredProjects,
      stats,
      message: `Found ${filteredProjects.length} projects`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list projects'
    }, { status: 500 })
  }
}

// Update project status
async function handleUpdateStatus(projectId: string, newStatus: string): Promise<NextResponse> {
  try {
    const project = {
      id: projectId,
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    // If marked as completed, set progress to 100
    if (newStatus === 'completed') {
      project['progress'] = 100
    }

    // In production: Update in database
    // await db.projects.update(projectId, project)

    return NextResponse.json({
      success: true,
      action: 'update-status',
      project,
      message: `Project status updated to ${newStatus}`,
      celebration: newStatus === 'completed' ? {
        message: '🎉 Congratulations! Project completed!',
        achievement: 'Project Master',
        points: 50
      } : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update status'
    }, { status: 500 })
  }
}

// Update project progress
async function handleUpdateProgress(projectId: string, progress: number): Promise<NextResponse> {
  try {
    const project = {
      id: projectId,
      progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
      updated_at: new Date().toISOString()
    }

    // Auto-complete if progress reaches 100
    if (project.progress === 100) {
      project['status'] = 'completed'
    }

    return NextResponse.json({
      success: true,
      action: 'update-progress',
      project,
      message: `Project progress updated to ${project.progress}%`,
      milestone: project.progress >= 50 && project.progress < 55 ? {
        message: '🎯 Halfway there! Keep going!',
        type: 'halfway'
      } : project.progress >= 75 && project.progress < 80 ? {
        message: '🚀 Almost done! Final sprint!',
        type: 'nearcompletion'
      } : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update progress'
    }, { status: 500 })
  }
}

// Update project
async function handleUpdateProject(projectId: string, updates: Partial<Project>): Promise<NextResponse> {
  try {
    const project = {
      id: projectId,
      ...updates,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      action: 'update',
      project,
      message: 'Project updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update project'
    }, { status: 500 })
  }
}

// Delete project
async function handleDeleteProject(projectId: string): Promise<NextResponse> {
  try {
    // In production: Soft delete or archive
    // await db.projects.delete(projectId)

    return NextResponse.json({
      success: true,
      action: 'delete',
      projectId,
      message: 'Project deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete project'
    }, { status: 500 })
  }
}

// Add team member to project
async function handleAddMember(projectId: string, member: any): Promise<NextResponse> {
  try {
    const result = {
      projectId,
      member,
      added: true
    }

    return NextResponse.json({
      success: true,
      action: 'add-member',
      result,
      message: `${member.name} added to project`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to add member'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ProjectRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Project data required'
          }, { status: 400 })
        }
        return handleCreateProject(body.data)

      case 'list':
        return handleListProjects(body.filters)

      case 'update-status':
        if (!body.projectId || !body.data?.status) {
          return NextResponse.json({
            success: false,
            error: 'Project ID and status required'
          }, { status: 400 })
        }
        return handleUpdateStatus(body.projectId, body.data.status)

      case 'update-progress':
        if (!body.projectId || body.data?.progress === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Project ID and progress required'
          }, { status: 400 })
        }
        return handleUpdateProgress(body.projectId, body.data.progress)

      case 'update':
        if (!body.projectId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Project ID and update data required'
          }, { status: 400 })
        }
        return handleUpdateProject(body.projectId, body.data)

      case 'delete':
        if (!body.projectId) {
          return NextResponse.json({
            success: false,
            error: 'Project ID required'
          }, { status: 400 })
        }
        return handleDeleteProject(body.projectId)

      case 'add-member':
        if (!body.projectId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Project ID and member data required'
          }, { status: 400 })
        }
        return handleAddMember(body.projectId, body.data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    }, { status: 500 })
  }
}
