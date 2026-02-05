/**
 * Browser Extension API Routes
 *
 * REST endpoints for Browser Extension:
 * GET - List installations, captures, actions, sync items, analytics, stats
 * POST - Create installation, capture, action, sync item, analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('browser-extension')
import {

  getUserInstallations,
  getActiveInstallations,
  createInstallation,
  getUserCaptures,
  getCapturesByType,
  getFavoriteCaptures,
  searchCaptures,
  getCapturesByTags,
  createCapture,
  getUserActions,
  getEnabledActions,
  getMostUsedActions,
  createAction,
  getPendingSyncItems,
  getFailedSyncItems,
  getSyncQueueStats,
  addToSyncQueue,
  getUserAnalytics,
  getAnalyticsForPeriod,
  createUsageAnalytics,
  getExtensionStats
} from '@/lib/browser-extension-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'installations'
    const captureType = searchParams.get('capture_type') as string | null
    const tags = searchParams.get('tags')?.split(',')
    const search = searchParams.get('search')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const activeOnly = searchParams.get('active_only') === 'true'
    const enabledOnly = searchParams.get('enabled_only') === 'true'
    const favoritesOnly = searchParams.get('favorites_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    switch (type) {
      case 'installations': {
        const result = activeOnly
          ? await getActiveInstallations(user.id)
          : await getUserInstallations(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'captures': {
        let result
        if (favoritesOnly) {
          result = await getFavoriteCaptures(user.id)
        } else if (captureType) {
          result = await getCapturesByType(user.id, captureType, limit)
        } else if (search) {
          result = await searchCaptures(user.id, search, limit)
        } else if (tags && tags.length > 0) {
          result = await getCapturesByTags(user.id, tags)
        } else {
          result = await getUserCaptures(user.id, limit)
        }
        return NextResponse.json({ data: result.data })
      }

      case 'actions': {
        let result
        if (enabledOnly) {
          result = await getEnabledActions(user.id)
        } else {
          result = await getUserActions(user.id)
        }
        return NextResponse.json({ data: result.data })
      }

      case 'most-used-actions': {
        const result = await getMostUsedActions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'sync-queue': {
        const result = await getPendingSyncItems(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'failed-syncs': {
        const result = await getFailedSyncItems(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'sync-stats': {
        const data = await getSyncQueueStats(user.id)
        return NextResponse.json({ data })
      }

      case 'analytics': {
        let result
        if (startDate && endDate) {
          result = await getAnalyticsForPeriod(user.id, startDate, endDate)
        } else {
          result = await getUserAnalytics(user.id, limit)
        }
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const data = await getExtensionStats(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Browser Extension API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Browser Extension data' },
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
      case 'create-installation': {
        const result = await createInstallation(user.id, {
          browser: payload.browser,
          browser_version: payload.browser_version,
          extension_version: payload.extension_version,
          status: payload.status || 'active',
          device_id: payload.device_id,
          os: payload.os,
          os_version: payload.os_version,
          settings: payload.settings || {},
          enabled_features: payload.enabled_features || []
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-capture': {
        const result = await createCapture(user.id, {
          installation_id: payload.installation_id,
          capture_type: payload.capture_type,
          title: payload.title,
          url: payload.url,
          thumbnail_url: payload.thumbnail_url,
          content_url: payload.content_url,
          content_text: payload.content_text,
          file_size: payload.file_size || 0,
          viewport_width: payload.viewport_width,
          viewport_height: payload.viewport_height,
          scroll_position: payload.scroll_position,
          tags: payload.tags || [],
          notes: payload.notes,
          browser: payload.browser,
          page_title: payload.page_title,
          page_meta: payload.page_meta || {},
          sync_status: 'pending'
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-action': {
        const result = await createAction(user.id, {
          installation_id: payload.installation_id,
          action_type: payload.action_type,
          action_name: payload.action_name,
          description: payload.description,
          shortcut_key: payload.shortcut_key,
          is_enabled: payload.is_enabled ?? true,
          target_url: payload.target_url,
          action_data: payload.action_data || {},
          result_data: payload.result_data || {}
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-to-sync-queue': {
        const result = await addToSyncQueue({
          user_id: user.id,
          installation_id: payload.installation_id,
          sync_type: payload.sync_type,
          resource_id: payload.resource_id,
          resource_type: payload.resource_type,
          sync_data: payload.sync_data || {},
          sync_direction: payload.sync_direction || 'up',
          sync_status: 'pending',
          priority: payload.priority || 5,
          max_retries: payload.max_retries || 3
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-analytics': {
        const result = await createUsageAnalytics({
          user_id: user.id,
          installation_id: payload.installation_id,
          period_start: payload.period_start,
          period_end: payload.period_end,
          total_captures: payload.total_captures || 0,
          captures_by_type: payload.captures_by_type || {},
          total_actions: payload.total_actions || 0,
          actions_by_type: payload.actions_by_type || {},
          most_active_hour: payload.most_active_hour,
          most_active_day: payload.most_active_day,
          average_session_duration_minutes: payload.average_session_duration_minutes,
          average_capture_time_ms: payload.average_capture_time_ms,
          average_sync_time_ms: payload.average_sync_time_ms,
          features_used: payload.features_used || [],
          most_used_feature: payload.most_used_feature
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Browser Extension API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Browser Extension request' },
      { status: 500 }
    )
  }
}
