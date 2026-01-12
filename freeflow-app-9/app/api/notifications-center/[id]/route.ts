/**
 * Notifications Center API - Single Resource Routes
 *
 * PUT - Update group, unsnooze, undo bulk action, update filter
 * DELETE - Delete group, snoozed notification, filter, reaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateNotificationGroup,
  deleteNotificationGroup,
  toggleGroupCollapse,
  updateGroupSortOrder,
  unsnoozeNotification,
  deleteSnoozedNotification,
  undoBulkAction,
  updateBulkActionResults,
  updateSavedFilter,
  deleteSavedFilter,
  setDefaultFilter,
  toggleFilterFavorite,
  incrementFilterUsage,
  removeNotificationReaction
} from '@/lib/notifications-center-queries'

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
      case 'group': {
        if (action === 'toggle-collapse') {
          const result = await toggleGroupCollapse(id, updates.collapsed)
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-sort-order') {
          const result = await updateGroupSortOrder(id, updates.sort_order)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateNotificationGroup(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'snoozed': {
        if (action === 'unsnooze') {
          const result = await unsnoozeNotification(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for snoozed' }, { status: 400 })
      }

      case 'bulk-action': {
        if (action === 'undo') {
          const result = await undoBulkAction(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-results') {
          const result = await updateBulkActionResults(
            id,
            updates.successful_count,
            updates.failed_count,
            updates.error_messages
          )
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for bulk-action' }, { status: 400 })
      }

      case 'filter': {
        if (action === 'set-default') {
          const result = await setDefaultFilter(id, user.id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-favorite') {
          const result = await toggleFilterFavorite(id, updates.is_favorite)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-usage') {
          const result = await incrementFilterUsage(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateSavedFilter(id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notifications Center API error:', error)
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
    const type = searchParams.get('type') || 'group'

    switch (type) {
      case 'group': {
        await deleteNotificationGroup(id)
        return NextResponse.json({ success: true })
      }

      case 'snoozed': {
        await deleteSnoozedNotification(id)
        return NextResponse.json({ success: true })
      }

      case 'filter': {
        await deleteSavedFilter(id)
        return NextResponse.json({ success: true })
      }

      case 'reaction': {
        await removeNotificationReaction(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notifications Center API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
