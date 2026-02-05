/**
 * Widgets API - Single Resource Routes
 *
 * GET - Get single widget, layout, template
 * PUT - Update widget, layout, template, toggle visibility/lock, update position/size
 * DELETE - Delete widget, layout, template, clear cache
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('widgets')
import {
  getWidget,
  updateWidget,
  deleteWidget,
  toggleWidgetVisibility,
  toggleWidgetLock,
  updateWidgetPosition,
  updateWidgetSize,
  refreshWidget,
  getLayout,
  updateLayout,
  deleteLayout,
  setActiveLayout,
  addWidgetToLayout,
  removeWidgetFromLayout,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  clearWidgetCache
} from '@/lib/widgets-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'widget'

    switch (type) {
      case 'widget': {
        const data = await getWidget(id)
        if (!data) {
          return NextResponse.json({ error: 'Widget not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'layout': {
        const data = await getLayout(id)
        if (!data) {
          return NextResponse.json({ error: 'Layout not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'template': {
        const data = await getTemplate(id)
        if (!data) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Widgets API error', { error })
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
      case 'widget': {
        if (action === 'toggle-visibility') {
          const data = await toggleWidgetVisibility(id)
          return NextResponse.json({ data })
        } else if (action === 'toggle-lock') {
          const data = await toggleWidgetLock(id)
          return NextResponse.json({ data })
        } else if (action === 'update-position') {
          const data = await updateWidgetPosition(id, updates.position_x, updates.position_y)
          return NextResponse.json({ data })
        } else if (action === 'update-size') {
          const data = await updateWidgetSize(id, updates.width, updates.height, updates.size)
          return NextResponse.json({ data })
        } else if (action === 'refresh') {
          const data = await refreshWidget(id)
          return NextResponse.json({ data })
        } else {
          const data = await updateWidget(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'layout': {
        if (action === 'set-active') {
          const data = await setActiveLayout(user.id, id)
          return NextResponse.json({ data })
        } else if (action === 'add-widget') {
          const data = await addWidgetToLayout(id, updates.widget_id)
          return NextResponse.json({ data })
        } else if (action === 'remove-widget') {
          const data = await removeWidgetFromLayout(id, updates.widget_id)
          return NextResponse.json({ data })
        } else {
          const data = await updateLayout(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'template': {
        const data = await updateTemplate(id, updates)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Widgets API error', { error })
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
    const type = searchParams.get('type') || 'widget'

    switch (type) {
      case 'widget': {
        await deleteWidget(id)
        return NextResponse.json({ success: true })
      }

      case 'layout': {
        await deleteLayout(id)
        return NextResponse.json({ success: true })
      }

      case 'template': {
        await deleteTemplate(id)
        return NextResponse.json({ success: true })
      }

      case 'widget-cache': {
        await clearWidgetCache(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Widgets API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
