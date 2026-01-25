/**
 * Profile Settings API Routes
 *
 * REST endpoints for Profile Settings:
 * GET - Profile analytics, activity logs, social connections, profile views, privacy settings, stats
 * POST - Create activity logs, connections, profile views, update privacy settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('profile-settings')
import {
  getProfileAnalytics,
  updateProfileAnalytics,
  getUserActivityLogs,
  createActivityLog,
  getActivityByType,
  getUserConnections,
  createConnection,
  getConnectionsByPlatform,
  getProfileViews,
  recordProfileView,
  getViewsByPeriod,
  getPrivacySettings,
  updatePrivacySettings,
  getProfileStats,
  getProfileGrowth
} from '@/lib/profile-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const activityType = searchParams.get('activity_type') as any
    const platform = searchParams.get('platform') as any
    const period = searchParams.get('period') as any
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'analytics': {
        const result = await getProfileAnalytics(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'activity-logs': {
        const filters: any = { limit }
        if (activityType) filters.activity_type = activityType
        const result = await getUserActivityLogs(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'activity-by-type': {
        if (!activityType) {
          return NextResponse.json({ error: 'activity_type required' }, { status: 400 })
        }
        const result = await getActivityByType(user.id, activityType)
        return NextResponse.json({ data: result.data })
      }

      case 'connections': {
        const filters: any = { limit }
        if (platform) filters.platform = platform
        const result = await getUserConnections(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'connections-by-platform': {
        if (!platform) {
          return NextResponse.json({ error: 'platform required' }, { status: 400 })
        }
        const result = await getConnectionsByPlatform(user.id, platform)
        return NextResponse.json({ data: result.data })
      }

      case 'profile-views': {
        const filters: any = { limit }
        const result = await getProfileViews(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'views-by-period': {
        if (!period) {
          return NextResponse.json({ error: 'period required' }, { status: 400 })
        }
        const result = await getViewsByPeriod(user.id, period)
        return NextResponse.json({ data: result.data })
      }

      case 'privacy-settings': {
        const result = await getPrivacySettings(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getProfileStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'growth': {
        const result = await getProfileGrowth(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Profile Settings data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Profile Settings data' },
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
      case 'update-analytics': {
        const result = await updateProfileAnalytics(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'create-activity-log': {
        const result = await createActivityLog(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-connection': {
        const result = await createConnection(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'record-profile-view': {
        const result = await recordProfileView(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-privacy-settings': {
        const result = await updatePrivacySettings(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Profile Settings request', { error })
    return NextResponse.json(
      { error: 'Failed to process Profile Settings request' },
      { status: 500 }
    )
  }
}
