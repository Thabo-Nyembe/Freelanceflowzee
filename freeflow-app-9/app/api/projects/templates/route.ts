/**
 * KAZI Platform - Project Templates API
 *
 * World-class project templating system:
 * - Pre-built industry templates
 * - Custom template creation
 * - Template marketplace
 * - Task blueprints with dependencies
 * - Milestone presets
 * - Resource allocation templates
 * - Budget estimations
 *
 * @module app/api/projects/templates/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@/lib/auth'

// ============================================================================
// TYPES
// ============================================================================

type TemplateCategory =
  | 'web-development'
  | 'mobile-app'
  | 'branding'
  | 'marketing'
  | 'video-production'
  | 'photography'
  | 'consulting'
  | 'event-planning'
  | 'content-creation'
  | 'software-development'
  | 'design'
  | 'other'

type TemplateVisibility = 'private' | 'team' | 'public' | 'marketplace'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  visibility: TemplateVisibility
  user_id: string
  team_id: string | null
  thumbnail_url: string | null
  cover_image: string | null
  estimated_duration_days: number
  estimated_budget_min: number | null
  estimated_budget_max: number | null
  currency: string
  default_tasks: TaskTemplate[]
  milestones: MilestoneTemplate[]
  phases: PhaseTemplate[]
  resources: ResourceTemplate[]
  settings: TemplateSettings
  tags: string[]
  metadata: Record<string, unknown>
  use_count: number
  rating: number
  rating_count: number
  is_featured: boolean
  is_premium: boolean
  price: number | null
  created_at: string
  updated_at: string
}

interface TaskTemplate {
  id: string
  title: string
  description: string
  estimated_hours: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  position: number
  phase_id: string | null
  milestone_id: string | null
  dependencies: string[]
  checklist: { text: string; required: boolean }[]
  tags: string[]
  assignee_role: string | null
}

interface MilestoneTemplate {
  id: string
  name: string
  description: string
  position: number
  day_offset: number
  deliverables: string[]
  payment_percentage: number | null
}

interface PhaseTemplate {
  id: string
  name: string
  description: string
  position: number
  color: string
  day_offset_start: number
  day_offset_end: number
}

interface ResourceTemplate {
  role: string
  hours_estimated: number
  hourly_rate: number | null
  skills_required: string[]
}

interface TemplateSettings {
  default_visibility: string
  enable_time_tracking: boolean
  enable_budget_tracking: boolean
  enable_client_portal: boolean
  require_milestones: boolean
  auto_create_folders: boolean
  folder_structure: string[]
  notification_settings: Record<string, boolean>
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
// GET - List Templates / Get Single Template
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    const templateId = searchParams.get('id')
    const category = searchParams.get('category') as TemplateCategory
    const visibility = searchParams.get('visibility')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const marketplace = searchParams.get('marketplace') === 'true'
    const sortBy = searchParams.get('sort_by') || 'use_count'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = getSupabase()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        templates: getBuiltInTemplates(),
        categories: getTemplateCategories(),
        pagination: { page: 1, limit: 20, total: 8, totalPages: 1 }
      })
    }

    const userId = session.user.id

    // Single template fetch
    if (templateId) {
      const { data: template, error } = await supabase
        .from('project_templates')
        .select(`
          *,
          creator:users!project_templates_user_id_fkey(id, name, avatar_url),
          team:teams(id, name)
        `)
        .eq('id', templateId)
        .single()

      if (error || !template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      // Check access
      const canAccess =
        template.visibility === 'public' ||
        template.visibility === 'marketplace' ||
        template.user_id === userId

      if (!canAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        template
      })
    }

    // Build query for template list
    let query = supabase
      .from('project_templates')
      .select(`
        *,
        creator:users!project_templates_user_id_fkey(id, name, avatar_url)
      `, { count: 'exact' })

    // Visibility filters
    if (marketplace) {
      query = query.eq('visibility', 'marketplace')
    } else if (visibility) {
      query = query.eq('visibility', visibility)
    } else {
      // Show own templates + public + marketplace
      query = query.or(`user_id.eq.${userId},visibility.eq.public,visibility.eq.marketplace`)
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (featured) {
      query = query.eq('is_featured', true)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: templates, error, count } = await query

    if (error) {
      console.error('Templates query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Include built-in templates if no specific filter
    const allTemplates = !category && !search && page === 1
      ? [...getBuiltInTemplates(), ...(templates || [])]
      : templates || []

    return NextResponse.json({
      success: true,
      templates: allTemplates,
      categories: getTemplateCategories(),
      pagination: {
        page,
        limit,
        total: (count || 0) + (page === 1 && !category ? getBuiltInTemplates().length : 0),
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Templates GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Template / Actions
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
    const body = await request.json()
    const { action = 'create' } = body

    const supabase = getSupabase()

    switch (action) {
      case 'create':
        return handleCreateTemplate(supabase, userId, body)

      case 'create_from_project':
        return handleCreateFromProject(supabase, userId, body)

      case 'duplicate':
        return handleDuplicateTemplate(supabase, userId, body)

      case 'use':
        return handleUseTemplate(supabase, userId, body)

      case 'rate':
        return handleRateTemplate(supabase, userId, body)

      case 'publish':
        return handlePublishTemplate(supabase, userId, body)

      default:
        return handleCreateTemplate(supabase, userId, body)
    }
  } catch (error) {
    console.error('Templates POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Template
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
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Verify ownership
    const { data: existing } = await supabase
      .from('project_templates')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'name', 'description', 'category', 'visibility', 'thumbnail_url',
      'cover_image', 'estimated_duration_days', 'estimated_budget_min',
      'estimated_budget_max', 'currency', 'default_tasks', 'milestones',
      'phases', 'resources', 'settings', 'tags', 'metadata'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    const { data: template, error } = await supabase
      .from('project_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Template update error:', error)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
      message: 'Template updated successfully'
    })
  } catch (error) {
    console.error('Templates PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Template
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
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Verify ownership
    const { data: existing } = await supabase
      .from('project_templates')
      .select('user_id')
      .eq('id', templateId)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('project_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Template deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Templates DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    name,
    description,
    category = 'other',
    visibility = 'private',
    team_id,
    thumbnail_url,
    cover_image,
    estimated_duration_days = 30,
    estimated_budget_min,
    estimated_budget_max,
    currency = 'USD',
    default_tasks = [],
    milestones = [],
    phases = [],
    resources = [],
    settings = {},
    tags = [],
    metadata = {}
  } = body

  if (!name || (typeof name === 'string' && name.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Template name is required' },
      { status: 400 }
    )
  }

  const templateData = {
    name: typeof name === 'string' ? name.trim() : name,
    description: description || '',
    category,
    visibility,
    user_id: userId,
    team_id: team_id || null,
    thumbnail_url: thumbnail_url || null,
    cover_image: cover_image || null,
    estimated_duration_days,
    estimated_budget_min: estimated_budget_min || null,
    estimated_budget_max: estimated_budget_max || null,
    currency,
    default_tasks: processTaskTemplates(default_tasks as TaskTemplate[]),
    milestones: processMilestoneTemplates(milestones as MilestoneTemplate[]),
    phases: phases || [],
    resources: resources || [],
    settings: getDefaultSettings(settings as Partial<TemplateSettings>),
    tags: tags || [],
    metadata: metadata || {},
    use_count: 0,
    rating: 0,
    rating_count: 0,
    is_featured: false,
    is_premium: false,
    price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: template, error } = await supabase
    .from('project_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) {
    console.error('Template creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    template,
    message: 'Template created successfully'
  }, { status: 201 })
}

async function handleCreateFromProject(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, name, description, include_tasks = true, include_milestones = true } = body

  if (!project_id) {
    return NextResponse.json(
      { error: 'project_id is required' },
      { status: 400 }
    )
  }

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .eq('user_id', userId)
    .single()

  if (projectError || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  // Get tasks if requested
  let taskTemplates: TaskTemplate[] = []
  if (include_tasks) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project_id)
      .order('position', { ascending: true })

    taskTemplates = (tasks || []).map((task, index) => ({
      id: `task-${index + 1}`,
      title: task.title,
      description: task.description || '',
      estimated_hours: Math.round((task.estimated_minutes || 60) / 60),
      priority: task.priority || 'medium',
      category: task.category || 'work',
      position: index,
      phase_id: null,
      milestone_id: null,
      dependencies: [],
      checklist: task.checklist || [],
      tags: task.tags || [],
      assignee_role: null
    }))
  }

  // Get milestones if requested
  let milestoneTemplates: MilestoneTemplate[] = []
  if (include_milestones) {
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', project_id)
      .order('position', { ascending: true })

    milestoneTemplates = (milestones || []).map((ms, index) => ({
      id: `milestone-${index + 1}`,
      name: ms.name,
      description: ms.description || '',
      position: index,
      day_offset: 0,
      deliverables: ms.deliverables || [],
      payment_percentage: ms.payment_percentage || null
    }))
  }

  // Calculate duration
  const startDate = project.start_date ? new Date(project.start_date) : new Date()
  const endDate = project.due_date ? new Date(project.due_date) : new Date()
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const templateData = {
    name: name || `Template from ${project.name}`,
    description: description || project.description || '',
    category: project.type || 'other',
    visibility: 'private',
    user_id: userId,
    team_id: project.team_id,
    thumbnail_url: project.cover_image,
    cover_image: project.cover_image,
    estimated_duration_days: Math.max(durationDays, 1),
    estimated_budget_min: project.budget ? Math.round(project.budget * 0.8) : null,
    estimated_budget_max: project.budget ? Math.round(project.budget * 1.2) : null,
    currency: project.currency || 'USD',
    default_tasks: taskTemplates,
    milestones: milestoneTemplates,
    phases: [],
    resources: [],
    settings: getDefaultSettings({}),
    tags: project.tags || [],
    metadata: { source_project_id: project_id },
    use_count: 0,
    rating: 0,
    rating_count: 0,
    is_featured: false,
    is_premium: false,
    price: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: template, error } = await supabase
    .from('project_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) {
    console.error('Template from project error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    template,
    message: 'Template created from project'
  }, { status: 201 })
}

async function handleDuplicateTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { template_id, name } = body

  if (!template_id) {
    return NextResponse.json(
      { error: 'template_id is required' },
      { status: 400 }
    )
  }

  const { data: original, error: fetchError } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', template_id)
    .single()

  if (fetchError || !original) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }

  const duplicateData = {
    ...original,
    id: undefined,
    name: name || `${original.name} (Copy)`,
    user_id: userId,
    visibility: 'private',
    use_count: 0,
    rating: 0,
    rating_count: 0,
    is_featured: false,
    is_premium: false,
    price: null,
    metadata: { ...original.metadata, duplicated_from: template_id },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  delete duplicateData.id

  const { data: template, error } = await supabase
    .from('project_templates')
    .insert(duplicateData)
    .select()
    .single()

  if (error) {
    console.error('Template duplication error:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    template,
    message: 'Template duplicated'
  }, { status: 201 })
}

async function handleUseTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { template_id, project_name, start_date, client_id, team_id, customize = {} } = body

  if (!template_id) {
    return NextResponse.json(
      { error: 'template_id is required' },
      { status: 400 }
    )
  }

  // Get template (either from DB or built-in)
  let template: Partial<ProjectTemplate>

  const { data: dbTemplate } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', template_id)
    .single()

  if (dbTemplate) {
    template = dbTemplate
  } else {
    // Check built-in templates
    const builtIn = getBuiltInTemplates().find(t => t.id === template_id)
    if (!builtIn) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    template = builtIn
  }

  // Calculate dates
  const projectStart = start_date ? new Date(start_date as string) : new Date()
  const projectEnd = new Date(projectStart)
  projectEnd.setDate(projectEnd.getDate() + (template.estimated_duration_days || 30))

  // Create project
  const projectData = {
    name: project_name || template.name,
    description: template.description,
    type: template.category,
    status: 'planning',
    priority: 'medium',
    user_id: userId,
    team_id: team_id || template.team_id,
    client_id: client_id || null,
    budget: template.estimated_budget_max,
    currency: template.currency || 'USD',
    start_date: projectStart.toISOString(),
    due_date: projectEnd.toISOString(),
    progress: 0,
    visibility: 'private',
    settings: template.settings || {},
    metadata: { template_id, template_name: template.name },
    tags: template.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  if (projectError) {
    console.error('Project creation error:', projectError)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }

  // Create tasks from template
  const tasks = template.default_tasks || []
  if (tasks.length > 0) {
    const taskRecords = tasks.map((task: TaskTemplate, index: number) => ({
      title: task.title,
      description: task.description,
      status: 'todo',
      priority: task.priority,
      category: task.category,
      user_id: userId,
      project_id: project.id,
      estimated_minutes: (task.estimated_hours || 1) * 60,
      position: index,
      tags: task.tags || [],
      checklist: task.checklist || [],
      dependencies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    await supabase.from('tasks').insert(taskRecords)
  }

  // Create milestones from template
  const milestones = template.milestones || []
  if (milestones.length > 0) {
    const milestoneRecords = milestones.map((ms: MilestoneTemplate, index: number) => {
      const dueDate = new Date(projectStart)
      dueDate.setDate(dueDate.getDate() + (ms.day_offset || index * 7))

      return {
        name: ms.name,
        description: ms.description,
        project_id: project.id,
        user_id: userId,
        position: index,
        due_date: dueDate.toISOString(),
        deliverables: ms.deliverables || [],
        payment_percentage: ms.payment_percentage,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    })

    await supabase.from('milestones').insert(milestoneRecords)
  }

  // Increment use count if from database
  if (dbTemplate) {
    await supabase
      .from('project_templates')
      .update({ use_count: (dbTemplate.use_count || 0) + 1 })
      .eq('id', template_id)
  }

  // Add user as project member
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: userId,
    role: 'owner',
    can_edit: true,
    can_delete: true,
    can_share: true,
    can_manage_members: true
  })

  return NextResponse.json({
    success: true,
    project,
    tasks_created: tasks.length,
    milestones_created: milestones.length,
    message: 'Project created from template'
  }, { status: 201 })
}

async function handleRateTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { template_id, rating, review } = body

  if (!template_id || !rating) {
    return NextResponse.json(
      { error: 'template_id and rating are required' },
      { status: 400 }
    )
  }

  const ratingValue = Number(rating)
  if (ratingValue < 1 || ratingValue > 5) {
    return NextResponse.json(
      { error: 'Rating must be between 1 and 5' },
      { status: 400 }
    )
  }

  // Check if already rated
  const { data: existingRating } = await supabase
    .from('template_ratings')
    .select('id, rating')
    .eq('template_id', template_id)
    .eq('user_id', userId)
    .single()

  if (existingRating) {
    // Update existing rating
    await supabase
      .from('template_ratings')
      .update({
        rating: ratingValue,
        review: review || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRating.id)
  } else {
    // Create new rating
    await supabase.from('template_ratings').insert({
      template_id,
      user_id: userId,
      rating: ratingValue,
      review: review || null,
      created_at: new Date().toISOString()
    })
  }

  // Update template average rating
  const { data: allRatings } = await supabase
    .from('template_ratings')
    .select('rating')
    .eq('template_id', template_id)

  const avgRating = allRatings?.length
    ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    : 0

  await supabase
    .from('project_templates')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      rating_count: allRatings?.length || 0
    })
    .eq('id', template_id)

  return NextResponse.json({
    success: true,
    message: 'Rating submitted'
  })
}

async function handlePublishTemplate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { template_id, visibility = 'public', price } = body

  if (!template_id) {
    return NextResponse.json(
      { error: 'template_id is required' },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: template } = await supabase
    .from('project_templates')
    .select('user_id')
    .eq('id', template_id)
    .single()

  if (!template || template.user_id !== userId) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  const updateData: Record<string, unknown> = {
    visibility,
    updated_at: new Date().toISOString()
  }

  if (visibility === 'marketplace' && price) {
    updateData.is_premium = true
    updateData.price = price
  }

  const { data: updated, error } = await supabase
    .from('project_templates')
    .update(updateData)
    .eq('id', template_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    template: updated,
    message: `Template published to ${visibility}`
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function processTaskTemplates(tasks: TaskTemplate[]): TaskTemplate[] {
  return tasks.map((task, index) => ({
    id: task.id || `task-${index + 1}`,
    title: task.title,
    description: task.description || '',
    estimated_hours: task.estimated_hours || 1,
    priority: task.priority || 'medium',
    category: task.category || 'work',
    position: task.position ?? index,
    phase_id: task.phase_id || null,
    milestone_id: task.milestone_id || null,
    dependencies: task.dependencies || [],
    checklist: task.checklist || [],
    tags: task.tags || [],
    assignee_role: task.assignee_role || null
  }))
}

function processMilestoneTemplates(milestones: MilestoneTemplate[]): MilestoneTemplate[] {
  return milestones.map((ms, index) => ({
    id: ms.id || `milestone-${index + 1}`,
    name: ms.name,
    description: ms.description || '',
    position: ms.position ?? index,
    day_offset: ms.day_offset || index * 7,
    deliverables: ms.deliverables || [],
    payment_percentage: ms.payment_percentage || null
  }))
}

function getDefaultSettings(custom: Partial<TemplateSettings>): TemplateSettings {
  return {
    default_visibility: 'private',
    enable_time_tracking: true,
    enable_budget_tracking: true,
    enable_client_portal: true,
    require_milestones: false,
    auto_create_folders: true,
    folder_structure: ['Documents', 'Designs', 'Assets', 'Deliverables'],
    notification_settings: {
      task_assigned: true,
      task_completed: true,
      comment_added: true,
      milestone_due: true
    },
    ...custom
  }
}

function getTemplateCategories() {
  return [
    { id: 'web-development', name: 'Web Development', icon: 'globe', color: '#3B82F6' },
    { id: 'mobile-app', name: 'Mobile App', icon: 'smartphone', color: '#8B5CF6' },
    { id: 'branding', name: 'Branding & Identity', icon: 'palette', color: '#EC4899' },
    { id: 'marketing', name: 'Marketing Campaign', icon: 'megaphone', color: '#F59E0B' },
    { id: 'video-production', name: 'Video Production', icon: 'video', color: '#EF4444' },
    { id: 'photography', name: 'Photography', icon: 'camera', color: '#10B981' },
    { id: 'consulting', name: 'Consulting', icon: 'briefcase', color: '#6366F1' },
    { id: 'event-planning', name: 'Event Planning', icon: 'calendar', color: '#14B8A6' },
    { id: 'content-creation', name: 'Content Creation', icon: 'pen', color: '#F97316' },
    { id: 'software-development', name: 'Software Development', icon: 'code', color: '#06B6D4' },
    { id: 'design', name: 'Design Project', icon: 'layers', color: '#A855F7' },
    { id: 'other', name: 'Other', icon: 'folder', color: '#6B7280' }
  ]
}

function getBuiltInTemplates(): Partial<ProjectTemplate>[] {
  return [
    {
      id: 'builtin-web-dev',
      name: 'Professional Website',
      description: 'Complete website development from discovery to launch, including design, development, and deployment.',
      category: 'web-development',
      visibility: 'public',
      thumbnail_url: '/templates/web-dev.png',
      estimated_duration_days: 45,
      estimated_budget_min: 3000,
      estimated_budget_max: 8000,
      currency: 'USD',
      default_tasks: [
        { id: 't1', title: 'Discovery & Requirements', description: 'Gather requirements and understand client needs', estimated_hours: 8, priority: 'high', category: 'work', position: 0, phase_id: null, milestone_id: null, dependencies: [], checklist: [], tags: ['discovery'], assignee_role: null },
        { id: 't2', title: 'Wireframe Design', description: 'Create low-fidelity wireframes', estimated_hours: 16, priority: 'high', category: 'creative', position: 1, phase_id: null, milestone_id: null, dependencies: ['t1'], checklist: [], tags: ['design'], assignee_role: null },
        { id: 't3', title: 'UI/UX Design', description: 'Create high-fidelity mockups', estimated_hours: 24, priority: 'high', category: 'creative', position: 2, phase_id: null, milestone_id: null, dependencies: ['t2'], checklist: [], tags: ['design'], assignee_role: null },
        { id: 't4', title: 'Frontend Development', description: 'Build responsive frontend', estimated_hours: 40, priority: 'high', category: 'work', position: 3, phase_id: null, milestone_id: null, dependencies: ['t3'], checklist: [], tags: ['development'], assignee_role: null },
        { id: 't5', title: 'Backend Integration', description: 'Connect to APIs and database', estimated_hours: 32, priority: 'medium', category: 'work', position: 4, phase_id: null, milestone_id: null, dependencies: ['t4'], checklist: [], tags: ['development'], assignee_role: null },
        { id: 't6', title: 'Testing & QA', description: 'Test across devices and browsers', estimated_hours: 16, priority: 'high', category: 'work', position: 5, phase_id: null, milestone_id: null, dependencies: ['t5'], checklist: [], tags: ['testing'], assignee_role: null },
        { id: 't7', title: 'Launch & Deployment', description: 'Deploy to production', estimated_hours: 8, priority: 'urgent', category: 'work', position: 6, phase_id: null, milestone_id: null, dependencies: ['t6'], checklist: [], tags: ['deployment'], assignee_role: null }
      ],
      milestones: [
        { id: 'm1', name: 'Design Approval', description: 'Client approves final designs', position: 0, day_offset: 14, deliverables: ['Wireframes', 'UI Mockups', 'Style Guide'], payment_percentage: 30 },
        { id: 'm2', name: 'Development Complete', description: 'All features implemented', position: 1, day_offset: 35, deliverables: ['Working Website', 'Admin Panel'], payment_percentage: 40 },
        { id: 'm3', name: 'Launch', description: 'Website goes live', position: 2, day_offset: 45, deliverables: ['Live Website', 'Documentation', 'Training'], payment_percentage: 30 }
      ],
      phases: [],
      resources: [],
      settings: getDefaultSettings({}),
      tags: ['website', 'development', 'design'],
      metadata: {},
      use_count: 1250,
      rating: 4.8,
      rating_count: 156,
      is_featured: true,
      is_premium: false,
      price: null
    },
    {
      id: 'builtin-branding',
      name: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, colors, typography, and brand guidelines.',
      category: 'branding',
      visibility: 'public',
      thumbnail_url: '/templates/branding.png',
      estimated_duration_days: 30,
      estimated_budget_min: 2000,
      estimated_budget_max: 5000,
      currency: 'USD',
      default_tasks: [
        { id: 't1', title: 'Brand Discovery', description: 'Research and brand strategy', estimated_hours: 8, priority: 'high', category: 'work', position: 0, phase_id: null, milestone_id: null, dependencies: [], checklist: [], tags: ['research'], assignee_role: null },
        { id: 't2', title: 'Logo Concepts', description: 'Create 3 logo concepts', estimated_hours: 16, priority: 'high', category: 'creative', position: 1, phase_id: null, milestone_id: null, dependencies: ['t1'], checklist: [], tags: ['logo'], assignee_role: null },
        { id: 't3', title: 'Logo Refinement', description: 'Refine selected concept', estimated_hours: 12, priority: 'high', category: 'creative', position: 2, phase_id: null, milestone_id: null, dependencies: ['t2'], checklist: [], tags: ['logo'], assignee_role: null },
        { id: 't4', title: 'Color Palette', description: 'Develop brand colors', estimated_hours: 4, priority: 'medium', category: 'creative', position: 3, phase_id: null, milestone_id: null, dependencies: ['t3'], checklist: [], tags: ['colors'], assignee_role: null },
        { id: 't5', title: 'Typography Selection', description: 'Select brand fonts', estimated_hours: 4, priority: 'medium', category: 'creative', position: 4, phase_id: null, milestone_id: null, dependencies: ['t3'], checklist: [], tags: ['typography'], assignee_role: null },
        { id: 't6', title: 'Brand Guidelines', description: 'Create comprehensive guidelines', estimated_hours: 16, priority: 'high', category: 'work', position: 5, phase_id: null, milestone_id: null, dependencies: ['t4', 't5'], checklist: [], tags: ['documentation'], assignee_role: null },
        { id: 't7', title: 'Collateral Design', description: 'Business cards, letterhead', estimated_hours: 12, priority: 'medium', category: 'creative', position: 6, phase_id: null, milestone_id: null, dependencies: ['t6'], checklist: [], tags: ['collateral'], assignee_role: null }
      ],
      milestones: [
        { id: 'm1', name: 'Concept Approval', description: 'Client selects logo direction', position: 0, day_offset: 10, deliverables: ['Logo Concepts', 'Mood Board'], payment_percentage: 40 },
        { id: 'm2', name: 'Brand System Complete', description: 'Full brand identity delivered', position: 1, day_offset: 25, deliverables: ['Final Logo', 'Brand Guidelines'], payment_percentage: 40 },
        { id: 'm3', name: 'Final Delivery', description: 'All files and collateral', position: 2, day_offset: 30, deliverables: ['All Source Files', 'Collateral Templates'], payment_percentage: 20 }
      ],
      phases: [],
      resources: [],
      settings: getDefaultSettings({}),
      tags: ['branding', 'logo', 'identity'],
      metadata: {},
      use_count: 890,
      rating: 4.9,
      rating_count: 112,
      is_featured: true,
      is_premium: false,
      price: null
    },
    {
      id: 'builtin-video',
      name: 'Video Production',
      description: 'End-to-end video production from concept to final delivery.',
      category: 'video-production',
      visibility: 'public',
      thumbnail_url: '/templates/video.png',
      estimated_duration_days: 21,
      estimated_budget_min: 1500,
      estimated_budget_max: 10000,
      currency: 'USD',
      default_tasks: [
        { id: 't1', title: 'Creative Brief', description: 'Define video objectives and style', estimated_hours: 4, priority: 'high', category: 'work', position: 0, phase_id: null, milestone_id: null, dependencies: [], checklist: [], tags: ['planning'], assignee_role: null },
        { id: 't2', title: 'Script Writing', description: 'Write video script', estimated_hours: 8, priority: 'high', category: 'creative', position: 1, phase_id: null, milestone_id: null, dependencies: ['t1'], checklist: [], tags: ['script'], assignee_role: null },
        { id: 't3', title: 'Storyboard', description: 'Create visual storyboard', estimated_hours: 8, priority: 'medium', category: 'creative', position: 2, phase_id: null, milestone_id: null, dependencies: ['t2'], checklist: [], tags: ['storyboard'], assignee_role: null },
        { id: 't4', title: 'Pre-Production', description: 'Location scouting, casting', estimated_hours: 16, priority: 'high', category: 'work', position: 3, phase_id: null, milestone_id: null, dependencies: ['t3'], checklist: [], tags: ['pre-production'], assignee_role: null },
        { id: 't5', title: 'Filming', description: 'Principal photography', estimated_hours: 24, priority: 'urgent', category: 'work', position: 4, phase_id: null, milestone_id: null, dependencies: ['t4'], checklist: [], tags: ['filming'], assignee_role: null },
        { id: 't6', title: 'Editing', description: 'Video editing and assembly', estimated_hours: 24, priority: 'high', category: 'creative', position: 5, phase_id: null, milestone_id: null, dependencies: ['t5'], checklist: [], tags: ['editing'], assignee_role: null },
        { id: 't7', title: 'Color Grading', description: 'Color correction and grading', estimated_hours: 8, priority: 'medium', category: 'creative', position: 6, phase_id: null, milestone_id: null, dependencies: ['t6'], checklist: [], tags: ['color'], assignee_role: null },
        { id: 't8', title: 'Sound Design', description: 'Music, SFX, and mixing', estimated_hours: 8, priority: 'medium', category: 'creative', position: 7, phase_id: null, milestone_id: null, dependencies: ['t6'], checklist: [], tags: ['audio'], assignee_role: null },
        { id: 't9', title: 'Final Export', description: 'Export in required formats', estimated_hours: 4, priority: 'high', category: 'work', position: 8, phase_id: null, milestone_id: null, dependencies: ['t7', 't8'], checklist: [], tags: ['delivery'], assignee_role: null }
      ],
      milestones: [
        { id: 'm1', name: 'Pre-Production Complete', description: 'Script and storyboard approved', position: 0, day_offset: 7, deliverables: ['Script', 'Storyboard', 'Shot List'], payment_percentage: 30 },
        { id: 'm2', name: 'Filming Complete', description: 'All footage captured', position: 1, day_offset: 14, deliverables: ['Raw Footage', 'BTS Content'], payment_percentage: 30 },
        { id: 'm3', name: 'Final Delivery', description: 'Finished video delivered', position: 2, day_offset: 21, deliverables: ['Final Video', 'Project Files'], payment_percentage: 40 }
      ],
      phases: [],
      resources: [],
      settings: getDefaultSettings({}),
      tags: ['video', 'production', 'editing'],
      metadata: {},
      use_count: 654,
      rating: 4.7,
      rating_count: 89,
      is_featured: true,
      is_premium: false,
      price: null
    },
    {
      id: 'builtin-marketing',
      name: 'Marketing Campaign',
      description: 'Full marketing campaign from strategy to execution and analysis.',
      category: 'marketing',
      visibility: 'public',
      thumbnail_url: '/templates/marketing.png',
      estimated_duration_days: 60,
      estimated_budget_min: 5000,
      estimated_budget_max: 25000,
      currency: 'USD',
      default_tasks: [
        { id: 't1', title: 'Market Research', description: 'Analyze market and competitors', estimated_hours: 16, priority: 'high', category: 'work', position: 0, phase_id: null, milestone_id: null, dependencies: [], checklist: [], tags: ['research'], assignee_role: null },
        { id: 't2', title: 'Campaign Strategy', description: 'Develop campaign plan', estimated_hours: 12, priority: 'high', category: 'work', position: 1, phase_id: null, milestone_id: null, dependencies: ['t1'], checklist: [], tags: ['strategy'], assignee_role: null },
        { id: 't3', title: 'Creative Development', description: 'Design campaign assets', estimated_hours: 32, priority: 'high', category: 'creative', position: 2, phase_id: null, milestone_id: null, dependencies: ['t2'], checklist: [], tags: ['creative'], assignee_role: null },
        { id: 't4', title: 'Content Creation', description: 'Write copy and content', estimated_hours: 24, priority: 'high', category: 'creative', position: 3, phase_id: null, milestone_id: null, dependencies: ['t2'], checklist: [], tags: ['content'], assignee_role: null },
        { id: 't5', title: 'Ad Setup', description: 'Configure ad platforms', estimated_hours: 8, priority: 'medium', category: 'work', position: 4, phase_id: null, milestone_id: null, dependencies: ['t3', 't4'], checklist: [], tags: ['ads'], assignee_role: null },
        { id: 't6', title: 'Campaign Launch', description: 'Launch all channels', estimated_hours: 4, priority: 'urgent', category: 'work', position: 5, phase_id: null, milestone_id: null, dependencies: ['t5'], checklist: [], tags: ['launch'], assignee_role: null },
        { id: 't7', title: 'Optimization', description: 'Monitor and optimize', estimated_hours: 40, priority: 'high', category: 'work', position: 6, phase_id: null, milestone_id: null, dependencies: ['t6'], checklist: [], tags: ['optimization'], assignee_role: null },
        { id: 't8', title: 'Reporting', description: 'Analytics and insights', estimated_hours: 8, priority: 'medium', category: 'work', position: 7, phase_id: null, milestone_id: null, dependencies: ['t7'], checklist: [], tags: ['reporting'], assignee_role: null }
      ],
      milestones: [
        { id: 'm1', name: 'Strategy Approval', description: 'Campaign strategy approved', position: 0, day_offset: 14, deliverables: ['Strategy Document', 'Media Plan'], payment_percentage: 25 },
        { id: 'm2', name: 'Creative Approval', description: 'All creative assets approved', position: 1, day_offset: 28, deliverables: ['Ad Creative', 'Landing Pages', 'Content Calendar'], payment_percentage: 25 },
        { id: 'm3', name: 'Campaign Launch', description: 'Campaign goes live', position: 2, day_offset: 35, deliverables: ['Live Campaigns'], payment_percentage: 25 },
        { id: 'm4', name: 'Final Report', description: 'Campaign analysis delivered', position: 3, day_offset: 60, deliverables: ['Performance Report', 'Recommendations'], payment_percentage: 25 }
      ],
      phases: [],
      resources: [],
      settings: getDefaultSettings({}),
      tags: ['marketing', 'campaign', 'digital'],
      metadata: {},
      use_count: 432,
      rating: 4.6,
      rating_count: 67,
      is_featured: false,
      is_premium: false,
      price: null
    }
  ]
}
