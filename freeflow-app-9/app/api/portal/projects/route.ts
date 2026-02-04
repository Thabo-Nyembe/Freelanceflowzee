/**
 * KAZI Client Portal API - Projects Management
 *
 * Comprehensive API for managing portal projects with milestones,
 * risk tracking, and progress monitoring.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('portal-projects')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const projectId = searchParams.get('projectId')
    const clientId = searchParams.get('clientId')

    switch (action) {
      case 'list': {
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('portal_projects')
          .select(`
            *,
            portal_clients!inner(id, name, company),
            portal_project_milestones(id, name, status, due_date)
          `, { count: 'exact' })
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        if (status) {
          query = query.eq('status', status)
        }

        if (priority) {
          query = query.eq('priority', priority)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          projects: data,
          total: count,
          limit,
          offset
        })
      }

      case 'get': {
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_projects')
          .select(`
            *,
            portal_clients!inner(id, name, email, company, user_id),
            portal_project_milestones(*),
            portal_project_risks(*),
            portal_files(id, name, size, type, created_at)
          `)
          .eq('id', projectId)
          .eq('portal_clients.user_id', user.id)
          .single()

        if (error) throw error

        return NextResponse.json({ project: data })
      }

      case 'milestones': {
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_project_milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true })

        if (error) throw error

        return NextResponse.json({ milestones: data })
      }

      case 'risks': {
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_project_risks')
          .select('*')
          .eq('project_id', projectId)
          .order('severity', { ascending: false })

        if (error) throw error

        return NextResponse.json({ risks: data })
      }

      case 'timeline': {
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }

        // Get project with milestones for timeline view
        const { data: project, error: projectError } = await supabase
          .from('portal_projects')
          .select('start_date, end_date, deadline')
          .eq('id', projectId)
          .single()

        if (projectError) throw projectError

        const { data: milestones, error: milestonesError } = await supabase
          .from('portal_project_milestones')
          .select('id, name, status, due_date, completed_at')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true })

        if (milestonesError) throw milestonesError

        return NextResponse.json({
          timeline: {
            project,
            milestones
          }
        })
      }

      case 'statistics': {
        let query = supabase
          .from('portal_projects')
          .select('status, progress, budget, actual_cost')
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        const { data: projects, error } = await query

        if (error) throw error

        const stats = {
          total: projects.length,
          by_status: {
            planning: projects.filter(p => p.status === 'planning').length,
            in_progress: projects.filter(p => p.status === 'in_progress').length,
            review: projects.filter(p => p.status === 'review').length,
            completed: projects.filter(p => p.status === 'completed').length,
            on_hold: projects.filter(p => p.status === 'on_hold').length
          },
          avg_progress: projects.length > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
            : 0,
          total_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
          total_spent: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0)
        }

        return NextResponse.json({ statistics: stats })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal projects GET error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        // Verify client belongs to user
        const { data: client, error: clientError } = await supabase
          .from('portal_clients')
          .select('id')
          .eq('id', data.clientId)
          .eq('user_id', user.id)
          .single()

        if (clientError || !client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        const { data: project, error } = await supabase
          .from('portal_projects')
          .insert({
            client_id: data.clientId,
            name: data.name,
            description: data.description,
            status: data.status || 'planning',
            priority: data.priority || 'medium',
            start_date: data.startDate,
            end_date: data.endDate,
            deadline: data.deadline,
            budget: data.budget,
            progress: 0,
            tags: data.tags || []
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: data.clientId,
            user_id: user.id,
            action: 'project_created',
            description: `Project "${data.name}" was created`,
            metadata: { project_id: project.id }
          })

        return NextResponse.json({ project }, { status: 201 })
      }

      case 'create_milestone': {
        const { data: milestone, error } = await supabase
          .from('portal_project_milestones')
          .insert({
            project_id: data.projectId,
            name: data.name,
            description: data.description,
            status: 'pending',
            due_date: data.dueDate,
            deliverables: data.deliverables || []
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ milestone }, { status: 201 })
      }

      case 'create_risk': {
        const { data: risk, error } = await supabase
          .from('portal_project_risks')
          .insert({
            project_id: data.projectId,
            title: data.title,
            description: data.description,
            severity: data.severity || 'medium',
            probability: data.probability || 'medium',
            impact: data.impact,
            mitigation: data.mitigation,
            status: 'identified'
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ risk }, { status: 201 })
      }

      case 'update_progress': {
        const { projectId, progress, notes } = data

        const { data: project, error } = await supabase
          .from('portal_projects')
          .update({
            progress: Math.min(100, Math.max(0, progress)),
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .single()

        if (error) throw error

        // Log activity
        const { data: projectClient } = await supabase
          .from('portal_projects')
          .select('client_id')
          .eq('id', projectId)
          .single()

        if (projectClient) {
          await supabase
            .from('portal_client_activities')
            .insert({
              client_id: projectClient.client_id,
              user_id: user.id,
              action: 'progress_updated',
              description: `Project progress updated to ${progress}%`,
              metadata: { project_id: projectId, notes }
            })
        }

        return NextResponse.json({ project })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal projects POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, ...updateData } = body

    switch (type) {
      case 'project': {
        // Remove fields that shouldn't be updated directly
        delete updateData.client_id
        delete updateData.created_at

        const { data: project, error } = await supabase
          .from('portal_projects')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ project })
      }

      case 'milestone': {
        const { data: milestone, error } = await supabase
          .from('portal_project_milestones')
          .update({
            ...updateData,
            completed_at: updateData.status === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ milestone })
      }

      case 'risk': {
        const { data: risk, error } = await supabase
          .from('portal_project_risks')
          .update({
            ...updateData,
            resolved_at: updateData.status === 'resolved' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ risk })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal projects PUT error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'project'
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    switch (type) {
      case 'project': {
        const { error } = await supabase
          .from('portal_projects')
          .delete()
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      case 'milestone': {
        const { error } = await supabase
          .from('portal_project_milestones')
          .delete()
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      case 'risk': {
        const { error } = await supabase
          .from('portal_project_risks')
          .delete()
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({ deleted: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal projects DELETE error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
