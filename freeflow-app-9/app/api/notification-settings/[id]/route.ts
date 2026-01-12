/**
 * Notification Settings API - Single Resource Routes
 *
 * GET - Get single schedule, template, delivery log, push token
 * PUT - Update preference, schedule, template, delivery log, push token, unsubscribe
 * DELETE - Delete preference, schedule, template, push token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateNotificationPreference,
  toggleNotificationPreference,
  deleteNotificationPreference,
  getNotificationSchedule,
  updateNotificationSchedule,
  activateNotificationSchedule,
  deleteNotificationSchedule,
  getNotificationTemplate,
  getNotificationTemplateByName,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationDeliveryLog,
  updateNotificationDeliveryLog,
  updateDeliveryStatus,
  getPushNotificationToken,
  updatePushNotificationToken,
  deactivatePushNotificationToken,
  deletePushNotificationToken,
  resubscribeNotification
} from '@/lib/notification-settings-queries'

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
    const type = searchParams.get('type') || 'schedule'
    const templateName = searchParams.get('template_name')
    const category = searchParams.get('category')

    switch (type) {
      case 'schedule': {
        const result = await getNotificationSchedule(id)
        return NextResponse.json({ data: result.data })
      }

      case 'template': {
        const result = await getNotificationTemplate(id)
        return NextResponse.json({ data: result.data })
      }

      case 'template-by-name': {
        if (!templateName || !category) {
          return NextResponse.json({ error: 'template_name and category required' }, { status: 400 })
        }
        const result = await getNotificationTemplateByName(templateName, category)
        return NextResponse.json({ data: result.data })
      }

      case 'delivery-log': {
        const result = await getNotificationDeliveryLog(id)
        return NextResponse.json({ data: result.data })
      }

      case 'push-token': {
        const result = await getPushNotificationToken(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notification Settings API error:', error)
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

    switch (type) {
      case 'preference': {
        if (action === 'toggle') {
          const result = await toggleNotificationPreference(user.id, updates.category, updates.channel, updates.enabled)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateNotificationPreference(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'schedule': {
        if (action === 'activate') {
          const result = await activateNotificationSchedule(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateNotificationSchedule(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'template': {
        const result = await updateNotificationTemplate(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'delivery-log': {
        if (action === 'update-status') {
          const result = await updateDeliveryStatus(id, updates.status, updates.error_message)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateNotificationDeliveryLog(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'push-token': {
        if (action === 'deactivate') {
          const result = await deactivatePushNotificationToken(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updatePushNotificationToken(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'unsubscribe': {
        if (action === 'resubscribe') {
          const result = await resubscribeNotification(id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for unsubscribe' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notification Settings API error:', error)
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
    const type = searchParams.get('type') || 'preference'

    switch (type) {
      case 'preference': {
        await deleteNotificationPreference(id)
        return NextResponse.json({ success: true })
      }

      case 'schedule': {
        await deleteNotificationSchedule(id)
        return NextResponse.json({ success: true })
      }

      case 'template': {
        await deleteNotificationTemplate(id)
        return NextResponse.json({ success: true })
      }

      case 'push-token': {
        await deletePushNotificationToken(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notification Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
