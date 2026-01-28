/**
 * KAZI Platform - Sprints API
 *
 * API for managing project sprints with demo mode support.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo user ID for demo mode
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Check for demo mode
    const demoMode = isDemoMode(request)

    // Determine which user ID to use
    let userId: string

    if (authError || !user) {
      if (demoMode) {
        // Use demo user ID for unauthenticated demo requests
        userId = DEMO_USER_ID
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Use authenticated user's ID, or demo user if demo mode requested
      userId = demoMode ? DEMO_USER_ID : user.id
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query for sprints
    let query = supabase
      .from('sprints')
      .select(`
        *,
        project:projects(id, name, client_id)
      `)
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(limit)

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: sprints, error } = await query

    if (error) {
      console.error('Sprints query error:', error)
      // Return empty array on error for graceful degradation
      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          sprints: [],
          stats: {
            totalSprints: 0,
            activeSprints: 0,
            completedSprints: 0,
            plannedSprints: 0
          }
        }
      })
    }

    // Calculate stats
    const stats = {
      totalSprints: sprints?.length || 0,
      activeSprints: sprints?.filter(s => s.status === 'active').length || 0,
      completedSprints: sprints?.filter(s => s.status === 'completed').length || 0,
      plannedSprints: sprints?.filter(s => s.status === 'planned').length || 0
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        sprints: sprints || [],
        stats
      }
    })
  } catch (error) {
    console.error('Sprints GET error:', error)
    return NextResponse.json({
      success: true,
      data: {
        sprints: [],
        stats: {
          totalSprints: 0,
          activeSprints: 0,
          completedSprints: 0,
          plannedSprints: 0
        }
      }
    })
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
    const {
      name,
      project_id,
      start_date,
      end_date,
      goal,
      status = 'planned'
    } = body

    if (!name || !project_id) {
      return NextResponse.json(
        { error: 'Name and project_id are required' },
        { status: 400 }
      )
    }

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        name,
        project_id,
        start_date: start_date || null,
        end_date: end_date || null,
        goal: goal || '',
        status,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Sprint creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create sprint' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sprint
    }, { status: 201 })
  } catch (error) {
    console.error('Sprints POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Sprint ID is required' },
        { status: 400 }
      )
    }

    const { data: sprint, error } = await supabase
      .from('sprints')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Sprint update error:', error)
      return NextResponse.json(
        { error: 'Failed to update sprint' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: sprint
    })
  } catch (error) {
    console.error('Sprints PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Sprint ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Sprint deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete sprint' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sprint deleted successfully'
    })
  } catch (error) {
    console.error('Sprints DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
