/**
 * Profile Settings API - Single Resource Routes
 *
 * PUT - Update activity log, connection
 * DELETE - Delete activity log, connection, profile view
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateActivityLog,
  deleteActivityLog,
  updateConnection,
  deleteConnection,
  disconnectPlatform,
  deleteProfileView
} from '@/lib/profile-settings-queries'

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

    switch (type) {
      case 'activity-log': {
        const result = await updateActivityLog(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'connection': {
        if (action === 'disconnect') {
          const result = await disconnectPlatform(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateConnection(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Profile Settings API error:', error)
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
    const type = searchParams.get('type') || 'activity-log'

    switch (type) {
      case 'activity-log': {
        await deleteActivityLog(id)
        return NextResponse.json({ success: true })
      }

      case 'connection': {
        await deleteConnection(id)
        return NextResponse.json({ success: true })
      }

      case 'profile-view': {
        await deleteProfileView(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Profile Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
