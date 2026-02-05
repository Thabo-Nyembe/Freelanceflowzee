/**
 * Widgets API Routes
 *
 * REST endpoints for Dashboard Widgets:
 * GET - List widgets, layouts, templates, data, analytics, stats
 * POST - Create widget, layout, template, cache data, track event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('widgets')
import {
  getWidgetsByUser,
  getVisibleWidgets,
  getWidgetsByType,
  getWidgetsByCategory,
  getWidgetsBySize,
  createWidget,
  getLayoutsByUser,
  getActiveLayout,
  createLayout,
  getAllTemplates,
  getTemplatesByCategory,
  getPremiumTemplates,
  getFreeTemplates,
  getTopRatedTemplates,
  getMostUsedTemplates,
  createTemplate,
  createWidgetFromTemplate,
  getCachedWidgetData,
  cacheWidgetData,
  getWidgetAnalytics,
  getUserWidgetAnalytics,
  trackWidgetEvent,
  getWidgetStats,
  getLayoutStats,
  getTemplateStats,
  batchUpdateWidgetPositions,
  batchUpdateWidgetVisibility,
  batchDeleteWidgets
} from '@/lib/widgets-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'widgets'
    const widgetType = searchParams.get('widget_type') as string | null
    const category = searchParams.get('category') as string | null
    const size = searchParams.get('size') as string | null
    const widgetId = searchParams.get('widget_id')
    const userId = searchParams.get('user_id')
    const visibleOnly = searchParams.get('visible_only') === 'true'
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'widgets': {
        let data
        if (visibleOnly) {
          data = await getVisibleWidgets(user.id)
        } else if (widgetType) {
          data = await getWidgetsByType(user.id, widgetType)
        } else if (category) {
          data = await getWidgetsByCategory(user.id, category)
        } else if (size) {
          data = await getWidgetsBySize(user.id, size)
        } else {
          data = await getWidgetsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'layouts': {
        const data = await getLayoutsByUser(user.id)
        return NextResponse.json({ data })
      }

      case 'active-layout': {
        const data = await getActiveLayout(user.id)
        return NextResponse.json({ data })
      }

      case 'templates': {
        let data
        if (category) {
          data = await getTemplatesByCategory(category)
        } else {
          data = await getAllTemplates()
        }
        return NextResponse.json({ data })
      }

      case 'premium-templates': {
        const data = await getPremiumTemplates()
        return NextResponse.json({ data })
      }

      case 'free-templates': {
        const data = await getFreeTemplates()
        return NextResponse.json({ data })
      }

      case 'top-rated-templates': {
        const data = await getTopRatedTemplates(limit)
        return NextResponse.json({ data })
      }

      case 'most-used-templates': {
        const data = await getMostUsedTemplates(limit)
        return NextResponse.json({ data })
      }

      case 'widget-data': {
        if (!widgetId) {
          return NextResponse.json({ error: 'widget_id required' }, { status: 400 })
        }
        const data = await getCachedWidgetData(widgetId)
        return NextResponse.json({ data })
      }

      case 'widget-analytics': {
        if (!widgetId) {
          return NextResponse.json({ error: 'widget_id required' }, { status: 400 })
        }
        const data = await getWidgetAnalytics(widgetId, days)
        return NextResponse.json({ data })
      }

      case 'user-analytics': {
        const data = await getUserWidgetAnalytics(userId || user.id, days)
        return NextResponse.json({ data })
      }

      case 'widget-stats': {
        const data = await getWidgetStats(user.id)
        return NextResponse.json({ data })
      }

      case 'layout-stats': {
        const data = await getLayoutStats(user.id)
        return NextResponse.json({ data })
      }

      case 'template-stats': {
        const data = await getTemplateStats()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Widgets API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Widgets data' },
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
      case 'create-widget': {
        const data = await createWidget(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-from-template': {
        const data = await createWidgetFromTemplate(
          user.id,
          payload.template_id,
          payload.custom_config
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-layout': {
        const data = await createLayout(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-template': {
        const data = await createTemplate({
          ...payload,
          created_by: user.id
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'cache-widget-data': {
        const data = await cacheWidgetData(
          payload.widget_id,
          payload.data,
          payload.cache_duration
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'track-event': {
        const data = await trackWidgetEvent(
          payload.widget_id,
          user.id,
          payload.event_type,
          payload.event_data
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'batch-update-positions': {
        const data = await batchUpdateWidgetPositions(payload.updates)
        return NextResponse.json({ data })
      }

      case 'batch-update-visibility': {
        const data = await batchUpdateWidgetVisibility(
          payload.widget_ids,
          payload.is_visible
        )
        return NextResponse.json({ data })
      }

      case 'batch-delete': {
        await batchDeleteWidgets(payload.widget_ids)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Widgets API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Widgets request' },
      { status: 500 }
    )
  }
}
