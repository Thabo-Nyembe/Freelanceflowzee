/**
 * KAZI Platform - Milestones API
 *
 * API for managing project milestones with demo mode support.
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

    // Build query for milestones
    let query = supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, name, client_id)
      `)
      .order('due_date', { ascending: true })
      .limit(limit)

    // Filter by project if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: milestones, error } = await query

    if (error) {
      console.error('Milestones query error:', error)
      // Return empty array on error for graceful degradation
      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          milestones: [],
          stats: {
            totalMilestones: 0,
            completedMilestones: 0,
            upcomingThisWeek: 0,
            totalValue: 0
          }
        }
      })
    }

    // Calculate stats
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const stats = {
      totalMilestones: milestones?.length || 0,
      completedMilestones: milestones?.filter(m => m.status === 'completed').length || 0,
      upcomingThisWeek: milestones?.filter(m => {
        const dueDate = new Date(m.due_date)
        return dueDate >= now && dueDate <= weekFromNow && m.status !== 'completed'
      }).length || 0,
      totalValue: milestones?.reduce((sum, m) => sum + (m.amount || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        milestones: milestones || [],
        stats
      }
    })
  } catch (error) {
    console.error('Milestones GET error:', error)
    return NextResponse.json({
      success: true,
      data: {
        milestones: [],
        stats: {
          totalMilestones: 0,
          completedMilestones: 0,
          upcomingThisWeek: 0,
          totalValue: 0
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
    const { title, project_id, due_date, amount, description, status = 'pending' } = body

    if (!title || !project_id) {
      return NextResponse.json(
        { error: 'Title and project_id are required' },
        { status: 400 }
      )
    }

    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert({
        title,
        project_id,
        due_date: due_date || null,
        amount: amount || 0,
        description: description || '',
        status,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Milestone creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: milestone
    }, { status: 201 })
  } catch (error) {
    console.error('Milestones POST error:', error)
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
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const { data: milestone, error } = await supabase
      .from('milestones')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Milestone update error:', error)
      return NextResponse.json(
        { error: 'Failed to update milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: milestone
    })
  } catch (error) {
    console.error('Milestones PUT error:', error)
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
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Milestone deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete milestone' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone deleted successfully'
    })
  } catch (error) {
    console.error('Milestones DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
