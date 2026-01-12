/**
 * Team Hub API - Single Resource Routes
 *
 * GET - Get single member or department
 * PUT - Update member or department
 * DELETE - Delete member or department
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updateMemberStatus,
  updateMemberAvailability,
  getDepartment,
  updateDepartment,
  deleteDepartment
} from '@/lib/team-hub-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'member'

    let data, error

    if (type === 'department') {
      ({ data, error } = await getDepartment(id, user.id))
    } else {
      ({ data, error } = await getTeamMember(id, user.id))
    }

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: `${type} not found` }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Team Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    let result

    if (type === 'department') {
      result = await updateDepartment(id, user.id, updates)
    } else {
      // Member updates
      switch (action) {
        case 'update-status':
          const statusResult = await updateMemberStatus(id, user.id, updates.status)
          return NextResponse.json({ success: statusResult.success })

        case 'update-availability':
          const availResult = await updateMemberAvailability(id, user.id, updates.availability)
          return NextResponse.json({ success: availResult.success })

        default:
          result = await updateTeamMember(id, user.id, updates)
      }
    }

    if (result?.error) throw result.error

    return NextResponse.json({ data: result?.data })
  } catch (error) {
    console.error('Team Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'member'

    let success, error

    if (type === 'department') {
      ({ success, error } = await deleteDepartment(id, user.id))
    } else {
      ({ success, error } = await deleteTeamMember(id, user.id))
    }

    if (error) throw error

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Team Hub API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
