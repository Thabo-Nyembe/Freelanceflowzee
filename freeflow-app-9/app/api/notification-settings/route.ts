/**
 * Notification Settings API Routes
 *
 * REST endpoints for Notification Settings:
 * GET - Preferences, schedules, templates, delivery logs, push tokens, unsubscribes, stats
 * POST - Create preferences, schedules, templates, logs, push tokens, unsubscribes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('notification-settings')
import {

  getNotificationPreferences,
  getNotificationPreference,
  createNotificationPreference,
  getNotificationSchedules,
  getActiveNotificationSchedule,
  createNotificationSchedule,
  getNotificationTemplates,
  getUserNotificationTemplates,
  createNotificationTemplate,
  getPopularTemplates,
  getNotificationDeliveryLogs,
  createNotificationDeliveryLog,
  getPendingDeliveries,
  getFailedDeliveries,
  getPushNotificationTokens,
  createPushNotificationToken,
  getActivePushTokens,
  getNotificationUnsubscribes,
  createNotificationUnsubscribe,
  isUnsubscribed,
  getNotificationStats,
  getNotificationDashboard
} from '@/lib/notification-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'preferences'
    const category = searchParams.get('category')
    const channel = searchParams.get('channel') as string | null
    const isEnabled = searchParams.get('is_enabled')
    const isActive = searchParams.get('is_active')
    const templateType = searchParams.get('template_type') as string | null
    const isPublic = searchParams.get('is_public')
    const isSystem = searchParams.get('is_system')
    const status = searchParams.get('status') as string | null
    const platform = searchParams.get('platform')
    const email = searchParams.get('email')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'preferences': {
        const filters: any = {}
        if (category) filters.category = category
        if (channel) filters.channel = channel
        if (isEnabled !== null) filters.is_enabled = isEnabled === 'true'
        const result = await getNotificationPreferences(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'preference': {
        if (!category || !channel) {
          return NextResponse.json({ error: 'category and channel required' }, { status: 400 })
        }
        const result = await getNotificationPreference(user.id, category, channel)
        return NextResponse.json({ data: result.data })
      }

      case 'schedules': {
        const filters: any = {}
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getNotificationSchedules(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-schedule': {
        const result = await getActiveNotificationSchedule(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'templates': {
        const filters: any = {}
        if (category) filters.category = category
        if (templateType) filters.template_type = templateType
        if (isActive !== null) filters.is_active = isActive === 'true'
        if (isSystem !== null) filters.is_system = isSystem === 'true'
        const result = await getNotificationTemplates(filters)
        return NextResponse.json({ data: result.data })
      }

      case 'user-templates': {
        const result = await getUserNotificationTemplates(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'popular-templates': {
        const result = await getPopularTemplates(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'delivery-logs': {
        const filters: any = { limit }
        if (category) filters.category = category
        if (channel) filters.channel = channel
        if (status) filters.status = status
        const result = await getNotificationDeliveryLogs(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'pending-deliveries': {
        const result = await getPendingDeliveries(channel || undefined, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'failed-deliveries': {
        const result = await getFailedDeliveries(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'push-tokens': {
        const filters: any = {}
        if (platform) filters.platform = platform
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getPushNotificationTokens(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-push-tokens': {
        const result = await getActivePushTokens(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'unsubscribes': {
        const filters: any = {}
        if (category) filters.category = category
        if (channel) filters.channel = channel
        const result = await getNotificationUnsubscribes(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'is-unsubscribed': {
        if (!email || !category || !channel) {
          return NextResponse.json({ error: 'email, category, and channel required' }, { status: 400 })
        }
        const isUnsub = await isUnsubscribed(email, category, channel)
        return NextResponse.json({ data: { is_unsubscribed: isUnsub } })
      }

      case 'stats': {
        const result = await getNotificationStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getNotificationDashboard(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notification Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Notification Settings data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'create-preference': {
        const result = await createNotificationPreference(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-schedule': {
        const result = await createNotificationSchedule(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-template': {
        const result = await createNotificationTemplate(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-delivery-log': {
        const result = await createNotificationDeliveryLog(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-push-token': {
        const result = await createPushNotificationToken(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-unsubscribe': {
        const result = await createNotificationUnsubscribe(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Notification Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Notification Settings request' },
      { status: 500 }
    )
  }
}
